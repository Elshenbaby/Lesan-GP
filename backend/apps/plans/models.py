from django.db import models

from apps.common.choices import LadderLevel, LispType, Severity, TargetSound
from apps.common.models import BaseModel


class Plan(BaseModel):
    class Status(models.TextChoices):
        DRAFT = "draft"
        PENDING_APPROVAL = "pending_approval"
        APPROVED = "approved"
        ACTIVE = "active"
        COMPLETED = "completed"

    child = models.ForeignKey("children.Child", on_delete=models.CASCADE, related_name="plans")
    screening = models.ForeignKey(
        "screening.Screening", on_delete=models.SET_NULL, null=True, blank=True, related_name="plans"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING_APPROVAL)
    target_sounds = models.JSONField(default=list)
    lisp_type = models.CharField(max_length=12, choices=LispType.choices)
    severity = models.CharField(max_length=10, choices=Severity.choices)
    baseline_accuracy = models.PositiveSmallIntegerField()
    duration_weeks = models.PositiveSmallIntegerField(default=8)
    minutes_per_day = models.PositiveSmallIntegerField(default=10)
    reassess_every_weeks = models.PositiveSmallIntegerField(default=2)
    practice_time = models.TimeField(null=True, blank=True)
    reminder_enabled = models.BooleanField(default=True)
    approved_by_parent_at = models.DateTimeField(null=True, blank=True)
    approved_by_therapist_at = models.DateTimeField(null=True, blank=True)
    therapist_notes = models.TextField(blank=True)
    current_level = models.CharField(
        max_length=16, choices=LadderLevel.choices, default=LadderLevel.ISOLATION
    )
    current_sound = models.CharField(max_length=1, choices=TargetSound.choices, default=TargetSound.SEEN)
    generated_by = models.CharField(max_length=32, default="rules-v1")


class PlanPhase(models.Model):
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name="phases")
    week_from = models.PositiveSmallIntegerField()
    week_to = models.PositiveSmallIntegerField()
    sound = models.CharField(max_length=1, choices=TargetSound.choices)
    levels = models.JSONField(default=list)
    # i18n key: frontend parent.json -> plan.focus.<focus>
    focus = models.CharField(max_length=40)

    class Meta:
        ordering = ["week_from"]

    def __str__(self) -> str:
        return f"Weeks {self.week_from}-{self.week_to}: {self.focus}"
