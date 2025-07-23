from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from core.models import Post, Reaction, Comment, Whisker, Notification
from .serializers import (
    PostSerializer,
    ReactionSerializer,
    CommentSerializer,
    WhiskerSerializer,
    NotificationSerializer
)


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['overlord__name', 'content']

    def get_queryset(self):
        user_overlords = self.request.user.overlords.all()
        whiskered_ids = Whisker.objects.filter(from_overlord__in=user_overlords).values_list('to_overlord_id', flat=True)
        return Post.objects.filter(overlord__in=list(user_overlords) + list(whiskered_ids))

    def perform_create(self, serializer):
        overlord = serializer.validated_data['overlord']
        if overlord.slave != self.request.user:
            raise ValidationError("You can only post as your own overlord.")
        serializer.save()


class ReactionViewSet(viewsets.ModelViewSet):
    serializer_class = ReactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reaction.objects.all()

    def perform_create(self, serializer):
        overlord = serializer.validated_data['overlord']
        post = serializer.validated_data['post']
        if overlord.slave != self.request.user:
            raise ValidationError("You can only react with your own overlords.")
        if Reaction.objects.filter(overlord=overlord, post=post).exists():
            raise ValidationError("This overlord has already reacted to this post.")
        serializer.save()


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.all()

    def perform_create(self, serializer):
        overlord = serializer.validated_data['overlord']
        if overlord.slave != self.request.user:
            raise ValidationError("You can only comment with your own overlords.")
        serializer.save()


class WhiskerViewSet(viewsets.ModelViewSet):
    serializer_class = WhiskerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Whisker.objects.filter(from_overlord__slave=self.request.user)

    def perform_create(self, serializer):
        from_overlord = serializer.validated_data['from_overlord']
        to_overlord = serializer.validated_data['to_overlord']
        if from_overlord.slave != self.request.user:
            raise ValidationError("You can only whisker from your own overlords.")
        if from_overlord == to_overlord:
            raise ValidationError("An overlord cannot whisker itself.")
        if Whisker.objects.filter(from_overlord=from_overlord, to_overlord=to_overlord).exists():
            raise ValidationError("This whiskering already exists.")
        serializer.save()


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(overlord__slave=self.request.user)

    def perform_update(self, serializer):
        overlord = serializer.instance.overlord
        if overlord.slave != self.request.user:
            raise ValidationError("You can only update your own notifications.")
        serializer.save()

