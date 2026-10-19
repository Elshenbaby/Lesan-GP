from django.contrib import admin

from .models import Child


@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ["name", "age", "parent", "therapist", "current_level", "stars", "streak_days"]
    list_filter = ["current_level"]
    search_fields = ["name", "parent__email"]
    raw_id_fields = ["parent", "therapist"]
