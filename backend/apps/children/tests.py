import json


def test_create_child_requires_recording_consent(parent_api):
    res = parent_api.post("/api/v1/children/", {"name": "Malak", "age": 5}, format="json")
    assert res.status_code == 400
    assert "consentRecording" in res.json()["fields"]


def test_create_list_and_pick_guide(parent_api):
    res = parent_api.post(
        "/api/v1/children/",
        {"name": "Malak", "age": 5, "consentRecording": True, "concerns": ["tongue_out"]},
        format="json",
    )
    assert res.status_code == 201
    child_id = res.json()["id"]
    assert [c["name"] for c in parent_api.get("/api/v1/children/").json()] == ["Malak"]

    res = parent_api.post(f"/api/v1/children/{child_id}/guide/", {"guideId": "zuzu"}, format="json")
    assert res.json()["guideId"] == "zuzu"


def test_rewards_and_progress_shapes(parent_api, child):
    rewards = parent_api.get(f"/api/v1/children/{child.id}/rewards/").json()
    assert len(rewards["calendar"]) == 14
    assert rewards["outfits"][0]["equipped"] is True

    progress = parent_api.get(f"/api/v1/children/{child.id}/progress/").json()
    assert progress["currentLevel"] == "isolation"
    assert progress["levelsCompleted"] == []


def test_guides_catalog(parent_api):
    assert [g["id"] for g in parent_api.get("/api/v1/guides/").json()] == ["samsam", "zuzu", "shadi", "sara"]


def test_public_free_check_is_anonymous(api):
    answers = {"childAge": 6, "concerns": ["tongue_out"], "noticedSounds": ["س"], "previousTherapy": False}
    res = api.post("/api/v1/public/free-check/", {"answers": json.dumps(answers)}, format="multipart")
    assert res.status_code == 200
    assert res.json()["likelihood"] == "possible"
