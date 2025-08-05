from rest_framework import viewsets, permissions, filters
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


class ReactionViewSet(viewsets.ModelViewSet):
    serializer_class = ReactionSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # csak azok a reakciók, amiket a user saját overlordjaikkal adtak
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
        overlord = serializer.instance.overlord
        if overlord.slave != self.request.user:
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
        overlord = serializer.instance.overlord
        if overlord.slave != self.request.user:
            raise ValidationError("You can only modify your own comments.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.overlord.slave != self.request.user:
            raise ValidationError("You can only delete your own comments.")
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

    def perform_destroy(self, instance):
        if instance.from_overlord.slave != self.request.user:
            raise ValidationError("You can only delete your own whiskerings.")
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
        overlord = serializer.instance.overlord
        if overlord.slave != self.request.user:
            raise ValidationError("You can only update your own notifications.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.overlord.slave != self.request.user:
            raise ValidationError("You can only delete your own notifications.")
        instance.delete()
