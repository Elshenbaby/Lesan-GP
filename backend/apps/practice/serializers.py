from rest_framework import serializers

from apps.screening.models import Word
from apps.screening.serializers import WordSerializer

from .models import PracticeSession, Quest


class QuestSerializer(serializers.ModelSerializer):
    steps = serializers.SerializerMethodField()

    class Meta:
        model = Quest
        fields = ["id", "day", "level", "sound", "state", "steps", "stars_earned"]

    def get_steps(self, quest):
        ids = {pid for step in quest.steps for pid in step.get("prompt_ids", [])}
        words = {w.id: w for w in Word.objects.filter(id__in=ids)}
        return [
            {
                "id": step["id"],
                "kind": step["kind"],
                "title": step.get("title", step["kind"]),
                "prompts": WordSerializer(
                    [words[i] for i in step.get("prompt_ids", []) if i in words], many=True
                ).data,
            }
            for step in quest.steps
        ]


class PracticeSessionSerializer(serializers.ModelSerializer):
    child_id = serializers.UUIDField(read_only=True)
    quest_id = serializers.UUIDField(read_only=True)
    summary = serializers.SerializerMethodField()

    class Meta:
        model = PracticeSession
        fields = [
            "id",
            "child_id",
            "quest_id",
            "started_at",
            "ended_at",
            "duration_min",
            "attempts",
            "correct",
            "level",
            "sound",
            "summary",
        ]

    def get_summary(self, session):
        return f"{session.correct}/{session.attempts}"
