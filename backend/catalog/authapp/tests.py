from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

class AuthTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')

    def test_login_successful(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': 'testuser', 'password': 'testpass123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_fail_wrong_password(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': 'testuser', 'password': 'wrongpass'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        login_url = reverse('token_obtain_pair')
        refresh_url = reverse('token_refresh')
        login_response = self.client.post(login_url, {'username': 'testuser', 'password': 'testpass123'})
        refresh_token = login_response.data['refresh']

        response = self.client.post(refresh_url, {'refresh': refresh_token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
