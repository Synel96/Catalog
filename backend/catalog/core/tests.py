from django.test import TestCase
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomUserManagerTests(TestCase):
    def test_create_user_success(self):
        user = User.objects.create_user(
            username='slave1',
            email='slave1@example.com',
            password='testpass123'
        )
        self.assertEqual(user.username, 'slave1')
        self.assertEqual(user.email, 'slave1@example.com')
        self.assertTrue(user.check_password('testpass123'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_user_missing_email(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(username='slave2', email='', password='testpass123')

    def test_create_superuser_success(self):
        admin = User.objects.create_superuser(
            username='adminslave',
            email='admin@example.com',
            password='adminpass123'
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_create_superuser_not_staff(self):
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                username='notstaff',
                email='notstaff@example.com',
                password='pass123',
                is_staff=False
            )

    def test_create_superuser_not_superuser(self):
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                username='notadmin',
                email='notadmin@example.com',
                password='pass123',
                is_superuser=False
            )


