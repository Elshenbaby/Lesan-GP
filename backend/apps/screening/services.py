from collections import Counter

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.common import ai_client
from apps.common.choices import LispType, WordPosition, severity_for

from .models import Attempt, Screening, Word


def record_attempt(*, child, word: Word, audio=None, screening=None, quest=None) -> Attempt:
    """Store the recording, classify it, and flag low-confidence results so the child repeats the word."""
    attempt = Attempt(child=child, word=word, screening=screening, quest=quest, label="correct", confidence=0)
    if audio is not None and child.consent_recording:
        attempt.audio = audio
    attempt.save()

    result = ai_client.classify(
        attempt.audio.path if attempt.audio else None,
        word=word.word,
        target_sound=word.target_sound,
        position=word.position,
    )
    attempt.label = result.label
    attempt.confidence = result.confidence
    attempt.model_version = result.model_version
    attempt.needs_repeat = result.confidence < settings.LISAN["REPEAT_CONFIDENCE"]
    attempt.save(update_fields=["label", "confidence", "model_version", "needs_repeat"])
    return attempt


def _pct(attempts: list[Attempt]) -> int:
    if not attempts:
        return 100
    return round(100 * sum(a.final_label == "correct" for a in attempts) / len(attempts))


def compute_results(attempts: list[Attempt]) -> list[dict]:
    """Per-sound accuracy, accuracy by position, dominant lisp type and severity band."""
    results = []
    for sound in sorted({a.word.target_sound for a in attempts}):
        scored = [a for a in attempts if a.word.target_sound == sound and not a.needs_repeat]
        errors = Counter(a.final_label for a in scored if a.final_label != "correct")
        accuracy = _pct(scored)
        results.append(
            {
                "sound": sound,
                "accuracy": accuracy,
                "by_position": {
                    p: _pct([a for a in scored if a.word.position == p]) for p in WordPosition.values
                },
                "dominant_lisp_type": errors.most_common(1)[0][0] if errors else None,
                "severity": severity_for(accuracy),
            }
        )
    return results


def _latest_per_word(screening: Screening) -> list[Attempt]:
    latest: dict[str, Attempt] = {}
    for attempt in screening.attempts.select_related("word").order_by("created_at"):
        latest[attempt.word_id] = attempt
    return list(latest.values())


@transaction.atomic
def complete_screening(screening: Screening) -> Screening:
    from apps.plans.services import generate_plan

    results = compute_results(_latest_per_word(screening))
    worst = min(results, key=lambda r: r["accuracy"], default=None)
    screening.results = results
    screening.status = Screening.Status.COMPLETED
    screening.completed_at = timezone.now()
    screening.overall_severity = worst["severity"] if worst else "typical"
    screening.dominant_lisp_type = (worst or {}).get("dominant_lisp_type") or ""
    sound, acc = (worst["sound"], worst["accuracy"]) if worst else ("س", 100)
    lisp = LispType(screening.dominant_lisp_type).label if screening.dominant_lisp_type else ""
    screening.summary_ar = f"لسان لاحظ صعوبة في {sound} ({acc}٪ صح)."
    screening.summary_en = (
        f"Lisan noticed difficulty with {sound} ({acc}% correct){f', mostly {lisp}' if lisp else ''}."
    )
    screening.save()

    generate_plan(screening)
    return screening
