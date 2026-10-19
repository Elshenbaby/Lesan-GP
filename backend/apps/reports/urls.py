from django.urls import path

from .views import ProgressView

urlpatterns = [path("children/<uuid:child_id>/progress/", ProgressView.as_view(), name="child-progress")]
