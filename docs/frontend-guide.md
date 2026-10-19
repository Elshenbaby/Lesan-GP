# Frontend guide

## Stack

Vite 6 · React 18 · TypeScript (strict) · React Router 6 (data router, lazy routes) · Tailwind v4 ·
TanStack Query 5 · Axios · MSW 2 (mock API) · Zustand · react-hook-form + zod · react-i18next ·
Recharts · wavesurfer.js · Swiper · GSAP · Vitest + Testing Library.

## Folder map (`frontend/src`)

```
app/            router, providers, guards, layouts (Marketing, Auth, Child, Parent, Clinic, DashboardShell)
components/ui/  generic primitives: Button, Card, Input, Modal, Tabs, Badge, Toast…
components/lisan/ brand components: CircleStage, GuideDialog, TopoMap, MicButton, AccuracyChart…
design/         tokens.css (@theme) + global.css
features/<area>/ pages/ and components/ per surface: marketing, auth, onboarding, child, parent, therapist
i18n/{ar,en}/   one JSON per namespace: common, marketing, auth, child, parent, clinic
lib/api/        client (axios + JWT refresh), endpoints, services, hooks, queryKeys
lib/audio/      useRecorder (MediaRecorder + level meter), speak (speech synthesis)
mocks/          MSW handlers + fixtures; the whole app runs without a backend
stores/         auth, preferences, childMode (persisted Zustand stores)
types/domain.ts every API type, shared with docs/api-contract.md
```

## Rules of the road

- **Data:** components call hooks from `@/lib/api` only. Never import `http`/axios in a component. New endpoint =
  `endpoints.ts` → `services.ts` → `hooks.ts` → a mock handler in `mocks/handlers/` → `types/domain.ts`.
- **Text:** no hard-coded strings in JSX. Add the key to **both** `ar` and `en` JSON (TypeScript checks keys
  against `en`). Use `useTranslation('<namespace>')`; for a second namespace use `useTranslation(['a', 'b'])`
  and `t('b:key')`.
- **Styling:** Tailwind utilities with design tokens; logical properties for RTL. Merge classes with `cn()`.
- **Pages** default-export a component (lazy routes need it) and start with `<PageHeader>` in dashboards.
- **Forms:** react-hook-form + zod schema next to the form; show field errors via the `error` prop on inputs.
- **Child mode:** follow the rules in [design-system.md](design-system.md#child-mode-rules).

## Adding a page

1. Create `features/<area>/pages/MyPage.tsx` with a default export.
2. Register it in `app/router.tsx` with `lazy: page(() => import(...))` under the right layout and guard.
3. Add nav items to the layout if needed, and i18n keys in both languages.

## Mock vs real API

`VITE_USE_MOCKS=true` (default) starts MSW in the browser. Mock data resets on reload. Mock auth accepts any
password; unknown emails sign in as a new parent. Set `VITE_USE_MOCKS=false` and `VITE_API_URL` to use Django.

## Scripts

```bash
pnpm dev | build | lint | typecheck | test | format     # from the repo root
pnpm --filter @lisan/frontend test:watch
```

Recording needs a secure context: `localhost` works; on a phone use HTTPS (e.g. a tunnel).
