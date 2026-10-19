from django.contrib import admin

from .models import WeeklyReport


@admin.register(WeeklyReport)
class WeeklyReportAdmin(admin.ModelAdmin):
    list_display = ["child", "week_start", "headline_en", "generated_by"]
