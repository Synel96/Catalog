from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import UniqueConstraint
from .managers import CustomUserManager


def user_avatar_upload_path(instance, filename):
    return f'avatars/{instance.username}/{filename}'

def overlord_avatar_upload_path(self, filename):
    return f'overlords/{self.slave.username}/{self.name}/{filename}'

def post_image_upload_path(instance, filename):
    return f'posts/{instance.overlord.slave.username}/{instance.overlord.name}/{filename}'

def comment_image_upload_path(instance, filename):
    return f'comments/{instance.overlord.slave.username}/{instance.overlord.name}/{filename}'


class CustomUser(AbstractUser):
    objects = CustomUserManager()
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to=user_avatar_upload_path,default='placeholders/slave_placeholder.png', blank=True, null=True)

    def __str__(self):
        return self.username
    


class Overlord(models.Model):
    # Titles a slave can give their overlord, shown under its name. The
    # frontend translates the keys (src/locales, "titles").
    TITLE_CHOICES = [
        ('moms_favourite', "Mom's Favourite"),
        ('sofa_lord', 'Lord of the Sofa'),
        ('zoomie_champion', '3 a.m. Zoomie Champion'),
        ('box_inspector', 'Chief Box Inspector'),
        ('tuna_connoisseur', 'Tuna Connoisseur'),
        ('keyboard_warmer', 'Keyboard Warmer'),
        ('gravity_tester', 'Gravity Tester'),
        ('sunbeam_collector', 'Sunbeam Collector'),
        ('professional_napper', 'Purr-fessional Napper'),
        ('door_critic', 'Door Critic'),
        ('red_dot_hunter', 'Red Dot Hunter'),
        ('escape_artist', 'Escape Artist'),
        ('paw_enforcement', 'Paw-enforcement Officer'),
        ('claw_enforcement', 'Claw-enforcement Agent'),
        ('catastrophe_manager', 'Cat-astrophe Manager'),
        ('meowketing_director', 'Meow-keting Director'),
        ('chief_scratching_officer', 'Chief Scratching Officer'),
        ('pawlitician', 'Paw-litician'),
        ('furniture_inspector', 'Fur-niture Inspector'),
        ('meowsician', 'Meow-sician'),
        ('pawsitive_thinker', 'Paw-sitive Thinker'),
        ('catthlete', 'Cat-thlete'),
    ]

    slave = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='overlords')
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=32, choices=TITLE_CHOICES, blank=True)

   

    avatar = models.ImageField(upload_to=overlord_avatar_upload_path,default='placeholders/overlord_placeholder.png', blank=True, null=True)
    bio = models.TextField(blank=True)
    breed = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.name} ({self.slave.username})"
    


class Post(models.Model):
    overlord = models.ForeignKey(Overlord, on_delete=models.CASCADE, related_name='posts')
    # A post has text, a picture, or both.
    content = models.TextField(blank=True)
    image = models.ImageField(
        upload_to=post_image_upload_path,
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Post by {self.overlord.name} at {self.created_at}"


class Reaction(models.Model):
    REACTION_CHOICES = [
        ('purrfect', 'Purrfect'),
        ('hisss', 'Hisss'),
        ('nap', 'Overnap'),
        ('ekekekek', 'Ekekekek'),
        # A paw burying it in the litter box.
        ('bury', 'Bury'),
    ]
    overlord = models.ForeignKey(Overlord, on_delete=models.CASCADE, related_name='reactions')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reactions')
    type = models.CharField(max_length=20, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=['overlord', 'post'], name='unique_overlord_post_reaction')
        ]


class Comment(models.Model):
    overlord = models.ForeignKey(Overlord, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    # A comment has text, a picture, or both.
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to=comment_image_upload_path, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.overlord.name} on {self.post}"


class CommentHeart(models.Model):
    """An overlord's heart on a comment; one per overlord and comment."""

    overlord = models.ForeignKey(Overlord, on_delete=models.CASCADE, related_name='comment_hearts')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='hearts')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=['overlord', 'comment'], name='unique_overlord_comment_heart')
        ]

    def __str__(self):
        return f"{self.overlord.name} hearted {self.comment}"


class Whisker(models.Model):
    from_overlord = models.ForeignKey(Overlord, on_delete=models.CASCADE, related_name='whiskering')
    to_overlord = models.ForeignKey(Overlord, on_delete=models.CASCADE, related_name='whiskered_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=['from_overlord', 'to_overlord'], name='unique_whiskering')
        ]

    def __str__(self):
        return f"{self.from_overlord.name} whiskers {self.to_overlord.name}"


class Notification(models.Model):
    overlord = models.ForeignKey(Overlord, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    link = models.URLField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.overlord.name}: {self.message}"
