from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import ChildQuestListView, QuestViewSet

router = SimpleRouter()
router.register("quests", QuestViewSet, basename="quest")

urlpatterns = [
    path("children/<uuid:child_id>/quests/", ChildQuestListView.as_view(), name="child-quests"),
    *router.urls,
]
