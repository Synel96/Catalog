from rest_framework import serializers
from core.models import Overlord 
from django.contrib.auth.models import User 

class OverlordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Overlord
        fields = ['id', 'name', 'avatar', 'bio', 'breed', 'slave']
        read_only_fields = ['id', 'slave']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']