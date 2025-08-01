from django.urls import path
from .views import (
    CookieLoginView,
    RegisterAPIView,
    CookieTokenRefreshView,
    CookieLogoutView,
)

urlpatterns = [
    path('login/', CookieLoginView.as_view(), name='cookie_login'),
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('refresh/', CookieTokenRefreshView.as_view(), name='refresh_cookie'),
    path('logout/', CookieLogoutView.as_view(), name='logout'),
]
