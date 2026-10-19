from rest_framework import serializers

from apps.children.serializers import ChildSerializer
from apps.common.choices import SoundLabel
from apps.screening.models import Attempt

from .models import Invite, TherapistNote


class RecordingSerializer(serializers.ModelSerializer):
    child_id = serializers.UUIDField(read_only=True)
    child_name = serializers.CharField(source="child.name")
    word = serializers.CharField(source="word.word")
    target_sound = serializers.CharField(source="word.target_sound")
    position = serializers.CharField(source="word.position")
    ai_label = serializers.CharField(source="label")
    ai_confidence = serializers.FloatField(source="confidence")
    therapist_label = serializers.CharField(allow_blank=True)
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = Attempt
        fields = [
            "id",
            "child_id",
            "child_name",
            "word",
            "target_sound",
            "position",
            "ai_label",
            "ai_confidence",
            "therapist_label",
            "audio_url",
            "created_at",
        ]

    def get_audio_url(self, attempt):
        request = self.context.get("request")
        url = attempt.audio.url if attempt.audio else ""
        return request.build_absolute_uri(url) if request and url else url


class LabelSerializer(serializers.Serializer):
    label = serializers.ChoiceField(choices=SoundLabel.choices)


class PatientSerializer(serializers.Serializer):
    child = ChildSerializer()
    parent_name = serializers.CharField()
    status = serializers.CharField()
    severity = serializers.CharField()
    lisp_type = serializers.CharField()
    accuracy = serializers.IntegerField()
    accuracy_delta = serializers.IntegerField()
    last_session_at = serializers.DateTimeField(allow_null=True)
    pending_reviews = serializers.IntegerField()
    plan_status = serializers.CharField()


class TherapistNoteSerializer(serializers.ModelSerializer):
    child_id = serializers.UUIDField()
    child_name = serializers.CharField(source="child.name", read_only=True)

    class Meta:
        model = TherapistNote
        fields = ["id", "child_id", "child_name", "body", "created_at"]


class InviteSerializer(serializers.ModelSerializer):
    child_name = serializers.CharField(source="child.name", read_only=True, default=None)
    direction = serializers.SerializerMethodField()

    class Meta:
        model = Invite
        fields = ["id", "email", "child_name", "direction", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]

    def get_direction(self, invite):
        return "incoming" if invite.initiated_by == Invite.Initiator.FAMILY else "outgoing"


class InviteResponseSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[Invite.Status.ACCEPTED, Invite.Status.DECLINED])
