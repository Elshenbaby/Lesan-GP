from django.urls import path

from .public_views import FreeCheckView, PartnerRequestView

urlpatterns = [
    path("free-check/", FreeCheckView.as_view(), name="free-check"),
    path("partner-request/", PartnerRequestView.as_view(), name="partner-request"),
]
