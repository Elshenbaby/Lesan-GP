from django.db.models import Q
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.children.models import Child
from apps.common.permissions import IsGuardian
from apps.common.views import ScopedQuerysetMixin

from .models import Screening, Word
from .serializers import (
    AttemptInputSerializer,
    AttemptSerializer,
    ScreeningSerializer,
    ShareSerializer,
    StartScreeningSerializer,
)
from .services import complete_screening, record_attempt


class ScreeningViewSet(ScopedQuerysetMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Screening.objects.select_related("child")
    serializer_class = ScreeningSerializer

    def scope(self, queryset, user):
        return queryset.filter(Q(child__parent=user) | Q(child__therapist=user))

    def get_permissions(self):
        if self.action in ("create", "attempts", "complete", "share"):
            return [IsGuardian()]
        return super().get_permissions()

    @extend_schema(request=StartScreeningSerializer, responses=ScreeningSerializer)
    def create(self, request):
        payload = StartScreeningSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        child = get_object_or_404(Child, id=payload.validated_data["child_id"], parent=request.user)
        screening = Screening.objects.create(child=child)
        return Response(self.get_serializer(screening).data, status=status.HTTP_201_CREATED)

    @extend_schema(request=AttemptInputSerializer, responses=AttemptSerializer)
    @action(detail=True, methods=["post"])
    def attempts(self, request, pk=None):
        screening = self.get_object()
        if screening.status != Screening.Status.IN_PROGRESS:
            raise ValidationError({"screening": "already_completed"})
        payload = AttemptInputSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        word = get_object_or_404(Word, id=payload.validated_data["word_id"], kind=Word.Kind.SCREENING)
        attempt = record_attempt(
            child=screening.child, word=word, audio=payload.validated_data.get("audio"), screening=screening
        )
        return Response(
            AttemptSerializer(attempt, context={"request": request}).data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        screening = complete_screening(self.get_object())
        return Response(self.get_serializer(screening).data)

    @extend_schema(request=ShareSerializer)
    @action(detail=True, methods=["post"])
    def share(self, request, pk=None):
        from apps.clinic.services import share_with_therapist

        screening = self.get_object()
        payload = ShareSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        share_with_therapist(screening, payload.validated_data["therapist_email"])
        return Response({"ok": True})
