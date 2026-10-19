from rest_framework import viewsets, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import Count, Q

from core.models import Post, Reaction, Comment, CommentHeart, Whisker, Notification, Overlord
from .serializers import (
    PostSerializer,
    ReactionSerializer,
    CommentSerializer,
    WhiskerSerializer,
    NotificationSerializer,
)
from authapp.authentication import CookieJWTAuthentication
from .pagination import FeedCursorPagination


def notify(actor, target, message, link=None):
    """Notify `target` (an overlord) about something `actor` did.

    Skipped when both overlords belong to the same slave: nobody needs to
    be told that they reacted to their own cat's post.
    """
    if actor.slave_id == target.slave_id:
        return
    Notification.objects.create(overlord=target, message=message[:255], link=link)


def quote(comment):
    """A comment as shown in notifications: its text, shortened, in quotes;
    a picture-only comment as a camera."""
    text = comment.content.strip()
    if not text:
        return "\U0001F4F7"
    return f"\u201c{text if len(text) <= 60 else text[:57] + '...'}\u201d"


def overlord_link(overlord):
    # Frontend profile route (frontend/catalog/components/street/links.ts).
    return f"/overlord?id={overlord.id}"


class ActingOverlordMixin:
    """Passes `?overlord=<id>` to the serializer when it's one of the user's
    overlords: the one out on the Street, whose reaction / hearts are
    flagged in the response. Anything else is ignored."""

    def get_serializer_context(self):
        context = super().get_serializer_context()
        value = self.request.query_params.get("overlord", "")
        if value.isdigit() and self.request.user.overlords.filter(pk=value).exists():
            context["acting_overlord_id"] = int(value)
        return context


def with_feed_data(posts):
    """Loads what PostSerializer shows in a fixed number of queries, however
    many posts there are: the author in a join, the comment count as an
    annotation, all reactions in one prefetch (summary and `my_reaction`
    are counted from it in Python)."""
    return (
        posts.select_related("overlord")
        .annotate(comment_count=Count("comments", distinct=True))
        .prefetch_related("reactions")
    )


class PostViewSet(ActingOverlordMixin, viewsets.ModelViewSet):
    serializer_class = PostSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["overlord__name", "content"]
    pagination_class = FeedCursorPagination

    def get_queryset(self):
        # The user's own overlords' posts and those of the overlords they
        # whisker, as subqueries (no join, so no duplicate rows).
        user = self.request.user
        own = Overlord.objects.filter(slave=user).values("id")
        whiskered = Whisker.objects.filter(from_overlord__slave=user).values("to_overlord_id")
        posts = Post.objects.filter(Q(overlord_id__in=own) | Q(overlord_id__in=whiskered))
        return with_feed_data(posts)

    def perform_create(self, serializer):
        overlord = serializer.validated_data["overlord"]
        if overlord.slave != self.request.user:
            raise ValidationError("You can only post as your own overlords.")

        post = serializer.save()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "feed_updates",
            {
                "type": "send_post_update",
                "message": "New post created",
                "overlord": overlord.id,
                "post_id": post.id,
            },
        )

    def perform_update(self, serializer):
        if serializer.instance.overlord.slave != self.request.user:
            raise ValidationError("You can only edit posts from your own overlords.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.overlord.slave != self.request.user:
            raise ValidationError("You can only delete posts from your own overlords.")
        instance.delete()

    @action(detail=False, methods=["get"], url_path="by-overlord/(?P<pk>[^/.]+)")
    def by_overlord(self, request, pk=None):
        posts = with_feed_data(Post.objects.filter(overlord__id=pk))
        page = self.paginate_queryset(posts)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class ReactionViewSet(viewsets.ModelViewSet):
    serializer_class = ReactionSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reaction.objects.filter(overlord__slave=self.request.user)

    def perform_create(self, serializer):
        overlord = serializer.validated_data["overlord"]
        post = serializer.validated_data["post"]
        if overlord.slave != self.request.user:
            raise ValidationError("You can only react with your own overlords.")
        if Reaction.objects.filter(overlord=overlord, post=post).exists():
            raise ValidationError("This overlord has already reacted to this post.")
        serializer.save()

    def perform_update(self, serializer):
        if serializer.instance.overlord.slave != self.request.user:
            raise ValidationError("You can only modify your own reactions.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.overlord.slave != self.request.user:
            raise ValidationError("You can only delete your own reactions.")
        instance.delete()

   


class ReactionCountByPostView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        post_id = request.query_params.get("post_id")
        if not post_id:
            return Response({"error": "Missing post_id"}, status=400)

        reactions = Reaction.objects.filter(post_id=post_id) \
            .values('type') \
            .annotate(count=Count('type'))

        result = {item['type']: item['count'] for item in reactions}
        return Response(result)


class CommentViewSet(ActingOverlordMixin, viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # ?post=<id> lists everyone's comments under that post (oldest first,
        # like a conversation); otherwise only the user's own comments.
        post_id = self.request.query_params.get("post")
        if self.action == "list" and post_id:
            return (
                Comment.objects.filter(post_id=post_id)
                .select_related("overlord")
                .order_by("created_at")
            )
        return Comment.objects.filter(overlord__slave=self.request.user)

    def perform_create(self, serializer):
        overlord = serializer.validated_data["overlord"]
        if overlord.slave != self.request.user:
            raise ValidationError("You can only comment with your own overlords.")
        comment = serializer.save()

        notify(
            overlord,
            comment.post.overlord,
            f"{overlord.name} commented on your post: {quote(comment)}",
            overlord_link(comment.post.overlord),
        )

    @action(detail=True, methods=["post"], url_path="heart")
    def heart(self, request, pk=None):
        """Toggles `overlord_id`'s heart on any comment (not only the user's
        own, unlike the rest of this viewset's detail routes)."""
        comment = Comment.objects.filter(pk=pk).select_related("overlord").first()
        if comment is None:
            return Response({"detail": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)
        overlord = Overlord.objects.filter(
            pk=request.data.get("overlord_id"), slave=request.user
        ).first()
        if overlord is None:
            raise ValidationError({"overlord_id": "Heart with one of your own overlords."})

        heart, created = CommentHeart.objects.get_or_create(overlord=overlord, comment=comment)
        if not created:
            heart.delete()
        else:
            notify(
                overlord,
                comment.overlord,
                f"{overlord.name} hearted your comment: {quote(comment)}",
                overlord_link(comment.post.overlord),
            )
        return Response({"hearted": created, "heart_count": comment.hearts.count()})

    def perform_update(self, serializer):
        if serializer.instance.overlord.slave != self.request.user:
            raise ValidationError("You can only modify your own comments.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.overlord.slave != self.request.user:
            raise ValidationError("You can only delete your own comments.")
        instance.delete()


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Notification.objects.filter(overlord__slave=self.request.user)
        # `?overlord=<id>` narrows the list (and mark-all-read) to one cat:
        # the frontend shows the notifications of the overlord on the Street.
        overlord = self.request.query_params.get("overlord")
        if overlord is not None:
            if not overlord.isdigit():
                raise ValidationError({"overlord": "Must be an overlord id."})
            queryset = queryset.filter(overlord_id=overlord)
        return queryset.order_by("-created_at")

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"updated": updated})

    def perform_create(self, serializer):
        overlord = serializer.validated_data.get("overlord")
        if overlord.slave != self.request.user:
            raise ValidationError("You can only create notifications for your own overlords.")
        serializer.save()

    def perform_update(self, serializer):
        if serializer.instance.overlord.slave != self.request.user:
            raise ValidationError("You can only update your own notifications.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.overlord.slave != self.request.user:
            raise ValidationError("You can only delete your own notifications.")
        instance.delete()


class WhiskerViewSet(viewsets.ModelViewSet):
    serializer_class = WhiskerSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Whisker.objects.filter(from_overlord__slave=self.request.user)

    def perform_create(self, serializer):
        from_overlord = serializer.validated_data["from_overlord"]
        to_overlord = serializer.validated_data["to_overlord"]
        if from_overlord.slave != self.request.user:
            raise ValidationError("You can only whisker from your own overlords.")
        if from_overlord == to_overlord:
            raise ValidationError("An overlord cannot whisker itself.")
        if Whisker.objects.filter(from_overlord=from_overlord, to_overlord=to_overlord).exists():
            raise ValidationError("This whiskering already exists.")
        serializer.save()
        notify(
            from_overlord,
            to_overlord,
            f"{from_overlord.name} started whiskering {to_overlord.name}.",
            overlord_link(from_overlord),
        )

    @action(detail=False, methods=["get"], url_path="status")
    def check_whisker_status(self, request):
        from_id = request.query_params.get("from")
        to_id = request.query_params.get("to")
        if not from_id or not to_id:
            return Response({"detail": "Missing parameters."}, status=400)

        exists = Whisker.objects.filter(from_overlord_id=from_id, to_overlord_id=to_id).exists()
        return Response({"exists": exists})

    @action(detail=False, methods=["delete"], url_path="remove")
    def remove_whisker(self, request):
        from_id = request.query_params.get("from")
        to_id = request.query_params.get("to")

        if not from_id or not to_id:
            return Response({"detail": "Missing parameters."}, status=400)

        try:
            whisker = Whisker.objects.get(
                from_overlord__id=from_id,
                to_overlord__id=to_id,
                from_overlord__slave=request.user
            )
            whisker.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Whisker.DoesNotExist:
            return Response({"detail": "Whisker not found."}, status=404)



class ToggleReactionAPIView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        overlord_id = request.data.get("overlord_id")
        post_id = request.data.get("post_id")
        reaction_type = request.data.get("type")

        if not overlord_id or not post_id or not reaction_type:
            return Response({"error": "Missing parameters"}, status=400)

        try:
            overlord = Overlord.objects.get(id=overlord_id, slave=request.user)
        except Overlord.DoesNotExist:
            return Response({"error": "Invalid overlord"}, status=403)

        try:
            existing = Reaction.objects.get(post_id=post_id, overlord=overlord)
            if existing.type == reaction_type:
                existing.delete()
                return Response({"status": "unreacted"})
            else:
                existing.type = reaction_type
                existing.save()
                return Response({"status": "updated"})
        except Reaction.DoesNotExist:
            reaction = Reaction.objects.create(
                post_id=post_id, overlord=overlord, type=reaction_type
            )
            # Only a new reaction notifies; switching or taking one back doesn't.
            label = dict(Reaction.REACTION_CHOICES).get(reaction_type, reaction_type)
            notify(
                overlord,
                reaction.post.overlord,
                f"{overlord.name} reacted {label} to your post.",
                overlord_link(reaction.post.overlord),
            )
            return Response({"status": "reacted"})