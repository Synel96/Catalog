from rest_framework import viewsets, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import Count

from core.models import Post, Reaction, Comment, Whisker, Notification, Overlord
from .serializers import (
    PostSerializer,
    ReactionSerializer,
    CommentSerializer,
    WhiskerSerializer,
    NotificationSerializer,
)
from authapp.authentication import CookieJWTAuthentication


def notify(actor, target, message, link=None):
    """Notify `target` (an overlord) about something `actor` did.

    Skipped when both overlords belong to the same slave: nobody needs to
    be told that they reacted to their own cat's post.
    """
    if actor.slave_id == target.slave_id:
        return
    Notification.objects.create(overlord=target, message=message[:255], link=link)


def overlord_link(overlord):
    # Frontend profile route (frontend/catalog/components/street/links.ts).
    return f"/overlord?id={overlord.id}"


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["overlord__name", "content"]

    def get_queryset(self):
        user_overlords = self.request.user.overlords.all()
        whiskered_ids = Whisker.objects.filter(
            from_overlord__in=user_overlords
        ).values_list("to_overlord_id", flat=True)
        whiskered_overlords = Overlord.objects.filter(pk__in=whiskered_ids)

        return Post.objects.filter(
            overlord__in=list(user_overlords) + list(whiskered_overlords)
        ).order_by("-created_at")

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
        posts = Post.objects.filter(overlord__id=pk).order_by("-created_at")
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)


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


class CommentViewSet(viewsets.ModelViewSet):
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

        snippet = comment.content if len(comment.content) <= 60 else f"{comment.content[:57]}..."
        notify(
            overlord,
            comment.post.overlord,
            f"{overlord.name} commented on your post: \u201c{snippet}\u201d",
            overlord_link(comment.post.overlord),
        )

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