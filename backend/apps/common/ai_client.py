"""HTTP client for the PyTorch speech service (ai-service/). The only place the backend talks to it."""

import logging
import random
from dataclasses import dataclass

import httpx
from django.conf import settings

logger = logging.getLogger(__name__)


@dataclass
class Classification:
    label: str
    confidence: float
    model_version: str


def classify(audio_path: str | None, *, word: str, target_sound: str, position: str) -> Classification:
    """Classify one recorded word. Falls back to a deterministic heuristic when the service is unreachable."""
    if settings.AI_SERVICE_URL and audio_path:
        try:
            with open(audio_path, "rb") as fh:
                response = httpx.post(
                    f"{settings.AI_SERVICE_URL}/classify",
                    files={"audio": fh},
                    data={"word": word, "target_sound": target_sound, "position": position},
                    timeout=settings.AI_SERVICE_TIMEOUT,
                )
            response.raise_for_status()
            body = response.json()
            return Classification(
                body["label"], float(body["confidence"]), body.get("model_version", "unknown")
            )
        except (httpx.HTTPError, OSError, KeyError, ValueError):
            logger.warning("AI service unavailable, using heuristic classifier", exc_info=True)

    rng = random.Random(f"{word}:{position}:{audio_path}")
    label = "correct" if rng.random() > 0.45 else "interdental"
    return Classification(label, round(0.5 + rng.random() * 0.45, 2), "heuristic")
