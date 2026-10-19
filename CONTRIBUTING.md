# Contributing to Lisan

## Branches

- `main`: always demo-able. Protected; merge through PRs only.
- `develop`: integration branch for the current sprint.
- Feature branches come off `develop`:

```
feat/<area>-<thing>      feat/child-practice-meter
fix/<area>-<thing>       fix/parent-report-rtl
chore/<thing>            chore/upgrade-vite
docs/<thing>             docs/api-sessions
```

`<area>` is one of `web`, `auth`, `child`, `parent`, `clinic`, `api`, `ai`, `infra`.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(child): add accuracy meter to practice game
fix(parent): correct RTL alignment on report cards
chore(api): add drf-spectacular
```

## Pull requests

1. Keep PRs small, with one feature or fix each. Draft PRs are welcome early.
2. Fill in the PR template, including screenshots in **both Arabic and English** for UI changes.
3. At least one approval, from the CODEOWNER of the touched area.
4. CI must be green (lint, typecheck, tests, build).
5. Squash-merge into `develop`.

## Ground rules

- **Never commit child audio, real personal data or secrets.** Use the fixtures in `frontend/src/mocks/fixtures` and `backend/fixtures`.
- **Every user-facing string goes through i18n** (`t('...')`), added to both `ar` and `en`.
- **API changes start in `docs/api-contract.md`.** Update the contract, the TypeScript types in `frontend/src/types`, and the MSW handlers in the same PR, so the frontend and backend stay in sync.
- **Child UI never shows scores, red X's or the word "problem".** Only encouragement.
- **Reports always carry the disclaimer** "screening result — confirm with a speech therapist".

## Where do I put my code?

See [docs/frontend-guide.md](docs/frontend-guide.md) for the frontend and
[docs/architecture.md](docs/architecture.md) for the backend and AI service.
