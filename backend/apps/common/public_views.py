import json

from djangorestframework_camel_case.util import underscoreize
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

FREE_CHECK_MESSAGE = {
    "ar": "ده فحص سريع مش تشخيص. الاختبار الكامل جوه التطبيق بياخد ١٠ دقايق وبيحدد الأصوات بالظبط.",
    "en": "This is a quick check, not a diagnosis. The full screening in the app takes 10 minutes "
    "and pinpoints the exact sounds.",
}


class FreeCheckAnswersSerializer(serializers.Serializer):
    child_age = serializers.IntegerField(min_value=2, max_value=99)
    concerns = serializers.ListField(child=serializers.CharField(), allow_empty=True)
    noticed_sounds = serializers.ListField(child=serializers.CharField(), allow_empty=True)
    previous_therapy = serializers.BooleanField()


class PublicView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "public"


class FreeCheckView(PublicView):
    """Anonymous 3-word check from the public website. Audio is analysed in memory and never stored."""

    @extend_schema(request=FreeCheckAnswersSerializer, responses=OpenApiTypes.OBJECT)
    def post(self, request):
        raw = request.data.get("answers", "{}")
        # The multipart parser only underscoreizes top-level keys; `answers` arrives as a JSON string.
        answers = FreeCheckAnswersSerializer(
            data=underscoreize(json.loads(raw)) if isinstance(raw, str) else raw
        )
        answers.is_valid(raise_exception=True)
        data = answers.validated_data
        signals = len(data["concerns"]) + len(data["noticed_sounds"])
        likelihood = "likely" if signals >= 3 else "possible" if signals >= 1 else "low"
        lang = "en" if request.LANGUAGE_CODE.startswith("en") else "ar"
        return Response(
            {
                "likelihood": likelihood,
                "sounds_to_check": data["noticed_sounds"] or ["س"],
                "message": FREE_CHECK_MESSAGE[lang],
            }
        )


class PartnerRequestSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    clinic = serializers.CharField(max_length=160)
    message = serializers.CharField(required=False, allow_blank=True, max_length=2000)


class PartnerRequestView(PublicView):
    @extend_schema(request=PartnerRequestSerializer, responses=OpenApiTypes.OBJECT)
    def post(self, request):
        PartnerRequestSerializer(data=request.data).is_valid(raise_exception=True)
        return Response({"ok": True})
