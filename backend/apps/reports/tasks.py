from celery import shared_task

from apps.children.models import Child

from .services import build_weekly_report


@shared_task
def generate_weekly_reports() -> int:
    count = 0
    for child in Child.objects.filter(plans__status="active").distinct().iterator():
        build_weekly_report(child)
        count += 1
    return count
