# Lisan (لسان)

AI speech coach that screens children for lisps, identifies the affected sounds, and runs a
personalized daily practice plan, under a speech therapist's supervision. Egyptian Arabic first.

> Lisan is a screening and guided-practice tool. It never presents results as a diagnosis.

## Repository layout

| Path          | What lives here                                                          | Owner             |
| ------------- | ------------------------------------------------------------------------ | ----------------- |
| `frontend/`   | React + TypeScript web app: website, child, parent and therapist apps    | Frontend lead     |
| `backend/`    | Django + DRF API, PostgreSQL models, Celery jobs, plan engine            | Backend lead      |
| `ai-service/` | FastAPI speech service: denoise, align, classify, DSP features           | AI / speech lead  |
| `infra/`      | `docker-compose.yml` for the whole stack                                 | Backend lead      |
| `docs/`       | Architecture, API contract, design system, frontend guide                | Everyone          |

## Quick start (frontend only, mock API)

The frontend runs on its own with a mocked API (MSW), so UI work never waits on the backend.

```bash
# Node 20+ and pnpm 9 required
pnpm install
cp frontend/.env.example frontend/.env   # VITE_USE_MOCKS=true by default
pnpm dev                                 # http://localhost:5173
```

Demo accounts. In mock mode any password works; against the real backend (`python manage.py seed_demo`)
the password is `lisan-demo-123`.

| Email                   | Role      | Lands on   |
| ----------------------- | --------- | ---------- |
| `parent@lisan.app`      | Parent    | `/parent`  |
| `therapist@lisan.app`   | Therapist | `/clinic`  |

Child mode starts from the parent app ("Play with Youssef"); exiting it asks a grown-up math question.

## Full stack (Docker)

```bash
cp .env.example .env
docker compose -f infra/docker-compose.yml up --build
```

| Service    | URL                                  |
| ---------- | ------------------------------------ |
| Frontend   | http://localhost:5173                |
| API        | http://localhost:8000/api/v1/        |
| API docs   | http://localhost:8000/api/docs/      |
| AI service | http://localhost:8001/docs           |

Set `VITE_USE_MOCKS=false` in `frontend/.env` to point the UI at the real API. To run the backend or AI
service without Docker, see [backend/README.md](backend/README.md) and [ai-service/README.md](ai-service/README.md).

## Common scripts (repo root)

```bash
pnpm dev         # frontend dev server
pnpm build       # production build
pnpm lint        # ESLint
pnpm typecheck   # tsc --noEmit
pnpm test        # Vitest
```

## Docs

- [Architecture](docs/architecture.md)
- [API contract](docs/api-contract.md)
- [Design system](docs/design-system.md)
- [Frontend guide](docs/frontend-guide.md)
- [Contributing](CONTRIBUTING.md)
