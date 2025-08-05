from rest_framework import serializers
from core.models import Overlord
from django.contrib.auth import get_user_model

User = get_user_model()

class OverlordSerializer(serializers.ModelSerializer):
    slave_name = serializers.CharField(source="slave.username", read_only=True)
    whiskered_by_count = serializers.IntegerField(read_only=True)
    whiskering_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Overlord
        fields = [
            "id",
            "name",
            "avatar",
            "bio",
            "breed",
            "slave",
            "slave_name",
            "whiskered_by_count",
            "whiskering_count",
        ]
        read_only_fields = ["id", "slave"]


class UserSerializer(serializers.ModelSerializer):

    overlords = OverlordSerializer(many=True, read_only=True)
    
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

    
