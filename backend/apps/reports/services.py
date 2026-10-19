from collections import defaultdict
from datetime import timedelta

from django.utils import timezone

from apps.common.choices import LADDER
from apps.screening.models import Attempt

from .models import WeeklyReport

WEEKS = 5

TIP = {
    "ar": "وأنتم في السوبر ماركت، اطلبوا من {name} يسمّي ٣ حاجات فيها {sound}.",
    "en": "At the supermarket, ask {name} to name 3 things with {sound}.",
}


def week_start(day):
    return day - timedelta(days=day.weekday())


def accuracy_series(child) -> list[dict]:
    """Weekly accuracy per sound and word position over the last WEEKS weeks of practice attempts."""
    today = timezone.localdate()
    starts = [week_start(today) - timedelta(weeks=WEEKS - 1 - i) for i in range(WEEKS)]
    buckets: dict[tuple[str, str], dict[int, list[bool]]] = defaultdict(lambda: defaultdict(list))
    attempts = Attempt.objects.filter(
        child=child, needs_repeat=False, created_at__date__gte=starts[0]
    ).select_related("word")
    for a in attempts:
        idx = (week_start(timezone.localtime(a.created_at).date()) - starts[0]).days // 7
        buckets[(a.word.target_sound, a.word.position)][idx].append(a.final_label == "correct")

    series = []
    for (sound, position), weeks in sorted(buckets.items()):
        points, last = [], None
        for i in range(WEEKS):
            if weeks.get(i):
                last = round(100 * sum(weeks[i]) / len(weeks[i]))
            if last is not None:
                points.append({"week": f"W{i + 1}", "accuracy": last})
        series.append({"sound": sound, "position": position, "series": points})
    return series


def latest_report(child, lang: str) -> tuple[str, str]:
    report = child.weekly_reports.first()
    if report:
        return (report.headline_en, report.tip_en) if lang == "en" else (report.headline_ar, report.tip_ar)
    sound = child.active_plan.current_sound if child.active_plan else "س"
    return "", TIP[lang].format(name=child.name, sound=sound)


def progress_overview(child, lang: str = "ar") -> dict:
    today = timezone.localdate()
    week = child.practice_sessions.filter(started_at__date__gte=week_start(today))
    headline, tip = latest_report(child, lang)
    return {
        "child_id": str(child.id),
        "current_level": child.current_level,
        "levels_completed": LADDER[: LADDER.index(child.current_level)],
        "streak_days": child.streak_days,
        "minutes_this_week": sum(s.duration_min for s in week),
        "sessions_this_week": week.count(),
        "sounds": accuracy_series(child),
        "weekly_headline": headline,
        "weekly_tip": tip,
    }


def build_weekly_report(child) -> WeeklyReport:
    series = accuracy_series(child)
    best = max(series, key=lambda s: s["series"][-1]["accuracy"] - s["series"][0]["accuracy"], default=None)
    if best and len(best["series"]) >= 2:
        a, b = best["series"][-2]["accuracy"], best["series"][-1]["accuracy"]
        headline_ar = f"{best['sound']}: {a}٪ ← {b}٪ الأسبوع ده"
        headline_en = f"{best['sound']}: {a}% → {b}% this week"
    else:
        headline_ar, headline_en = "أسبوع تمرين جديد بدأ!", "A new practice week has started!"
    sound = child.active_plan.current_sound if child.active_plan else "س"
    report, _ = WeeklyReport.objects.update_or_create(
        child=child,
        week_start=week_start(timezone.localdate()),
        defaults={
            "headline_ar": headline_ar,
            "headline_en": headline_en,
            "tip_ar": TIP["ar"].format(name=child.name, sound=sound),
            "tip_en": TIP["en"].format(name=child.name, sound=sound),
        },
    )
    return report
