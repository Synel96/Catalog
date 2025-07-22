from django.db import models
from django.contrib.auth.models import User
from django.db.models import UniqueConstraint


class Overlord(models.Model):
    slave = models.ForeignKey(User, on_delete=models.CASCADE, related_name='overlords')
    name = models.CharField(max_length=100)
    avatar = models.ImageField(upload_to='overlords/', blank=True, null=True)
    bio = models.TextField(blank=True)
    breed = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.name} ({self.slave.username})"


class Post(models.Model):
    overlord = models.ForeignKey(Overlord, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    image = models.ImageField(upload_to='posts/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post by {self.overlord.name} at {self.created_at}"


class Reaction(models.Model):
    REACTION_CHOICES = [
        ('purrfect', 'Purrfect'),
        ('hisss', 'Hisss'),
        ('nap', 'Overnap'),
        ('ekekekek', 'Ekekekek'),
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
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.overlord.name} on {self.post}"


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