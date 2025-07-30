from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

User = get_user_model()

class AuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpass123'
        )

    def test_login_successful(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_fail_wrong_password(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {
            'username': 'testuser',
            'password': 'wrongpass'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        login_url = reverse('token_obtain_pair')
        refresh_url = reverse('token_refresh')

        login_response = self.client.post(login_url, {
            'username': 'testuser',
            'password': 'testpass123'
        })

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        refresh_token = login_response.data['refresh']

        refresh_response = self.client.post(refresh_url, {
            'refresh': refresh_token
        })

        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)

    def test_register_successful(self):
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpassword123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_duplicate_username(self):
        url = reverse('register')
        data = {
            'username': 'testuser',  # már létező felhasználó
            'email': 'other@example.com',
            'password': 'somepass123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        url = reverse('register')
        data = {
            'username': 'uniqueuser',
            'email': 'testuser@example.com',  # már létező email
            'password': 'pass12345'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
