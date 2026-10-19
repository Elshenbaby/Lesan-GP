import json
from dataclasses import dataclass

from app.config import settings

from . import prompts


@dataclass
class WeeklyCopy:
    headline_ar: str
    headline_en: str
    tip_ar: str
    tip_en: str
    generated_by: str


def template_report(*, name: str, sound: str, before: int | None, after: int | None) -> WeeklyCopy:
    """Deterministic fallback used when no LLM key is configured, and as the safety net if the LLM fails."""
    if before is not None and after is not None:
        headline_ar, headline_en = (
            f"{sound}: {before}٪ ← {after}٪ الأسبوع ده",
            f"{sound}: {before}% → {after}% this week",
        )
    else:
        headline_ar, headline_en = "أسبوع تمرين جديد بدأ!", "A new practice week has started!"
    return WeeklyCopy(
        headline_ar=headline_ar,
        headline_en=headline_en,
        tip_ar=f"وأنتم في السوبر ماركت، اطلبوا من {name} يسمّي ٣ حاجات فيها {sound}.",
        tip_en=f"At the supermarket, ask {name} to name 3 things with {sound}.",
        generated_by="template",
    )


def build_messages(*, name: str, age: int, level: str, sound: str, series: dict) -> list[dict]:
    user = prompts.WEEKLY_REPORT.format(
        name=name, age=age, level=level, sound=sound, series=json.dumps(series)
    )
    return [{"role": "system", "content": prompts.SYSTEM}, {"role": "user", "content": user}]


def llm_enabled() -> bool:
    return bool(settings.llm_api_key)
