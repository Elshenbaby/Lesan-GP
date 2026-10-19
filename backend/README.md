# Lisan backend (Django + DRF)

REST API for the web app, served under `/api/v1/`. Interactive docs at `/api/docs/`.

## Run locally (without Docker)

```bash
cd backend
uv venv -p 3.12 .venv && source .venv/bin/activate   # or: python3.12 -m venv .venv
uv pip install -r requirements/dev.txt               # or: pip install -r requirements/dev.txt
python manage.py migrate
python manage.py seed_demo        # parent@lisan.app / therapist@lisan.app, password: lisan-demo-123
python manage.py runserver 8000
```

Without `DATABASE_URL` it uses SQLite. Celery needs Redis (`celery -A config worker -l info`); everything in
the request path works without it.

Point the frontend at it with `VITE_USE_MOCKS=false` and `VITE_API_URL=http://localhost:8000/api/v1`.

## Checks

```bash
ruff check . && ruff format --check .
python manage.py makemigrations --check --dry-run
pytest
```

## Layout

| App         | Owns                                                                    |
| ----------- | ----------------------------------------------------------------------- |
| `common`    | Base model, speech enums, permissions, error format, AI client, public endpoints |
| `accounts`  | Email-login `User` with role (parent / adult / therapist), JWT auth      |
| `children`  | Child profiles, guide catalog, rewards                                  |
| `screening` | Word list, screenings, every recorded `Attempt`, scoring                |
| `plans`     | Treatment plans + phases, rule-based generation, approvals              |
| `practice`  | Daily quests, practice sessions, ladder progression                     |
| `reports`   | Progress overview, weekly parent reports (Celery beat)                  |
| `clinic`    | Therapist caseload, recording review, notes, invites                    |

Conventions: business logic lives in `services.py`, views stay thin; JSON is camelCase on the wire
(`djangorestframework-camel-case`) and snake_case in Python; every id is a UUID string.
