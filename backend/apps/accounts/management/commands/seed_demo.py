from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import User
from apps.children.models import Child

DEMO_PASSWORD = "lisan-demo-123"


class Command(BaseCommand):
    help = "Create demo accounts (parent, therapist, adult) and a child linked to the therapist. Idempotent."

    @transaction.atomic
    def handle(self, *args, **options):
        parent = self._user("parent@lisan.app", "Mona Hassan", User.Role.PARENT)
        therapist = self._user(
            "therapist@lisan.app",
            "Dr. Nour Adel",
            User.Role.THERAPIST,
            clinic_name="Nour Speech Clinic",
            license_number="EG-SLP-0420",
        )
        self._user("adult@lisan.app", "Karim Fathy", User.Role.ADULT)
        Child.objects.get_or_create(
            parent=parent,
            name="Youssef",
            defaults={
                "age": 6,
                "therapist": therapist,
                "consent_recording": True,
                "consent_research": True,
                "concerns": ["s_sounds_like_th", "tongue_out"],
                "avatar_seed": "youssef",
            },
        )
        self.stdout.write(self.style.SUCCESS(f"Demo data ready. Password for all accounts: {DEMO_PASSWORD}"))

    def _user(self, email, full_name, role, **extra):
        user, created = User.objects.get_or_create(
            email=email, defaults={"full_name": full_name, "role": role, **extra}
        )
        if created:
            user.set_password(DEMO_PASSWORD)
            user.save()
        return user
