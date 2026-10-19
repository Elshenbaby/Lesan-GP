from django.db.models import Q
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsGuardian
from apps.common.views import ScopedQuerysetMixin

from .catalog import GUIDES
from .models import Child
from .rewards import rewards_for
from .serializers import ChildSerializer, GuideSerializer, SetGuideSerializer


class ChildViewSet(
    ScopedQuerysetMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """Child profiles. Parents see their own children; therapists see children shared with them."""

    queryset = Child.objects.order_by("created_at")
    serializer_class = ChildSerializer
    http_method_names = ["get", "post", "patch", "delete"]

    def scope(self, queryset, user):
        return queryset.filter(Q(parent=user) | Q(therapist=user))

    def get_permissions(self):
        if self.action in ("create", "partial_update", "guide") or (
            self.action == "recordings" and self.request.method == "DELETE"
        ):
            return [IsGuardian()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user, avatar_seed=serializer.validated_data["name"][:32])

    @extend_schema(request=SetGuideSerializer, responses=ChildSerializer)
    @action(detail=True, methods=["post"])
    def guide(self, request, pk=None):
        child = self.get_object()
        payload = SetGuideSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        child.guide_id = payload.validated_data["guide_id"]
        child.save(update_fields=["guide_id", "updated_at"])
        return Response(ChildSerializer(child).data)

    @action(detail=True, methods=["get"])
    def rewards(self, request, pk=None):
        return Response(rewards_for(self.get_object()))

    @action(detail=True, methods=["get"])
    def sessions(self, request, pk=None):
        from apps.practice.serializers import PracticeSessionSerializer

        sessions = self.get_object().practice_sessions.order_by("-started_at")[:20]
        return Response(PracticeSessionSerializer(sessions, many=True).data)

    @action(detail=True, methods=["get", "delete"])
    def recordings(self, request, pk=None):
        from apps.clinic.serializers import RecordingSerializer
        from apps.screening.models import Attempt

        child = self.get_object()
        attempts = Attempt.objects.filter(child=child).exclude(audio="")
        if request.method == "DELETE":
            count = 0
            for attempt in attempts:
                attempt.audio.delete(save=False)
                attempt.audio = ""
                attempt.save(update_fields=["audio"])
                count += 1
            return Response({"deleted": count})
        return Response(
            RecordingSerializer(
                attempts.select_related("word", "child"), many=True, context={"request": request}
            ).data
        )


class GuideListView(APIView):
    @extend_schema(responses=GuideSerializer(many=True))
    def get(self, request):
        return Response(GuideSerializer(GUIDES, many=True).data)
