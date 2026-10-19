from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.reverse import reverse
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import connection
from django.test.utils import CaptureQueriesContext
from urllib.parse import parse_qs, urlparse
from core.models import Overlord, Post, Reaction, Comment, CommentHeart, Whisker, Notification

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
        self.assertEqual(response.data['results'][0]['comment_count'], 1)

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


class HeartsAndOwnReactionTests(APITestCase):
    """Hearts on comments, and flagging the acting overlord's own reaction."""

    def setUp(self):
        self.me = User.objects.create_user(username='me', email='me@example.com', password='pw')
        self.other = User.objects.create_user(
            username='other', email='other@example.com', password='pw'
        )
        self.mirci = Overlord.objects.create(name='Mirci', slave=self.me)
        self.garfield = Overlord.objects.create(name='Garfield', slave=self.other)
        self.post = Post.objects.create(overlord=self.mirci, content='Sunbeam acquired.')
        self.comment = Comment.objects.create(
            overlord=self.mirci, post=self.post, content='Mine now.'
        )
        login(self.client, self.other)

    def heart(self, overlord_id):
        return self.client.post(
            reverse('comment-heart', args=[self.comment.id]), {'overlord_id': overlord_id}
        )

    def test_heart_toggles_and_notifies_once(self):
        response = self.heart(self.garfield.id)
        self.assertEqual(response.data, {'hearted': True, 'heart_count': 1})
        notification = Notification.objects.get(overlord=self.mirci)
        self.assertIn('Garfield hearted your comment', notification.message)

        response = self.heart(self.garfield.id)
        self.assertEqual(response.data, {'hearted': False, 'heart_count': 0})
        self.heart(self.garfield.id)
        # Taking a heart back and giving it again doesn't spam: one per new heart.
        self.assertEqual(Notification.objects.filter(overlord=self.mirci).count(), 2)

    def test_heart_needs_own_overlord(self):
        response = self.heart(self.mirci.id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(CommentHeart.objects.exists())

    def test_comment_list_flags_acting_overlords_heart(self):
        self.heart(self.garfield.id)
        url = reverse('comment-list')
        data = self.client.get(url, {'post': self.post.id, 'overlord': self.garfield.id}).data
        self.assertEqual((data[0]['heart_count'], data[0]['hearted']), (1, True))
        # Someone else's overlord as `overlord` is ignored.
        data = self.client.get(url, {'post': self.post.id, 'overlord': self.mirci.id}).data
        self.assertEqual((data[0]['heart_count'], data[0]['hearted']), (1, False))

    def test_post_list_flags_acting_overlords_reaction(self):
        Reaction.objects.create(overlord=self.garfield, post=self.post, type='hisss')
        Whisker.objects.create(from_overlord=self.garfield, to_overlord=self.mirci)
        url = reverse('post-list')
        mine = self.client.get(url, {'overlord': self.garfield.id}).data['results'][0]
        self.assertEqual(mine['my_reaction'], 'hisss')
        self.assertIsNone(self.client.get(url).data['results'][0]['my_reaction'])


class FeedPaginationTests(APITestCase):
    """The feeds come in cursor pages with a fixed number of queries."""

    def setUp(self):
        self.me = User.objects.create_user(username='me', email='me@example.com', password='pw')
        self.other = User.objects.create_user(
            username='other', email='other@example.com', password='pw'
        )
        self.mirci = Overlord.objects.create(name='Mirci', slave=self.me)
        self.garfield = Overlord.objects.create(name='Garfield', slave=self.other)
        self.snowball = Overlord.objects.create(name='Snowball', slave=self.other)
        Whisker.objects.create(from_overlord=self.mirci, to_overlord=self.garfield)
        login(self.client, self.me)

    def add_posts(self, overlord, count):
        for i in range(count):
            post = Post.objects.create(overlord=overlord, content=f'{overlord.name} {i}')
            Reaction.objects.create(overlord=self.garfield, post=post, type='purrfect')
            Comment.objects.create(overlord=self.mirci, post=post, content='meow')

    def page(self, url, params=None):
        return self.client.get(url, params or {}).data

    @staticmethod
    def cursor(next_url):
        return parse_qs(urlparse(next_url).query)['cursor'][0]

    def test_pages_of_twenty_without_gaps_or_repeats(self):
        self.add_posts(self.mirci, 15)
        self.add_posts(self.garfield, 15)
        self.add_posts(self.snowball, 5)  # not whiskered: not on the Street
        url = reverse('post-list')

        first = self.page(url)
        self.assertEqual(len(first['results']), 20)
        # A post arriving between pages doesn't shift the next one.
        Post.objects.create(overlord=self.mirci, content='brand new')
        second = self.page(url, {'cursor': self.cursor(first['next'])})
        self.assertIsNone(second['next'])

        ids = [p['id'] for p in first['results'] + second['results']]
        self.assertEqual(len(ids), 30)
        self.assertEqual(len(set(ids)), 30)
        self.assertNotIn('brand new', [p['content'] for p in second['results']])

    def test_feed_query_count_does_not_grow_with_posts(self):
        url = reverse('post-list')
        self.add_posts(self.mirci, 3)
        with CaptureQueriesContext(connection) as few:
            self.page(url, {'overlord': self.mirci.id})
        self.add_posts(self.garfield, 15)
        with CaptureQueriesContext(connection) as many:
            data = self.page(url, {'overlord': self.mirci.id})
        self.assertEqual(len(data['results']), 18)
        self.assertEqual(len(many.captured_queries), len(few.captured_queries))
        self.assertLessEqual(len(many.captured_queries), 8)
        post = data['results'][0]
        self.assertEqual(
            (post['reaction_summary'], post['comment_count'], post['my_reaction']),
            ({'purrfect': 1}, 1, None),
        )

    def test_profile_feed_is_paginated_too(self):
        self.add_posts(self.snowball, 25)
        url = reverse('post-by-overlord', args=[self.snowball.id])
        first = self.page(url)
        second = self.page(url, {'cursor': self.cursor(first['next'])})
        self.assertEqual((len(first['results']), len(second['results'])), (20, 5))


def tiny_png(name='cat.png'):
    from io import BytesIO
    from PIL import Image
    from django.core.files.uploadedfile import SimpleUploadedFile

    buffer = BytesIO()
    Image.new('RGB', (2, 2), 'orange').save(buffer, 'PNG')
    return SimpleUploadedFile(name, buffer.getvalue(), content_type='image/png')


class CommentImageTests(APITestCase):
    """Comments can carry a picture, with or without text."""

    def setUp(self):
        import tempfile
        from django.test import override_settings

        media = override_settings(MEDIA_ROOT=tempfile.mkdtemp())
        media.enable()
        self.addCleanup(media.disable)

        self.me = User.objects.create_user(username='me', email='me@example.com', password='pw')
        self.other = User.objects.create_user(
            username='other', email='other@example.com', password='pw'
        )
        self.mirci = Overlord.objects.create(name='Mirci', slave=self.me)
        self.garfield = Overlord.objects.create(name='Garfield', slave=self.other)
        self.post = Post.objects.create(overlord=self.mirci, content='Sunbeam acquired.')
        login(self.client, self.other)

    def comment(self, **fields):
        data = {'overlord': self.garfield.id, 'post': self.post.id, **fields}
        return self.client.post(reverse('comment-list'), data, format='multipart')

    def test_text_and_picture(self):
        response = self.comment(content='Look at this.', image=tiny_png())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('/comments/other/Garfield/', response.data['image'])

    def test_picture_only_notifies_with_a_camera(self):
        response = self.comment(image=tiny_png())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], '')
        message = Notification.objects.get(overlord=self.mirci).message
        self.assertEqual(message, 'Garfield commented on your post: \U0001F4F7')

    def test_needs_text_or_picture(self):
        response = self.comment(content='   ')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Comment.objects.exists())

    def test_editing_text_keeps_the_picture(self):
        comment_id = self.comment(image=tiny_png()).data['id']
        url = reverse('comment-detail', args=[comment_id])
        response = self.client.patch(url, {'content': 'Now with words.'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['image'])
        # Text can't be emptied on a picture-less comment, but can on this one.
        self.assertEqual(self.client.patch(url, {'content': ''}, format='json').status_code, 200)
