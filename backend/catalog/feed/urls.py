from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PostViewSet,
    ReactionViewSet,
    CommentViewSet,
    WhiskerViewSet,
    NotificationViewSet,
    ReactionCountByPostView,
    ToggleReactionAPIView
)

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'reactions', ReactionViewSet, basename='reaction')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'whiskers', WhiskerViewSet, basename='whisker')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    path("feed/reactions/toggle/", ToggleReactionAPIView.as_view(), name="toggle-reaction"),
    path("reactions/by-post/", ReactionCountByPostView.as_view(), name="reaction-by-post"),


]
