from django.contrib import admin

from .models import Attempt, Screening, Word


@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = ["id", "word", "target_sound", "position", "kind", "order", "is_active"]
    list_filter = ["kind", "target_sound", "position", "is_active"]
    list_editable = ["order", "is_active"]


@admin.register(Screening)
class ScreeningAdmin(admin.ModelAdmin):
    list_display = ["child", "status", "overall_severity", "started_at", "completed_at"]
    list_filter = ["status", "overall_severity"]


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ["child", "word", "label", "confidence", "therapist_label", "created_at"]
    list_filter = ["label", "therapist_label"]
    raw_id_fields = ["child", "screening", "quest", "reviewed_by"]
