from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import ChildViewSet, GuideListView

router = SimpleRouter()
router.register("children", ChildViewSet, basename="child")

urlpatterns = [path("guides/", GuideListView.as_view(), name="guides"), *router.urls]
