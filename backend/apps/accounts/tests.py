import pytest


@pytest.mark.django_db
def test_signup_returns_session_in_camel_case(api):
    res = api.post(
        "/api/v1/auth/signup/",
        {"email": "new@test.app", "password": "long-enough-1", "fullName": "New Parent", "role": "parent"},
        format="json",
    )
    assert res.status_code == 201
    body = res.json()
    assert body["user"]["fullName"] == "New Parent"
    assert set(body["tokens"]) == {"access", "refresh"}


@pytest.mark.django_db
def test_therapist_signup_requires_license(api):
    res = api.post(
        "/api/v1/auth/signup/",
        {"email": "t@test.app", "password": "long-enough-1", "fullName": "T", "role": "therapist"},
        format="json",
    )
    assert res.status_code == 400
    assert res.json()["code"] == "validation_error"
    assert "licenseNumber" in res.json()["fields"]


def test_login_and_me(api, parent):
    res = api.post("/api/v1/auth/login/", {"email": parent.email, "password": "password-123"}, format="json")
    assert res.status_code == 200
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {res.json()['tokens']['access']}")
    assert api.get("/api/v1/auth/me/").json()["email"] == parent.email


def test_login_rejects_bad_password(api, parent):
    res = api.post("/api/v1/auth/login/", {"email": parent.email, "password": "nope"}, format="json")
    assert res.status_code == 400
