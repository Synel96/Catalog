from django.urls import path,include

from rest_framework.routers import DefaultRouter
from .views import OverlordViewSet,MeViewSet

router = DefaultRouter()
router.register(r'overlords', OverlordViewSet, basename='overlord')
router.register(r"me", MeViewSet, basename="me")


urlpatterns = [
    path('', include(router.urls)),
]