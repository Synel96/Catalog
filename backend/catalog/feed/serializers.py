from collections import Counter

from rest_framework import serializers
from core.models import Post, Reaction, Comment, Whisker, Notification



def acting_overlord_id(serializer):
    # The user's overlord out on the Street (`?overlord=<id>`, resolved by
    # the view), whose own reaction / hearts get flagged.
    return serializer.context.get("acting_overlord_id")


def require_text_or_picture(serializer, attrs):
    """Posts and comments need text, a picture or both. On an edit, what
    isn't sent stays as it was."""
    content = attrs.get('content', getattr(serializer.instance, 'content', '')) or ''
    image = attrs.get('image', getattr(serializer.instance, 'image', None))
    if not content.strip() and not image:
        raise serializers.ValidationError({'content': 'Write something or add a picture.'})
    return attrs


class PostSerializer(serializers.ModelSerializer):
    overlord_name = serializers.CharField(source='overlord.name', read_only=True)
    overlord_avatar = serializers.ImageField(source='overlord.avatar', read_only=True)
    reaction_summary = serializers.SerializerMethodField()
    my_reaction = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)

    def validate(self, attrs):
        return require_text_or_picture(self, attrs)

    # The feed views prefetch reactions and annotate `comment_count` (see
    # feed.views.with_feed_data); a single post (create, update) queries.
    def get_reaction_summary(self, obj):
        return dict(Counter(reaction.type for reaction in obj.reactions.all()))

    def get_my_reaction(self, obj):
        overlord_id = acting_overlord_id(self)
        if overlord_id is None:
            return None
        return next(
            (r.type for r in obj.reactions.all() if r.overlord_id == overlord_id), None
        )

    def get_comment_count(self, obj):
        count = getattr(obj, "comment_count", None)
        return obj.comments.count() if count is None else count


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
    image = serializers.ImageField(required=False, allow_null=True)

    def validate(self, attrs):
        return require_text_or_picture(self, attrs)

    def get_hearted(self, obj):
        overlord_id = acting_overlord_id(self)
        return overlord_id is not None and obj.hearts.filter(overlord_id=overlord_id).exists()

    class Meta:
        model = Comment
        fields = [
            'id', 'overlord', 'overlord_name', 'post', 'content', 'image', 'created_at',
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
