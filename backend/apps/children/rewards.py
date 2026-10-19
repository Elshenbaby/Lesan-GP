from datetime import timedelta

from django.utils import timezone

from .catalog import OUTFITS, STICKERS
from .models import Child


def rewards_for(child: Child) -> dict:
    today = timezone.localdate()
    practiced = set(
        child.practice_sessions.filter(started_at__date__gte=today - timedelta(days=13)).values_list(
            "started_at__date", flat=True
        )
    )
    return {
        "stars": child.stars,
        "streak_days": child.streak_days,
        "stickers": [{"id": i, "name": n, "unlocked": child.stars >= need} for i, n, need in STICKERS],
        "outfits": [
            {"id": i, "name": n, "unlocked": child.stars >= need, "equipped": child.equipped_outfit == i}
            for i, n, need in OUTFITS
        ],
        "calendar": [
            {"date": (day := today - timedelta(days=13 - k)).isoformat(), "practiced": day in practiced}
            for k in range(14)
        ],
    }
