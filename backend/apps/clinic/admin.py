from django.contrib import admin

from .models import Invite, TherapistNote


@admin.register(TherapistNote)
class TherapistNoteAdmin(admin.ModelAdmin):
    list_display = ["child", "therapist", "created_at"]


@admin.register(Invite)
class InviteAdmin(admin.ModelAdmin):
    list_display = ["email", "child", "therapist", "initiated_by", "status", "created_at"]
    list_filter = ["status", "initiated_by"]
