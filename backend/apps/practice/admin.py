from django.contrib import admin

from .models import PracticeSession, Quest


@admin.register(Quest)
class QuestAdmin(admin.ModelAdmin):
    list_display = ["child", "day", "level", "sound", "state", "stars_earned"]
    list_filter = ["state", "level"]


@admin.register(PracticeSession)
class PracticeSessionAdmin(admin.ModelAdmin):
    list_display = ["child", "level", "sound", "attempts", "correct", "started_at"]
    list_filter = ["level", "sound"]
