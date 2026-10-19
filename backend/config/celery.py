import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

app = Celery("lisan")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "weekly-parent-reports": {
        "task": "apps.reports.tasks.generate_weekly_reports",
        "schedule": crontab(hour=18, minute=0, day_of_week="thu"),
    },
}
