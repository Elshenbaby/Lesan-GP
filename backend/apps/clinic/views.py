from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.children.models import Child
from apps.common.permissions import IsTherapist
from apps.common.views import ScopedQuerysetMixin
from apps.screening.models import Attempt

from .models import Invite, TherapistNote
from .serializers import (
    InviteResponseSerializer,
    InviteSerializer,
    LabelSerializer,
    PatientSerializer,
    RecordingSerializer,
    TherapistNoteSerializer,
)
from .services import accept_invite, patient_summary


class TherapistView:
    permission_classes = [IsTherapist]
    pagination_class = None


class PatientListView(TherapistView, APIView):
    @extend_schema(responses=PatientSerializer(many=True))
    def get(self, request):
        children = Child.objects.filter(therapist=request.user).select_related("parent")
        return Response(PatientSerializer([patient_summary(c) for c in children], many=True).data)


class PatientDetailView(TherapistView, APIView):
    @extend_schema(responses=PatientSerializer)
    def get(self, request, child_id):
        child = get_object_or_404(Child, id=child_id, therapist=request.user)
        return Response(PatientSerializer(patient_summary(child)).data)


class ReviewQueueView(TherapistView, ScopedQuerysetMixin, generics.ListAPIView):
    """Recordings the AI labelled that a therapist hasn't confirmed yet, least confident first."""

    queryset = (
        Attempt.objects.exclude(audio="")
        .select_related("child", "word")
        .order_by("confidence", "-created_at")
    )
    serializer_class = RecordingSerializer

    def scope(self, queryset, user):
        return queryset.filter(child__therapist=user, therapist_label="")


class LabelRecordingView(TherapistView, APIView):
    @extend_schema(request=LabelSerializer, responses=RecordingSerializer)
    def post(self, request, pk):
        attempt = get_object_or_404(Attempt, id=pk, child__therapist=request.user)
        payload = LabelSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        attempt.therapist_label = payload.validated_data["label"]
        attempt.reviewed_by = request.user
        attempt.reviewed_at = timezone.now()
        attempt.save(update_fields=["therapist_label", "reviewed_by", "reviewed_at"])
        return Response(RecordingSerializer(attempt, context={"request": request}).data)


class NoteListCreateView(TherapistView, ScopedQuerysetMixin, generics.ListCreateAPIView):
    queryset = TherapistNote.objects.select_related("child")
    serializer_class = TherapistNoteSerializer

    def scope(self, queryset, user):
        return queryset.filter(therapist=user)

    def perform_create(self, serializer):
        child = get_object_or_404(
            Child, id=serializer.validated_data.pop("child_id"), therapist=self.request.user
        )
        serializer.save(therapist=self.request.user, child=child)


class InviteListCreateView(TherapistView, ScopedQuerysetMixin, generics.ListCreateAPIView):
    queryset = Invite.objects.select_related("child")
    serializer_class = InviteSerializer

    def scope(self, queryset, user):
        return queryset.filter(
            Q(therapist=user)
            | Q(therapist__isnull=True, initiated_by=Invite.Initiator.FAMILY, email__iexact=user.email)
        )

    def perform_create(self, serializer):
        serializer.save(therapist=self.request.user, initiated_by=Invite.Initiator.THERAPIST)


class InviteRespondView(TherapistView, APIView):
    @extend_schema(request=InviteResponseSerializer, responses=InviteSerializer)
    def patch(self, request, pk):
        invite = get_object_or_404(
            Invite,
            Q(therapist=request.user) | Q(therapist__isnull=True, email__iexact=request.user.email),
            id=pk,
            initiated_by=Invite.Initiator.FAMILY,
        )
        payload = InviteResponseSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        if payload.validated_data["status"] == Invite.Status.ACCEPTED:
            accept_invite(invite, request.user)
        else:
            invite.status = Invite.Status.DECLINED
            invite.save(update_fields=["status", "updated_at"])
        return Response(InviteSerializer(invite).data, status=status.HTTP_200_OK)
