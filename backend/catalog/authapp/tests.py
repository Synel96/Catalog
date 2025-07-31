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

    def test_login_sets_cookies(self):
        url = reverse('cookie_login')
        response = self.client.post(url, {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.cookies)
        self.assertIn('refresh', response.cookies)

    def test_login_fail_wrong_password(self):
        url = reverse('cookie_login')
        response = self.client.post(url, {
            'username': 'testuser',
            'password': 'wrongpass'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('access', response.cookies)

    def test_register_sets_cookies(self):
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpassword123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())
        self.assertIn('access', response.cookies)
        self.assertIn('refresh', response.cookies)

    def test_register_duplicate_username(self):
        url = reverse('register')
        data = {
            'username': 'testuser',
            'email': 'another@example.com',
            'password': 'somepass123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        url = reverse('register')
        data = {
            'username': 'uniqueuser',
            'email': 'testuser@example.com',
            'password': 'pass12345'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_refresh_cookie_returns_new_access(self):
        login_url = reverse('cookie_login')
        refresh_url = reverse('refresh_cookie')

        login_response = self.client.post(login_url, {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        # Másoljuk át a refresh sütit
        self.client.cookies['refresh'] = login_response.cookies['refresh'].value

        refresh_response = self.client.post(refresh_url)
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.cookies)

    def test_refresh_cookie_fails_without_cookie(self):
        url = reverse('refresh_cookie')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_deletes_cookies(self):
        login_url = reverse('cookie_login')
        logout_url = reverse('logout')

        login_response = self.client.post(login_url, {
            'username': 'testuser',
            'password': 'testpass123'
        })

        # Állítsuk be a sütiket a kliensre
        self.client.cookies['access'] = login_response.cookies['access'].value
        self.client.cookies['refresh'] = login_response.cookies['refresh'].value

        # Hívjuk meg a logout endpointot
        logout_response = self.client.post(logout_url)

        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        self.assertEqual(logout_response.cookies['access']['max-age'], 0)
        self.assertEqual(logout_response.cookies['refresh']['max-age'], 0)
