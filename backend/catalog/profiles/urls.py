from django.urls import path,include

from rest_framework.routers import DefaultRouter
from .views import OverlordViewSet

router = DefaultRouter()
router.register(r'overlords', OverlordViewSet, basename='overlord')

urlpatterns = [
    path('', include(router.urls)),
]