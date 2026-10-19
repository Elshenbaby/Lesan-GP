from django.urls import path

from .views import (
    InviteListCreateView,
    InviteRespondView,
    LabelRecordingView,
    NoteListCreateView,
    PatientDetailView,
    PatientListView,
    ReviewQueueView,
)

urlpatterns = [
    path("patients/", PatientListView.as_view(), name="clinic-patients"),
    path("patients/<uuid:child_id>/", PatientDetailView.as_view(), name="clinic-patient"),
    path("recordings/", ReviewQueueView.as_view(), name="clinic-review-queue"),
    path("recordings/<uuid:pk>/label/", LabelRecordingView.as_view(), name="clinic-label-recording"),
    path("notes/", NoteListCreateView.as_view(), name="clinic-notes"),
    path("invites/", InviteListCreateView.as_view(), name="clinic-invites"),
    path("invites/<uuid:pk>/", InviteRespondView.as_view(), name="clinic-invite"),
]
