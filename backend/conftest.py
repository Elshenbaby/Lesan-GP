import pytest
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.children.models import Child


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def parent(db):
    return User.objects.create_user("parent@test.app", "password-123", full_name="Test Parent", role="parent")


@pytest.fixture
def therapist(db):
    return User.objects.create_user(
        "therapist@test.app",
        "password-123",
        full_name="Test Therapist",
        role="therapist",
        license_number="X1",
    )


@pytest.fixture
def child(parent, therapist):
    return Child.objects.create(
        parent=parent, therapist=therapist, name="Youssef", age=6, consent_recording=True
    )


@pytest.fixture
def parent_api(api, parent):
    api.force_authenticate(parent)
    return api


@pytest.fixture
def therapist_api(therapist):
    client = APIClient()
    client.force_authenticate(therapist)
    return client
