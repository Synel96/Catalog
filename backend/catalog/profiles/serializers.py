from rest_framework import serializers
from core.models import Overlord  

class OverlordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Overlord
        fields = ['id', 'name', 'avatar', 'bio', 'breed', 'slave']
        read_only_fields = ['id', 'slave']