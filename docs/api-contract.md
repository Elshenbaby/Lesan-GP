# API contract

Base URL `/api/v1`. The live, generated schema is at `/api/docs/` (Swagger) and `/api/schema/` (OpenAPI YAML);
this page is the human summary. Frontend types live in `frontend/src/types/domain.ts`, paths in
`frontend/src/lib/api/endpoints.ts`, and the mock implementation in `frontend/src/mocks/handlers/`.
**Change all four together** (types, endpoints, mocks, Django) in the same PR.

## Conventions

- JSON keys are **camelCase** on the wire; Django converts to snake_case.
- Every id is an opaque string (UUIDs in Django, short ids in mocks).
- Auth: `Authorization: Bearer <access>`. Access tokens last 30 min; refresh with `POST /auth/refresh/`.
- Language: send `Accept-Language: ar|en`; localized text (summaries, tips) follows it.
- Uploads: `multipart/form-data` with `wordId` and `audio` (webm/opus from the browser, ≤ 5 MB).
- Errors always look like:

```json
{ "code": "validation_error", "message": "Invalid input.", "fields": { "email": ["email_taken"] } }
```

## Endpoints

| Method | Path | Who | Body → Response |
| ------ | ---- | --- | --------------- |
| POST | `/auth/signup/` | anyone | `{email, password, fullName, role, clinicName?, licenseNumber?}` → `{user, tokens}` |
| POST | `/auth/login/` | anyone | `{email, password}` → `{user, tokens}` |
| POST | `/auth/refresh/` | anyone | `{refresh}` → `{access, refresh}` |
| GET/PATCH | `/auth/me/` | signed in | → `User` |
| POST | `/auth/password/forgot/` | anyone | `{email}` → `{ok}` |
| GET/POST | `/children/` | parent | `ChildInput` → `Child[]` / `Child` |
| GET/PATCH | `/children/:id/` | parent (PATCH), therapist (GET) | → `Child` |
| POST | `/children/:id/guide/` | parent | `{guideId}` → `Child` |
| GET | `/children/:id/rewards/` | parent, therapist | → `Rewards` |
| GET | `/children/:id/progress/` | parent, therapist | → `ProgressOverview` |
| GET | `/children/:id/sessions/` | parent, therapist | → `PracticeSession[]` |
| GET/DELETE | `/children/:id/recordings/` | parent (DELETE), therapist | → `Recording[]` / `{deleted}` |
| GET | `/children/:id/quests/` | parent, therapist | → `Quest[]` |
| GET | `/guides/` | signed in | → `Guide[]` |
| POST | `/screenings/` | parent | `{childId}` → `Screening` |
| GET | `/screenings/:id/` | parent, therapist | → `Screening` |
| POST | `/screenings/:id/attempts/` | parent | multipart → `Attempt` |
| POST | `/screenings/:id/complete/` | parent | → `Screening` (with `results`, creates a plan) |
| POST | `/screenings/:id/share/` | parent | `{therapistEmail}` → `{ok}` |
| GET/PATCH | `/plans/:id/` | parent, therapist | `Partial<Plan>` → `Plan` |
| POST | `/plans/:id/approve/` | parent | `{practiceTime, reminderEnabled}` → `Plan` |
| GET | `/quests/:id/` | parent, therapist | → `Quest` |
| POST | `/quests/:id/attempts/` | parent | multipart → `Attempt` |
| POST | `/quests/:id/complete/` | parent | → `{session, starsEarned}` |
| GET | `/clinic/patients/` | therapist | → `Patient[]` |
| GET | `/clinic/patients/:childId/` | therapist | → `Patient` |
| GET | `/clinic/recordings/` | therapist | → `Recording[]` (unreviewed) |
| POST | `/clinic/recordings/:id/label/` | therapist | `{label}` → `Recording` |
| GET/POST | `/clinic/notes/` | therapist | `{childId, body}` → `TherapistNote[]` / `TherapistNote` |
| GET/POST | `/clinic/invites/` | therapist | `{email}` → `Invite[]` / `Invite` |
| PATCH | `/clinic/invites/:id/` | therapist | `{status: accepted|declined}` → `Invite` |
| POST | `/public/free-check/` | anyone (throttled) | multipart `answers` JSON + `audio[]` → `FreeCheckResult` |
| POST | `/public/partner-request/` | anyone (throttled) | `{name, email, clinic, message?}` → `{ok}` |

### Who may change a plan

Parents may change `practiceTime`, `reminderEnabled`, `minutesPerDay`. Therapists may also change `currentLevel`,
`status` (activate) and `therapistNotes`. Everything else is computed.

## AI service (internal)

`POST {AI_SERVICE_URL}/classify` multipart `audio`, `word`, `target_sound`, `position` →
`{label, confidence, model_version, features}`. `GET /health` → `{status, model_version}`.
