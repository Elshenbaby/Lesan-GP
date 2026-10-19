from pathlib import Path

from django.conf import settings
from django.db import models

from apps.common.choices import LispType, Severity, SoundLabel, TargetSound, WordPosition
from apps.common.models import BaseModel


class Word(models.Model):
    """A speech prompt: screening/practice word, syllable or isolated sound. Owned by the clinical lead."""

    class Kind(models.TextChoices):
        SCREENING = "screening"
        PRACTICE = "practice"
        SYLLABLE = "syllable"
        ISOLATION = "isolation"

    id = models.CharField(primary_key=True, max_length=16)
    word = models.CharField(max_length=40)
    transliteration = models.CharField(max_length=40)
    meaning_en = models.CharField(max_length=60)
    target_sound = models.CharField(max_length=1, choices=TargetSound.choices)
    position = models.CharField(max_length=8, choices=WordPosition.choices)
    picture = models.CharField(max_length=24)
    kind = models.CharField(max_length=12, choices=Kind.choices, default=Kind.SCREENING)
    order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["kind", "order"]

    def __str__(self) -> str:
        return f"{self.word} ({self.target_sound}, {self.position})"


class Screening(BaseModel):
    class Status(models.TextChoices):
        IN_PROGRESS = "in_progress"
        PROCESSING = "processing"
        COMPLETED = "completed"

    child = models.ForeignKey("children.Child", on_delete=models.CASCADE, related_name="screenings")
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.IN_PROGRESS)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    results = models.JSONField(default=list, blank=True)
    summary_ar = models.TextField(blank=True)
    summary_en = models.TextField(blank=True)
    overall_severity = models.CharField(max_length=10, choices=Severity.choices, blank=True)
    dominant_lisp_type = models.CharField(max_length=12, choices=LispType.choices, blank=True)
    shared_with_therapist = models.BooleanField(default=False)


def recording_path(attempt: "Attempt", filename: str) -> str:
    return f"recordings/{attempt.child_id}/{attempt.id}{Path(filename).suffix or '.webm'}"


class Attempt(BaseModel):
    """One recorded try at a word, during screening or practice. Also the unit of therapist review."""

    child = models.ForeignKey("children.Child", on_delete=models.CASCADE, related_name="attempts")
    word = models.ForeignKey(Word, on_delete=models.PROTECT, related_name="attempts")
    screening = models.ForeignKey(
        Screening, on_delete=models.CASCADE, null=True, blank=True, related_name="attempts"
    )
    quest = models.ForeignKey(
        "practice.Quest", on_delete=models.CASCADE, null=True, blank=True, related_name="attempts"
    )
    audio = models.FileField(upload_to=recording_path, blank=True)
    label = models.CharField(max_length=12, choices=SoundLabel.choices)
    confidence = models.FloatField()
    needs_repeat = models.BooleanField(default=False)
    model_version = models.CharField(max_length=32, blank=True)
    therapist_label = models.CharField(max_length=12, choices=SoundLabel.choices, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviews"
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    @property
    def final_label(self) -> str:
        return self.therapist_label or self.label
