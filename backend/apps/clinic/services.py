from datetime import timedelta

from django.utils import timezone

from apps.accounts.models import User

from .models import Invite


def share_with_therapist(screening, therapist_email: str) -> Invite:
    child = screening.child
    therapist = User.objects.filter(email__iexact=therapist_email, role=User.Role.THERAPIST).first()
    screening.shared_with_therapist = True
    screening.save(update_fields=["shared_with_therapist", "updated_at"])
    invite, _ = Invite.objects.get_or_create(
        child=child,
        therapist=therapist,
        initiated_by=Invite.Initiator.FAMILY,
        status=Invite.Status.PENDING,
        defaults={"email": child.parent.email},
    )
    return invite


def accept_invite(invite: Invite, therapist: User) -> Invite:
    invite.status = Invite.Status.ACCEPTED
    invite.therapist = therapist
    invite.save(update_fields=["status", "therapist", "updated_at"])
    if invite.child:
        invite.child.therapist = therapist
        invite.child.save(update_fields=["therapist", "updated_at"])
    return invite


def _weekly_accuracy(child, weeks_ago: int) -> int | None:
    today = timezone.localdate()
    start = today - timedelta(days=7 * (weeks_ago + 1))
    end = today - timedelta(days=7 * weeks_ago)
    sessions = child.practice_sessions.filter(started_at__date__gt=start, started_at__date__lte=end)
    total = sum(s.attempts for s in sessions)
    return round(100 * sum(s.correct for s in sessions) / total) if total else None


def patient_summary(child) -> dict:
    """Caseload row: status (practicing / stuck / ready / inactive), accuracy and its weekly change."""
    plan = child.active_plan
    last = child.practice_sessions.order_by("-started_at").first()
    recent = list(child.practice_sessions.order_by("-started_at")[:3])
    now_acc = _weekly_accuracy(child, 0)
    prev_acc = _weekly_accuracy(child, 1)
    screening = child.latest_screening
    accuracy = (
        now_acc
        if now_acc is not None
        else (screening.results[0]["accuracy"] if screening and screening.results else 0)
    )

    if not last or last.started_at < timezone.now() - timedelta(days=7):
        status = "inactive"
    elif len(recent) >= 2 and all(s.accuracy >= 80 for s in recent[:2]):
        status = "ready"
    elif len(recent) == 3 and all(s.accuracy < 50 for s in recent):
        status = "stuck"
    else:
        status = "practicing"

    return {
        "child": child,
        "parent_name": child.parent.full_name,
        "status": status,
        "severity": (plan.severity if plan else screening.overall_severity if screening else "typical")
        or "typical",
        "lisp_type": (plan.lisp_type if plan else screening.dominant_lisp_type if screening else "")
        or "interdental",
        "accuracy": accuracy,
        "accuracy_delta": (now_acc - prev_acc) if now_acc is not None and prev_acc is not None else 0,
        "last_session_at": last.started_at if last else None,
        "pending_reviews": child.attempts.exclude(audio="").filter(therapist_label="").count(),
        "plan_status": plan.status if plan else "draft",
    }
