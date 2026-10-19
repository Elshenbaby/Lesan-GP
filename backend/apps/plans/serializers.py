from rest_framework import serializers

from .models import Plan, PlanPhase


class PlanPhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanPhase
        fields = ["id", "week_from", "week_to", "sound", "levels", "focus"]


class PlanSerializer(serializers.ModelSerializer):
    child_id = serializers.UUIDField(read_only=True)
    phases = PlanPhaseSerializer(many=True, read_only=True)
    practice_time = serializers.TimeField(format="%H:%M", required=False, allow_null=True)

    class Meta:
        model = Plan
        fields = [
            "id",
            "child_id",
            "status",
            "target_sounds",
            "lisp_type",
            "severity",
            "baseline_accuracy",
            "duration_weeks",
            "minutes_per_day",
            "reassess_every_weeks",
            "phases",
            "practice_time",
            "reminder_enabled",
            "approved_by_parent_at",
            "approved_by_therapist_at",
            "therapist_notes",
            "current_level",
            "current_sound",
        ]
        read_only_fields = [
            "id",
            "lisp_type",
            "severity",
            "baseline_accuracy",
            "approved_by_parent_at",
            "approved_by_therapist_at",
        ]


class TherapistPlanSerializer(PlanSerializer):
    """Therapists may additionally activate a plan and override the ladder level."""

    class Meta(PlanSerializer.Meta):
        read_only_fields = ["id", "lisp_type", "severity", "baseline_accuracy", "approved_by_parent_at"]


class ApproveSerializer(serializers.Serializer):
    practice_time = serializers.TimeField(required=False, allow_null=True)
    reminder_enabled = serializers.BooleanField(default=True)
