from rest_framework import serializers
from core.models import Overlord
from django.contrib.auth import get_user_model

User = get_user_model()

class OverlordSerializer(serializers.ModelSerializer):
    slave_name = serializers.CharField(source="slave.username", read_only=True)
    whiskered_by_count = serializers.SerializerMethodField()
    whiskering_count = serializers.SerializerMethodField()
    whiskered_by_names = serializers.SerializerMethodField()
    whiskering_names = serializers.SerializerMethodField()

    class Meta:
        model = Overlord
        fields = [
            "id",
            "name",
            "avatar",
            "bio",
            "breed",
            "title",
            "slave",
            "slave_name",
            "whiskered_by_count",
            "whiskering_count",
            "whiskered_by_names",
            "whiskering_names",
        ]
        read_only_fields = ["id", "slave"]

    def get_whiskered_by_count(self, obj):
        return obj.whiskered_by.count()

    def get_whiskering_count(self, obj):
        return obj.whiskering.count()

    def get_whiskered_by_names(self, obj):
        return [w.from_overlord.name for w in obj.whiskered_by.all()]

    def get_whiskering_names(self, obj):
        return [w.to_overlord.name for w in obj.whiskering.all()]


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

    
