from django.db.models import Q
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import mixins, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from apps.children.models import Child
from apps.common.permissions import IsGuardian, can_access_child
from apps.common.views import ScopedQuerysetMixin
from apps.screening.models import Word
from apps.screening.serializers import AttemptInputSerializer, AttemptSerializer
from apps.screening.services import record_attempt

from .models import Quest
from .serializers import PracticeSessionSerializer, QuestSerializer
from .services import complete_quest


class ChildQuestListView(ScopedQuerysetMixin, ListAPIView):
    """The child's quest map: all quests of the active plan."""

    queryset = Quest.objects.all()
    serializer_class = QuestSerializer
    pagination_class = None

    def scope(self, queryset, user):
        child = get_object_or_404(Child, id=self.kwargs["child_id"])
        plan = child.active_plan
        if not plan or not can_access_child(user, child):
            return queryset.none()
        return queryset.filter(plan=plan)


class QuestViewSet(ScopedQuerysetMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Quest.objects.select_related("child", "plan")
    serializer_class = QuestSerializer

    def scope(self, queryset, user):
        return queryset.filter(Q(child__parent=user) | Q(child__therapist=user))

    def get_permissions(self):
        if self.action in ("attempts", "complete"):
            return [IsGuardian()]
        return super().get_permissions()

    def _playable(self) -> Quest:
        quest = self.get_object()
        if quest.state == Quest.State.LOCKED:
            raise ValidationError({"quest": "locked"})
        return quest

    @extend_schema(request=AttemptInputSerializer, responses=AttemptSerializer)
    @action(detail=True, methods=["post"])
    def attempts(self, request, pk=None):
        quest = self._playable()
        payload = AttemptInputSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        word = get_object_or_404(Word, id=payload.validated_data["word_id"])
        attempt = record_attempt(
            child=quest.child, word=word, audio=payload.validated_data.get("audio"), quest=quest
        )
        return Response(
            AttemptSerializer(attempt, context={"request": request}).data, status=status.HTTP_201_CREATED
        )

    @extend_schema(
        responses=inline_serializer(
            "QuestCompleteResponse",
            {"session": PracticeSessionSerializer(), "stars_earned": serializers.IntegerField()},
        )
    )
    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        quest = self._playable()
        if quest.state == Quest.State.COMPLETED:
            raise ValidationError({"quest": "already_completed"})
        session, stars = complete_quest(quest)
        return Response({"session": PracticeSessionSerializer(session).data, "stars_earned": stars})
