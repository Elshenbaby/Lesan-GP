from django.core.files.uploadedfile import SimpleUploadedFile

from apps.screening.models import Word
from apps.screening.services import record_attempt


def test_patients_list_is_therapist_only(parent_api, therapist_api, child):
    assert parent_api.get("/api/v1/clinic/patients/").status_code == 403
    res = therapist_api.get("/api/v1/clinic/patients/")
    assert res.status_code == 200
    [row] = res.json()
    assert row["child"]["name"] == "Youssef"
    assert row["status"] == "inactive"


def test_review_queue_and_labeling(therapist_api, child):
    audio = SimpleUploadedFile("a.webm", b"fake", content_type="audio/webm")
    attempt = record_attempt(child=child, word=Word.objects.get(id="w1"), audio=audio)

    queue = therapist_api.get("/api/v1/clinic/recordings/").json()
    assert [r["id"] for r in queue] == [str(attempt.id)]

    res = therapist_api.post(
        f"/api/v1/clinic/recordings/{attempt.id}/label/", {"label": "lateral"}, format="json"
    )
    assert res.status_code == 200
    assert res.json()["therapistLabel"] == "lateral"
    assert therapist_api.get("/api/v1/clinic/recordings/").json() == []


def test_notes_round_trip(therapist_api, child):
    res = therapist_api.post(
        "/api/v1/clinic/notes/", {"childId": str(child.id), "body": "Mirror cues help."}, format="json"
    )
    assert res.status_code == 201
    assert therapist_api.get("/api/v1/clinic/notes/").json()[0]["childName"] == "Youssef"
