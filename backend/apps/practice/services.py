from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.common.choices import LADDER, LadderLevel
from apps.screening.models import Word

from .models import PracticeSession, Quest

WORDS_PER_QUEST = 5
STARS_PER_QUEST = 3


def _prompts_for(level: str, sound: str) -> list[str]:
    if level == LadderLevel.ISOLATION:
        kind = Word.Kind.ISOLATION
    elif level == LadderLevel.SYLLABLES:
        kind = Word.Kind.SYLLABLE
    else:
        kind = Word.Kind.PRACTICE
    words = Word.objects.filter(kind=kind, target_sound=sound, is_active=True)
    if not words.exists():
        words = Word.objects.filter(kind=Word.Kind.SCREENING, target_sound=sound, is_active=True)
    return list(words.values_list("id", flat=True)[:WORDS_PER_QUEST])


def build_steps(level: str, sound: str) -> list[dict]:
    isolation = list(
        Word.objects.filter(kind=Word.Kind.ISOLATION, target_sound=sound).values_list("id", flat=True)[:1]
    )
    return [
        {"id": "s1", "kind": "warmup", "title": "warmup", "prompt_ids": []},
        {"id": "s2", "kind": "sound", "title": "sound", "prompt_ids": isolation},
        {"id": "s3", "kind": "word", "title": level, "prompt_ids": _prompts_for(level, sound)},
    ]


def ensure_quests(plan, days_ahead: int = 7) -> None:
    """Keep a week of quests ahead of the child; exactly one is 'today' until it's completed."""
    quests = plan.quests.all()
    if not quests.filter(state__in=[Quest.State.TODAY, Quest.State.LOCKED]).exists():
        start = (quests.order_by("-day").values_list("day", flat=True).first() or 0) + 1
        Quest.objects.bulk_create(
            Quest(
                child=plan.child,
                plan=plan,
                day=start + i,
                level=plan.current_level,
                sound=plan.current_sound,
                steps=build_steps(plan.current_level, plan.current_sound),
            )
            for i in range(days_ahead)
        )
    if not plan.quests.filter(state=Quest.State.TODAY).exists():
        nxt = plan.quests.filter(state=Quest.State.LOCKED).order_by("day").first()
        if nxt:
            nxt.state = Quest.State.TODAY
            nxt.save(update_fields=["state", "updated_at"])


def evaluate_level(plan) -> str:
    """Ladder rule: up after N sessions at >= X%, down after M sessions under Y%. Returns the new level."""
    rules = settings.LISAN
    recent = list(plan.child.practice_sessions.filter(level=plan.current_level).order_by("-started_at")[:3])
    idx = LADDER.index(plan.current_level)
    up = recent[: rules["LEVEL_UP_SESSIONS"]]
    down = recent[: rules["LEVEL_DOWN_SESSIONS"]]
    if len(up) == rules["LEVEL_UP_SESSIONS"] and all(s.accuracy >= rules["LEVEL_UP_ACCURACY"] for s in up):
        idx = min(idx + 1, len(LADDER) - 1)
    elif len(down) == rules["LEVEL_DOWN_SESSIONS"] and all(
        s.accuracy < rules["LEVEL_DOWN_ACCURACY"] for s in down
    ):
        idx = max(idx - 1, 0)
    return LADDER[idx]


def _update_streak(child) -> None:
    today = timezone.localdate()
    if child.last_practiced_on == today:
        return
    child.streak_days = child.streak_days + 1 if child.last_practiced_on == today - timedelta(days=1) else 1
    child.last_practiced_on = today


@transaction.atomic
def complete_quest(quest: Quest) -> tuple[PracticeSession, int]:
    attempts = list(quest.attempts.filter(needs_repeat=False))
    now = timezone.now()
    first = min((a.created_at for a in attempts), default=now)
    session = PracticeSession.objects.create(
        child=quest.child,
        quest=quest,
        started_at=first,
        ended_at=now,
        duration_min=max(1, round((now - first).total_seconds() / 60)),
        attempts=len(attempts),
        correct=sum(a.final_label == "correct" for a in attempts),
        level=quest.level,
        sound=quest.sound,
    )
    # Stars reward trying, not accuracy: finishing always earns the full set.
    stars = STARS_PER_QUEST
    quest.state = Quest.State.COMPLETED
    quest.stars_earned = stars
    quest.completed_at = now
    quest.save(update_fields=["state", "stars_earned", "completed_at", "updated_at"])

    child = quest.child
    child.stars += stars
    _update_streak(child)

    plan = quest.plan
    new_level = evaluate_level(plan)
    if new_level != plan.current_level:
        plan.current_level = new_level
        plan.save(update_fields=["current_level", "updated_at"])
        plan.quests.filter(state=Quest.State.LOCKED).delete()
    child.current_level = plan.current_level
    child.save(update_fields=["stars", "streak_days", "last_practiced_on", "current_level", "updated_at"])
    ensure_quests(plan)
    return session, stars
