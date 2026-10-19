from datetime import timedelta

from django.utils import timezone

from apps.plans.models import Plan
from apps.practice.models import PracticeSession, Quest
from apps.practice.services import ensure_quests, evaluate_level


def _plan(child, **extra):
    return Plan.objects.create(
        child=child,
        status=Plan.Status.ACTIVE,
        target_sounds=["س"],
        lisp_type="interdental",
        severity="moderate",
        baseline_accuracy=55,
        current_level="words",
        current_sound="س",
        **extra,
    )


def _session(child, accuracy, days_ago=0, level="words"):
    return PracticeSession.objects.create(
        child=child,
        started_at=timezone.now() - timedelta(days=days_ago),
        attempts=10,
        correct=accuracy // 10,
        level=level,
        sound="س",
    )


def test_ensure_quests_creates_a_week_with_one_today(child):
    plan = _plan(child)
    ensure_quests(plan)
    assert plan.quests.count() == 7
    assert plan.quests.filter(state=Quest.State.TODAY).count() == 1


def test_level_up_after_two_strong_sessions(child):
    plan = _plan(child)
    _session(child, 90, days_ago=1)
    _session(child, 80)
    assert evaluate_level(plan) == "phrases"


def test_level_down_after_three_weak_sessions(child):
    plan = _plan(child)
    for d in range(3):
        _session(child, 30, days_ago=d)
    assert evaluate_level(plan) == "syllables"


def test_complete_quest_awards_stars_and_streak(parent_api, child):
    plan = _plan(child)
    ensure_quests(plan)
    today = plan.quests.get(state=Quest.State.TODAY)

    word_id = parent_api.get(f"/api/v1/quests/{today.id}/").json()["steps"][2]["prompts"][0]["id"]
    assert (
        parent_api.post(
            f"/api/v1/quests/{today.id}/attempts/", {"wordId": word_id}, format="multipart"
        ).status_code
        == 201
    )

    res = parent_api.post(f"/api/v1/quests/{today.id}/complete/")
    assert res.status_code == 200
    assert res.json()["starsEarned"] == 3
    child.refresh_from_db()
    assert child.stars == 3 and child.streak_days == 1
    assert plan.quests.filter(state=Quest.State.TODAY).count() == 1
