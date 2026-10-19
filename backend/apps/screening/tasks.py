from celery import shared_task

from apps.common import ai_client

from .models import Attempt


@shared_task
def reclassify_attempts(model_version: str | None = None) -> int:
    """Re-run classification over stored recordings, e.g. after a new model is deployed. Returns the count."""
    count = 0
    qs = Attempt.objects.exclude(audio="").select_related("word")
    if model_version:
        qs = qs.exclude(model_version=model_version)
    for attempt in qs.iterator():
        result = ai_client.classify(
            attempt.audio.path,
            word=attempt.word.word,
            target_sound=attempt.word.target_sound,
            position=attempt.word.position,
        )
        attempt.label, attempt.confidence, attempt.model_version = (
            result.label,
            result.confidence,
            result.model_version,
        )
        attempt.save(update_fields=["label", "confidence", "model_version"])
        count += 1
    return count
