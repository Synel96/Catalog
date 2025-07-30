from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import Overlord

User = get_user_model()

class OverlordViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='slave1', password='testpass123')
        self.user2 = User.objects.create_user(username='slave2', password='testpass456')

        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')

    def test_create_overlord(self):
        response = self.client.post('/api/profiles/overlords/', {
            'name': 'Andor',
            'bio': 'I rule this realm.',
            'breed': 'Sphynx'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Overlord.objects.count(), 1)
        self.assertEqual(Overlord.objects.first().slave, self.user)

    def test_list_only_own_overlords(self):
        Overlord.objects.create(name='Mine', slave=self.user)
        Overlord.objects.create(name='NotMine', slave=self.user2)
        response = self.client.get('/api/profiles/overlords/')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Mine')

    def test_create_overlord_limit(self):
        for i in range(10):
            Overlord.objects.create(name=f'C{i}', slave=self.user)
        response = self.client.post('/api/profiles/overlords/', {
            'name': 'TooMuch'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('You can\'t create more than 10 overlords.', str(response.data))

    def test_user_cannot_access_others_overlord(self):
        other = Overlord.objects.create(name='Secret', slave=self.user2)
        url = f'/api/profiles/overlords/{other.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_current_user_profile(self):
        response = self.client.get('/api/profiles/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertIn('id', response.data)
        self.assertNotIn('password', response.data)