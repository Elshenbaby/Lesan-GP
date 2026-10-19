"""Speech-domain enums shared by every app. Mirror frontend/src/types/domain.ts."""

from django.db import models


class TargetSound(models.TextChoices):
    SEEN = "س", "S"
    ZAY = "ز", "Z"
    SHEEN = "ش", "Sh"
    SAAD = "ص", "Emphatic S"


class WordPosition(models.TextChoices):
    INITIAL = "initial"
    MEDIAL = "medial"
    FINAL = "final"


class LispType(models.TextChoices):
    INTERDENTAL = "interdental"
    DENTALIZED = "dentalized"
    LATERAL = "lateral"
    PALATAL = "palatal"


class SoundLabel(models.TextChoices):
    CORRECT = "correct"
    INTERDENTAL = "interdental"
    DENTALIZED = "dentalized"
    LATERAL = "lateral"
    PALATAL = "palatal"


class Severity(models.TextChoices):
    TYPICAL = "typical"
    MODERATE = "moderate"
    SEVERE = "severe"


class LadderLevel(models.TextChoices):
    ISOLATION = "isolation"
    SYLLABLES = "syllables"
    WORDS = "words"
    PHRASES = "phrases"
    SENTENCES = "sentences"
    STORIES = "stories"
    CONVERSATION = "conversation"


LADDER = [level.value for level in LadderLevel]


def severity_for(accuracy: float) -> str:
    """Bands from the proposal: >= 85 typical, 50-84 moderate, < 50 severe."""
    if accuracy >= 85:
        return Severity.TYPICAL
    if accuracy >= 50:
        return Severity.MODERATE
    return Severity.SEVERE
