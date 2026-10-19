from rest_framework import serializers

from .models import Attempt, Screening, Word


class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = ["id", "word", "transliteration", "meaning_en", "target_sound", "position", "picture"]


class AttemptSerializer(serializers.ModelSerializer):
    word_id = serializers.CharField(source="word.id")
    word = serializers.CharField(source="word.word")
    target_sound = serializers.CharField(source="word.target_sound")
    position = serializers.CharField(source="word.position")
    label = serializers.CharField(source="final_label")
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = Attempt
        fields = [
            "id",
            "word_id",
            "word",
            "target_sound",
            "position",
            "label",
            "confidence",
            "needs_repeat",
            "audio_url",
            "created_at",
        ]

    def get_audio_url(self, attempt):
        if not attempt.audio:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(attempt.audio.url) if request else attempt.audio.url


class AttemptInputSerializer(serializers.Serializer):
    word_id = serializers.CharField()
    audio = serializers.FileField(required=False, allow_null=True)


class ScreeningSerializer(serializers.ModelSerializer):
    child_id = serializers.UUIDField(read_only=True)
    words = serializers.SerializerMethodField()
    attempts = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()

    class Meta:
        model = Screening
        fields = [
            "id",
            "child_id",
            "status",
            "started_at",
            "completed_at",
            "words",
            "attempts",
            "results",
            "summary",
            "overall_severity",
            "shared_with_therapist",
        ]

    def get_words(self, screening):
        return WordSerializer(Word.objects.filter(kind=Word.Kind.SCREENING, is_active=True), many=True).data

    def get_attempts(self, screening):
        return AttemptSerializer(
            screening.attempts.select_related("word").order_by("created_at"), many=True, context=self.context
        ).data

    def get_summary(self, screening):
        request = self.context.get("request")
        lang = getattr(request, "LANGUAGE_CODE", "ar") if request else "ar"
        return (screening.summary_en if lang.startswith("en") else screening.summary_ar) or None


class StartScreeningSerializer(serializers.Serializer):
    child_id = serializers.UUIDField()


class ShareSerializer(serializers.Serializer):
    therapist_email = serializers.EmailField()
