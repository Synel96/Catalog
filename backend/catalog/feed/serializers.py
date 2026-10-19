from rest_framework import serializers
from django.db.models import Count
from core.models import Post, Reaction, Comment, Whisker, Notification



def acting_overlord_id(serializer):
    # The user's overlord out on the Street (`?overlord=<id>`, resolved by
    # the view), whose own reaction / hearts get flagged.
    return serializer.context.get("acting_overlord_id")


class PostSerializer(serializers.ModelSerializer):
    overlord_name = serializers.CharField(source='overlord.name', read_only=True)
    overlord_avatar = serializers.ImageField(source='overlord.avatar', read_only=True)
    reaction_summary = serializers.SerializerMethodField()
    my_reaction = serializers.SerializerMethodField()
    comment_count = serializers.IntegerField(source="comments.count", read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)


    def get_reaction_summary(self, obj):
        summary = obj.reactions.values('type').annotate(count=Count('id'))
        return {item['type']: item['count'] for item in summary}

    def get_my_reaction(self, obj):
        overlord_id = acting_overlord_id(self)
        if overlord_id is None:
            return None
        return obj.reactions.filter(overlord_id=overlord_id).values_list('type', flat=True).first()


    class Meta:
        model = Post
        fields = ['id', 'overlord', 'overlord_name', 'overlord_avatar', 'content', 'image', 'created_at', 'reaction_summary', 'my_reaction', 'comment_count']


class ReactionSerializer(serializers.ModelSerializer):
    overlord_name = serializers.CharField(source='overlord.name', read_only=True)

    class Meta:
        model = Reaction
        fields = ['id', 'overlord', 'overlord_name', 'post', 'type', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    overlord_name = serializers.CharField(source='overlord.name', read_only=True)
    heart_count = serializers.IntegerField(source='hearts.count', read_only=True)
    hearted = serializers.SerializerMethodField()

    def get_hearted(self, obj):
        overlord_id = acting_overlord_id(self)
        return overlord_id is not None and obj.hearts.filter(overlord_id=overlord_id).exists()

    class Meta:
        model = Comment
        fields = [
            'id', 'overlord', 'overlord_name', 'post', 'content', 'created_at',
            'heart_count', 'hearted',
        ]


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
