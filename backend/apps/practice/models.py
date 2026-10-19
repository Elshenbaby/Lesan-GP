from django.db import models

from apps.common.choices import LadderLevel, TargetSound
from apps.common.models import BaseModel


class Quest(BaseModel):
    """One day's practice on the child's map."""

    class State(models.TextChoices):
        LOCKED = "locked"
        AVAILABLE = "available"
        TODAY = "today"
        COMPLETED = "completed"

    child = models.ForeignKey("children.Child", on_delete=models.CASCADE, related_name="quests")
    plan = models.ForeignKey("plans.Plan", on_delete=models.CASCADE, related_name="quests")
    day = models.PositiveSmallIntegerField()
    level = models.CharField(max_length=16, choices=LadderLevel.choices)
    sound = models.CharField(max_length=1, choices=TargetSound.choices)
    state = models.CharField(max_length=12, choices=State.choices, default=State.LOCKED)
    # [{"id": "s1", "kind": "warmup"|"sound"|"word"|"story", "title": str, "prompt_ids": [Word.id, ...]}]
    steps = models.JSONField(default=list)
    stars_earned = models.PositiveSmallIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta(BaseModel.Meta):
        ordering = ["day"]
        constraints = [models.UniqueConstraint(fields=["plan", "day"], name="unique_quest_day_per_plan")]


class PracticeSession(BaseModel):
    child = models.ForeignKey("children.Child", on_delete=models.CASCADE, related_name="practice_sessions")
    quest = models.ForeignKey(Quest, on_delete=models.SET_NULL, null=True, related_name="sessions")
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_min = models.PositiveSmallIntegerField(default=0)
    attempts = models.PositiveSmallIntegerField(default=0)
    correct = models.PositiveSmallIntegerField(default=0)
    level = models.CharField(max_length=16, choices=LadderLevel.choices)
    sound = models.CharField(max_length=1, choices=TargetSound.choices)

    @property
    def accuracy(self) -> int:
        return round(100 * self.correct / self.attempts) if self.attempts else 0
