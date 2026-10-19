from django.db.models import Q
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.common.permissions import IsGuardian
from apps.common.views import ScopedQuerysetMixin

from .models import Plan
from .serializers import ApproveSerializer, PlanSerializer, TherapistPlanSerializer
from .services import approve_by_parent


class PlanViewSet(
    ScopedQuerysetMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet
):
    queryset = Plan.objects.select_related("child").prefetch_related("phases")
    http_method_names = ["get", "patch", "post"]

    def scope(self, queryset, user):
        return queryset.filter(Q(child__parent=user) | Q(child__therapist=user))

    def get_serializer_class(self):
        return (
            TherapistPlanSerializer
            if getattr(self.request.user, "role", None) == "therapist"
            else PlanSerializer
        )

    def perform_update(self, serializer):
        plan = serializer.instance
        if self.request.user.role != "therapist" and plan.child.parent_id != self.request.user.id:
            raise PermissionDenied()
        if self.request.user.role != "therapist":
            # Parents can tweak schedule; level and status are therapist decisions.
            for field in ("current_level", "status", "therapist_notes"):
                serializer.validated_data.pop(field, None)
        plan = serializer.save()
        if plan.status == Plan.Status.ACTIVE:
            from apps.practice.services import ensure_quests

            ensure_quests(plan)

    @extend_schema(request=ApproveSerializer, responses=PlanSerializer)
    @action(detail=True, methods=["post"], permission_classes=[IsGuardian])
    def approve(self, request, pk=None):
        payload = ApproveSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        plan = approve_by_parent(self.get_object(), **payload.validated_data)
        return Response(PlanSerializer(plan).data)
