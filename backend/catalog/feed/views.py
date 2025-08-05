from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from core.models import Post, Reaction, Comment, Whisker, Notification, Overlord
from .serializers import (
    PostSerializer,
    ReactionSerializer,
    CommentSerializer,
    WhiskerSerializer,
    NotificationSerializer,
)
from authapp.authentication import CookieJWTAuthentication


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
        return Post.objects.filter(overlord__in=list(user_overlords) + list(whiskered_overlords))

    def perform_create(self, serializer):
        overlord = serializer.validated_data["overlord"]
        if overlord.slave != self.request.user:
            raise ValidationError("You can only post as your own overlords.")
        serializer.save()

    @action(detail=False, methods=["get"], url_path="by-overlord/(?P<pk>[^/.]+)")
    def by_overlord(self, request, pk=None):
        posts = Post.objects.filter(overlord__id=pk)
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


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(overlord__slave=self.request.user)

    def perform_create(self, serializer):
        overlord = serializer.validated_data["overlord"]
        if overlord.slave != self.request.user:
            raise ValidationError("You can only comment with your own overlords.")
        serializer.save()

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
        return Notification.objects.filter(overlord__slave=self.request.user)

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