from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.reverse import reverse
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import Overlord, Post, Reaction, Comment, Whisker, Notification

User = get_user_model()

def login(client, user):
    # The feed views authenticate with the HttpOnly `access` cookie
    # (authapp.authentication.CookieJWTAuthentication), not a Bearer header.
    client.cookies['access'] = str(RefreshToken.for_user(user).access_token)


class FeedTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com', password='testpass123'
        )
        self.overlord = Overlord.objects.create(name='Whiskers', slave=self.user)
        self.post = Post.objects.create(overlord=self.overlord, content='Hello world!')
        self.notification = Notification.objects.create(overlord=self.overlord, message='Test notification')

        login(self.client, self.user)

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
        another_user = User.objects.create_user(
            username='other', email='other@example.com', password='testpass123'
        )
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


class CommentAndNotificationTests(APITestCase):
    """Comments under a post, and notifications for another slave's activity."""

    def setUp(self):
        self.me = User.objects.create_user(username='me', email='me@example.com', password='pw')
        self.other = User.objects.create_user(
            username='other', email='other@example.com', password='pw'
        )
        self.mirci = Overlord.objects.create(name='Mirci', slave=self.me)
        self.cirmi = Overlord.objects.create(name='Cirmi', slave=self.me)
        self.garfield = Overlord.objects.create(name='Garfield', slave=self.other)
        self.post = Post.objects.create(overlord=self.mirci, content='Sunbeam acquired.')
        login(self.client, self.other)

    def notifications(self):
        return Notification.objects.filter(overlord=self.mirci)

    def test_comment_list_by_post_includes_everyones_comments(self):
        Comment.objects.create(overlord=self.mirci, post=self.post, content='first')
        Comment.objects.create(overlord=self.garfield, post=self.post, content='second')

        by_post = self.client.get(reverse('comment-list'), {'post': self.post.id})
        self.assertEqual([c['content'] for c in by_post.data], ['first', 'second'])

        # Without ?post= the list stays limited to the user's own comments.
        own = self.client.get(reverse('comment-list'))
        self.assertEqual([c['content'] for c in own.data], ['second'])

    def test_post_has_comment_count(self):
        Comment.objects.create(overlord=self.garfield, post=self.post, content='hi')
        login(self.client, self.me)
        response = self.client.get(reverse('post-list'))
        self.assertEqual(response.data[0]['comment_count'], 1)

    def test_comment_notifies_post_owner(self):
        response = self.client.post(
            reverse('comment-list'),
            {'overlord': self.garfield.id, 'post': self.post.id, 'content': 'Nice nap!'},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        notification = self.notifications().get()
        self.assertIn('Garfield commented on your post', notification.message)
        self.assertIn('Nice nap!', notification.message)

    def test_reaction_notifies_only_when_new(self):
        url = reverse('toggle-reaction')
        payload = {'overlord_id': self.garfield.id, 'post_id': self.post.id}

        self.client.post(url, {**payload, 'type': 'purrfect'})
        self.assertEqual(self.notifications().count(), 1)
        self.assertIn('Garfield reacted Purrfect', self.notifications().get().message)

        self.client.post(url, {**payload, 'type': 'hisss'})  # switch
        self.client.post(url, {**payload, 'type': 'hisss'})  # take back
        self.assertEqual(self.notifications().count(), 1)

    def test_whisker_notifies_target(self):
        self.client.post(
            reverse('whisker-list'),
            {'from_overlord': self.garfield.id, 'to_overlord': self.mirci.id},
        )
        notification = self.notifications().get()
        self.assertEqual(notification.message, 'Garfield started whiskering Mirci.')
        self.assertEqual(notification.link, f'/overlord?id={self.garfield.id}')

    def test_no_notification_between_own_overlords(self):
        login(self.client, self.me)
        self.client.post(
            reverse('comment-list'),
            {'overlord': self.cirmi.id, 'post': self.post.id, 'content': 'me again'},
        )
        self.client.post(
            reverse('toggle-reaction'),
            {'overlord_id': self.cirmi.id, 'post_id': self.post.id, 'type': 'nap'},
        )
        self.assertFalse(self.notifications().exists())

    def test_mark_all_read(self):
        Notification.objects.create(overlord=self.mirci, message='a')
        Notification.objects.create(overlord=self.mirci, message='b')
        Notification.objects.create(overlord=self.garfield, message='not mine')
        login(self.client, self.me)

        response = self.client.post(reverse('notification-mark-all-read'))
        self.assertEqual(response.data, {'updated': 2})
        self.assertFalse(self.notifications().filter(is_read=False).exists())
        self.assertFalse(Notification.objects.get(message='not mine').is_read)

    def test_notifications_of_one_overlord(self):
        Notification.objects.create(overlord=self.mirci, message='for mirci')
        Notification.objects.create(overlord=self.cirmi, message='for cirmi')
        login(self.client, self.me)

        response = self.client.get(reverse('notification-list'), {'overlord': self.mirci.id})
        self.assertEqual([n['message'] for n in response.data], ['for mirci'])

        url = f"{reverse('notification-mark-all-read')}?overlord={self.mirci.id}"
        self.assertEqual(self.client.post(url).data, {'updated': 1})
        self.assertFalse(Notification.objects.get(message='for cirmi').is_read)

        bad = self.client.get(reverse('notification-list'), {'overlord': 'mirci'})
        self.assertEqual(bad.status_code, status.HTTP_400_BAD_REQUEST)
