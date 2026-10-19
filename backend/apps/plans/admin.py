from django.contrib import admin

from .models import Plan, PlanPhase


class PlanPhaseInline(admin.TabularInline):
    model = PlanPhase
    extra = 0


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ["child", "status", "severity", "current_level", "current_sound", "created_at"]
    list_filter = ["status", "severity", "current_level"]
    inlines = [PlanPhaseInline]
