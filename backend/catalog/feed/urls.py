from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PostViewSet,
    ReactionViewSet,
    CommentViewSet,
    WhiskerViewSet,
    NotificationViewSet
)

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'reactions', ReactionViewSet, basename='reaction')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'whiskers', WhiskerViewSet, basename='whisker')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
