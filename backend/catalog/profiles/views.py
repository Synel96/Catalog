from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from core.models import Overlord
from .serializers import OverlordSerializer
from rest_framework.exceptions import ValidationError


class OverlordViewSet(viewsets.ModelViewSet):
    serializer_class = OverlordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'breed', 'slave__username']

    def get_queryset(self):
        return Overlord.objects.filter(slave=self.request.user)

    def perform_create(self, serializer):
        overlord_count = Overlord.objects.filter(slave=self.request.user).count()
        if overlord_count >= 10:
            raise ValidationError("You can't create more than 10 overlords.")
        serializer.save(slave=self.request.user)

