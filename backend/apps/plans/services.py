"""Rule-based plan generation. The LLM agent (ai-service/agent) can later propose plans in the same shape."""

from django.utils import timezone

from apps.common.choices import LadderLevel

from .models import Plan, PlanPhase

PHASES = [
    (1, 2, [LadderLevel.ISOLATION, LadderLevel.SYLLABLES], "tongue_placement"),
    (3, 5, [LadderLevel.WORDS], "words_start_end_middle"),
    (6, 8, [LadderLevel.PHRASES, LadderLevel.SENTENCES], "phrases_then_z"),
]


def generate_plan(screening) -> Plan:
    results = sorted(screening.results, key=lambda r: r["accuracy"])
    worst = results[0] if results else {"sound": "س", "accuracy": 100}
    targets = [r["sound"] for r in results if r["accuracy"] < 85] or [worst["sound"]]
    typical = screening.overall_severity == "typical"

    screening.child.plans.filter(status__in=[Plan.Status.DRAFT, Plan.Status.PENDING_APPROVAL]).delete()
    plan = Plan.objects.create(
        child=screening.child,
        screening=screening,
        target_sounds=targets,
        lisp_type=screening.dominant_lisp_type or "interdental",
        severity=screening.overall_severity,
        baseline_accuracy=worst["accuracy"],
        duration_weeks=3 if typical else 8,
        current_sound=targets[0],
    )
    PlanPhase.objects.bulk_create(
        PlanPhase(
            plan=plan,
            week_from=a,
            week_to=b,
            sound=targets[0],
            levels=[lv.value for lv in levels],
            focus=focus,
        )
        for a, b, levels, focus in PHASES
    )
    screening.child.current_level = LadderLevel.ISOLATION
    screening.child.save(update_fields=["current_level", "updated_at"])
    return plan


def approve_by_parent(plan: Plan, *, practice_time=None, reminder_enabled=True) -> Plan:
    plan.practice_time = practice_time
    plan.reminder_enabled = reminder_enabled
    plan.approved_by_parent_at = timezone.now()
    plan.status = (
        Plan.Status.ACTIVE
        if plan.approved_by_therapist_at or not plan.child.therapist_id
        else Plan.Status.APPROVED
    )
    plan.save()
    if plan.status == Plan.Status.ACTIVE:
        from apps.practice.services import ensure_quests

        ensure_quests(plan)
    return plan
