from rest_framework import serializers

from .catalog import GUIDE_IDS
from .models import Child


class ChildSerializer(serializers.ModelSerializer):
    guide_id = serializers.CharField(required=False, allow_blank=True)
    therapist_id = serializers.UUIDField(read_only=True)
    latest_screening_id = serializers.SerializerMethodField()
    plan_id = serializers.SerializerMethodField()

    class Meta:
        model = Child
        fields = [
            "id",
            "name",
            "age",
            "dialect",
            "avatar_seed",
            "guide_id",
            "previous_therapy",
            "concerns",
            "consent_recording",
            "consent_research",
            "therapist_id",
            "created_at",
            "current_level",
            "streak_days",
            "stars",
            "latest_screening_id",
            "plan_id",
        ]
        read_only_fields = ["id", "dialect", "created_at", "current_level", "streak_days", "stars"]

    def get_latest_screening_id(self, child):
        screening = child.latest_screening
        return str(screening.id) if screening else None

    def get_plan_id(self, child):
        plan = child.active_plan
        return str(plan.id) if plan else None

    def validate_guide_id(self, value):
        if value and value not in GUIDE_IDS:
            raise serializers.ValidationError("unknown_guide")
        return value

    def validate(self, attrs):
        if self.instance is None and not attrs.get("consent_recording"):
            raise serializers.ValidationError({"consent_recording": "required"})
        return attrs


class SetGuideSerializer(serializers.Serializer):
    guide_id = serializers.ChoiceField(choices=GUIDE_IDS)


class GuideSerializer(serializers.Serializer):
    id = serializers.CharField()
    name_ar = serializers.CharField()
    name_en = serializers.CharField()
    species = serializers.CharField()
    favourite_sound = serializers.CharField()
    color = serializers.CharField()
