from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
FORM = {"word": "سمكة", "target_sound": "س", "position": "initial"}


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_crisp_hiss_is_correct(crisp_s):
    res = client.post("/classify", files={"audio": ("a.wav", crisp_s, "audio/wav")}, data=FORM)
    assert res.status_code == 200
    body = res.json()
    assert body["label"] == "correct"
    assert body["features"]["spectral_centroid_hz"] > 4500


def test_low_flat_hiss_is_interdental(lisped_s):
    res = client.post("/classify", files={"audio": ("a.wav", lisped_s, "audio/wav")}, data=FORM)
    assert res.status_code == 200
    assert res.json()["label"] == "interdental"
    assert res.json()["confidence"] > 0.5


def test_rejects_empty_and_garbage_audio():
    assert (
        client.post("/classify", files={"audio": ("a.wav", b"", "audio/wav")}, data=FORM).status_code == 400
    )
    assert (
        client.post("/classify", files={"audio": ("a.bin", b"not audio", "audio/wav")}, data=FORM).status_code
        == 422
    )


def test_validates_target_sound(crisp_s):
    res = client.post(
        "/classify", files={"audio": ("a.wav", crisp_s, "audio/wav")}, data={**FORM, "target_sound": "x"}
    )
    assert res.status_code == 422
