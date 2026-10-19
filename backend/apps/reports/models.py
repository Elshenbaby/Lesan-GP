from django.db import models

from apps.common.models import BaseModel


class WeeklyReport(BaseModel):
    """Plain-language weekly summary for parents. Written by the LLM agent, or the template fallback."""

    child = models.ForeignKey("children.Child", on_delete=models.CASCADE, related_name="weekly_reports")
    week_start = models.DateField()
    headline_ar = models.CharField(max_length=200)
    headline_en = models.CharField(max_length=200)
    tip_ar = models.TextField()
    tip_en = models.TextField()
    generated_by = models.CharField(max_length=32, default="template")

    class Meta(BaseModel.Meta):
        ordering = ["-week_start"]
        constraints = [models.UniqueConstraint(fields=["child", "week_start"], name="unique_weekly_report")]
