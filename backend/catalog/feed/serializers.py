from rest_framework import serializers
from django.db.models import Count
from core.models import Post, Reaction, Comment, Whisker, Notification



class PostSerializer(serializers.ModelSerializer):
    overlord_name = serializers.CharField(source='overlord.name', read_only=True)
    overlord_avatar = serializers.ImageField(source='overlord.avatar', read_only=True)
    reaction_summary = serializers.SerializerMethodField()

    def get_reaction_summary(self, obj):
        return (
            obj.reactions.values('type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

    class Meta:
        model = Post
        fields = ['id', 'overlord', 'overlord_name', 'overlord_avatar', 'content', 'image', 'created_at','reaction_summary']


class ReactionSerializer(serializers.ModelSerializer):
    overlord_name = serializers.CharField(source='overlord.name', read_only=True)

    class Meta:
        model = Reaction
        fields = ['id', 'overlord', 'overlord_name', 'post', 'type', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    overlord_name = serializers.CharField(source='overlord.name', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'overlord', 'overlord_name', 'post', 'content', 'created_at']


class WhiskerSerializer(serializers.ModelSerializer):
    from_overlord_name = serializers.CharField(source='from_overlord.name', read_only=True)
    to_overlord_name = serializers.CharField(source='to_overlord.name', read_only=True)

    class Meta:
        model = Whisker
        fields = ['id', 'from_overlord', 'from_overlord_name', 'to_overlord', 'to_overlord_name', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    overlord_name = serializers.CharField(source='overlord.name', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'overlord', 'overlord_name', 'message', 'link', 'is_read', 'created_at']
