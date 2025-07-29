from rest_framework import viewsets, permissions, filters
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User

from core.models import Overlord
from .serializers import OverlordSerializer, UserSerializer


class OverlordViewSet(viewsets.ModelViewSet):
    serializer_class = OverlordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'breed', 'slave__username']

    def get_queryset(self):
        return Overlord.objects.filter(slave=self.request.user)

    def perform_create(self, serializer):
        if Overlord.objects.filter(slave=self.request.user).count() >= 10:
            raise ValidationError("You can't create more than 10 overlords.")
        serializer.save(slave=self.request.user)


class MeViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)
