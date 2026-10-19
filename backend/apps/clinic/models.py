from django.conf import settings
from django.db import models

from apps.common.models import BaseModel


class TherapistNote(BaseModel):
    therapist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notes")
    child = models.ForeignKey("children.Child", on_delete=models.CASCADE, related_name="therapist_notes")
    body = models.TextField()


class Invite(BaseModel):
    """A link request between a family and a therapist, initiated by either side."""

    class Initiator(models.TextChoices):
        FAMILY = "family"
        THERAPIST = "therapist"

    class Status(models.TextChoices):
        PENDING = "pending"
        ACCEPTED = "accepted"
        DECLINED = "declined"

    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="clinic_invites",
    )
    email = models.EmailField(
        help_text="The other party's email (family's for outgoing, therapist's for incoming)."
    )
    child = models.ForeignKey(
        "children.Child", on_delete=models.CASCADE, null=True, blank=True, related_name="invites"
    )
    initiated_by = models.CharField(max_length=10, choices=Initiator.choices)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
