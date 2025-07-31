from rest_framework import viewsets, permissions, filters, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import OverlordSerializer, UserSerializer
from core.models import Overlord
from authapp.authentication import CookieJWTAuthentication

User = get_user_model()


class OverlordViewSet(viewsets.ModelViewSet):
    serializer_class = OverlordSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'breed', 'slave__username']

    def get_queryset(self):
       
        return Overlord.objects.filter(slave=self.request.user)

    def perform_create(self, serializer):
       
        if Overlord.objects.filter(slave=self.request.user).count() >= 10:
            raise ValidationError("You can't create more than 10 overlords.")
        serializer.save(slave=self.request.user)

    def perform_update(self, serializer):
        
        if serializer.instance.slave != self.request.user:
            raise ValidationError("You can only edit your own overlords.")
        serializer.save()

    def perform_destroy(self, instance):
        
        if instance.slave != self.request.user:
            raise ValidationError("You can only delete your own overlords.")
        instance.delete()


class MeView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request):
        request.user.delete()
        return Response({"detail": "Your account has been deleted."}, status=status.HTTP_204_NO_CONTENT)
