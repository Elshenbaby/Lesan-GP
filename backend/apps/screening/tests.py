from django.core.files.uploadedfile import SimpleUploadedFile

from apps.plans.models import Plan
from apps.screening.models import Word
from apps.screening.services import compute_results


def _upload(name="w.webm"):
    return SimpleUploadedFile(name, b"\x1a\x45\xdf\xa3fake-webm", content_type="audio/webm")


def test_full_screening_flow_creates_pending_plan(parent_api, child):
    res = parent_api.post("/api/v1/screenings/", {"childId": str(child.id)}, format="json")
    assert res.status_code == 201
    screening = res.json()
    assert len(screening["words"]) == 11

    for word in screening["words"]:
        res = parent_api.post(
            f"/api/v1/screenings/{screening['id']}/attempts/",
            {"wordId": word["id"], "audio": _upload()},
            format="multipart",
        )
        assert res.status_code == 201
        assert res.json()["label"] in {"correct", "interdental"}

    res = parent_api.post(f"/api/v1/screenings/{screening['id']}/complete/")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "completed"
    assert {r["sound"] for r in body["results"]} == {"س", "ز"}
    assert set(body["results"][0]["byPosition"]) == {"initial", "medial", "final"}

    plan = Plan.objects.get(child=child)
    assert plan.status == Plan.Status.PENDING_APPROVAL
    assert plan.phases.count() == 3


def test_other_parents_cannot_see_screening(api, child, db):
    from apps.accounts.models import User

    stranger = User.objects.create_user("x@test.app", "password-123", full_name="X", role="parent")
    api.force_authenticate(stranger)
    res = api.post("/api/v1/screenings/", {"childId": str(child.id)}, format="json")
    assert res.status_code == 404


class FakeAttempt:
    def __init__(self, word, label, needs_repeat=False):
        self.word, self.final_label, self.needs_repeat = word, label, needs_repeat


def test_compute_results_bands_and_dominant_type(db):
    words = {w.id: w for w in Word.objects.filter(kind="screening")}
    attempts = [
        FakeAttempt(words["w1"], "interdental"),
        FakeAttempt(words["w2"], "interdental"),
        FakeAttempt(words["w4"], "correct"),
        FakeAttempt(words["w6"], "lateral"),
        FakeAttempt(words["w7"], "correct", needs_repeat=True),
    ]
    [seen] = compute_results(attempts)
    assert seen["accuracy"] == 25
    assert seen["severity"] == "severe"
    assert seen["dominant_lisp_type"] == "interdental"
    assert seen["by_position"]["initial"] == 0
