from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser,
    Overlord,
    Post,
    Reaction,
    Comment,
    Whisker,
    Notification
)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'is_staff', 'date_joined']
    search_fields = ['username', 'email']
    ordering = ['date_joined']

    fieldsets = UserAdmin.fieldsets + (
        ("Extra info", {"fields": ("avatar", "bio")}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Extra info", {"fields": ("avatar", "bio")}),
    )


admin.site.register(Overlord)
admin.site.register(Post)
admin.site.register(Reaction)
admin.site.register(Comment)
admin.site.register(Whisker)
admin.site.register(Notification)
