from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.reverse import reverse
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import Overlord, Post, Reaction, Comment, Whisker, Notification

User = get_user_model()

class FeedTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.overlord = Overlord.objects.create(name='Whiskers', slave=self.user)
        self.post = Post.objects.create(overlord=self.overlord, content='Hello world!')
        self.notification = Notification.objects.create(overlord=self.overlord, message='Test notification')

        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    # Post tests
    def test_create_post(self):
        url = reverse('post-list')
        response = self.client.post(url, {'overlord': self.overlord.id, 'content': 'New post'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_posts(self):
        url = reverse('post-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # Reaction tests
    def test_create_reaction(self):
        url = reverse('reaction-list')
        response = self.client.post(url, {
            'overlord': self.overlord.id,
            'post': self.post.id,
            'type': 'purrfect'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # Comment tests
    def test_create_comment(self):
        url = reverse('comment-list')
        response = self.client.post(url, {
            'overlord': self.overlord.id,
            'post': self.post.id,
            'content': 'Nice post!'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # Whiskering tests
    def test_create_whisker(self):
        another_user = User.objects.create_user(username='other', password='testpass123')
        target_overlord = Overlord.objects.create(name='Shadow', slave=another_user)
        url = reverse('whisker-list')
        response = self.client.post(url, {
            'from_overlord': self.overlord.id,
            'to_overlord': target_overlord.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # Notification tests
    def test_list_notifications(self):
        url = reverse('notification-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_mark_notification_read(self):
        url = reverse('notification-detail', args=[self.notification.id])
        response = self.client.patch(url, {'is_read': True})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)
