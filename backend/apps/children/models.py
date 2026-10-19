from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.common.choices import LadderLevel
from apps.common.models import BaseModel

from .catalog import GUIDE_IDS


class Child(BaseModel):
    parent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="children")
    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="patients"
    )
    name = models.CharField(max_length=80)
    age = models.PositiveSmallIntegerField(validators=[MinValueValidator(3), MaxValueValidator(99)])
    dialect = models.CharField(max_length=16, default="egyptian")
    avatar_seed = models.CharField(max_length=32, blank=True)
    guide_id = models.CharField(max_length=16, choices=[(g, g) for g in GUIDE_IDS], blank=True)
    previous_therapy = models.BooleanField(default=False)
    concerns = models.JSONField(default=list, blank=True)
    consent_recording = models.BooleanField(default=False)
    consent_research = models.BooleanField(default=False)

    current_level = models.CharField(
        max_length=16, choices=LadderLevel.choices, default=LadderLevel.ISOLATION
    )
    stars = models.PositiveIntegerField(default=0)
    streak_days = models.PositiveIntegerField(default=0)
    last_practiced_on = models.DateField(null=True, blank=True)
    equipped_outfit = models.CharField(max_length=8, default="o1")

    class Meta(BaseModel.Meta):
        verbose_name_plural = "children"

    def __str__(self) -> str:
        return self.name

    @property
    def latest_screening(self):
        return self.screenings.filter(status="completed").order_by("-completed_at").first()

    @property
    def active_plan(self):
        return self.plans.exclude(status="completed").order_by("-created_at").first()
