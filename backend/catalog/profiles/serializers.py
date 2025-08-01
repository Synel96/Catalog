from rest_framework import serializers
from core.models import Overlord
from django.contrib.auth import get_user_model

User = get_user_model()

class OverlordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Overlord
        fields = ['id', 'name', 'avatar', 'bio', 'breed', 'slave']
        read_only_fields = ['id', 'slave']


class UserSerializer(serializers.ModelSerializer):

    overlords = OverlordSerializer(many=True, read_only=True)
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'bio',
            'avatar',
            'date_joined',
            'overlords',
        ]
        read_only_fields = ['id', 'date_joined', 'overlords']

    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return request.build_absolute_uri(obj.avatar.url)
        return None  
