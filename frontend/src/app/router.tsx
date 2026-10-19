import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { GuestOnly, RequireAuth, RequireRole } from './guards'
import { AuthLayout } from './layouts/AuthLayout'
import { ChildLayout } from './layouts/ChildLayout'
import { ClinicLayout } from './layouts/ClinicLayout'
import { MarketingLayout } from './layouts/MarketingLayout'
import { ParentLayout } from './layouts/ParentLayout'
import { RouteError } from './RouteError'

/** Lazy-load a page module's default export (keeps each surface in its own chunk). */
const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await load()).default,
})

const marketing: RouteObject = {
  element: <MarketingLayout />,
  children: [
    { index: true, lazy: page(() => import('@/features/marketing/pages/HomePage')) },
    { path: 'how-it-works', lazy: page(() => import('@/features/marketing/pages/HowItWorksPage')) },
    { path: 'free-check', lazy: page(() => import('@/features/marketing/pages/FreeCheckPage')) },
    { path: 'for-therapists', lazy: page(() => import('@/features/marketing/pages/ForTherapistsPage')) },
    { path: 'about', lazy: page(() => import('@/features/marketing/pages/AboutPage')) },
    { path: 'privacy', lazy: page(() => import('@/features/marketing/pages/PrivacyPage')) },
  ],
}

const auth: RouteObject = {
  element: (
    <GuestOnly>
      <AuthLayout />
    </GuestOnly>
  ),
  children: [
    { path: 'login', lazy: page(() => import('@/features/auth/pages/LoginPage')) },
    { path: 'signup', lazy: page(() => import('@/features/auth/pages/SignupPage')) },
    { path: 'forgot-password', lazy: page(() => import('@/features/auth/pages/ForgotPasswordPage')) },
  ],
}

const onboarding: RouteObject = {
  path: 'onboarding',
  element: <RequireRole roles={['parent', 'adult']} />,
  children: [
    {
      element: <AuthLayout variant="wide" />,
      children: [{ path: 'child', lazy: page(() => import('@/features/onboarding/pages/AddChildPage')) }],
    },
  ],
}

const child: RouteObject = {
  path: 'play/:childId',
  element: (
    <RequireAuth>
      <ChildLayout />
    </RequireAuth>
  ),
  children: [
    { index: true, element: <Navigate to="world" replace /> },
    { path: 'handover', lazy: page(() => import('@/features/child/pages/HandoverPage')) },
    { path: 'guide', lazy: page(() => import('@/features/child/pages/GuideSelectPage')) },
    { path: 'world', lazy: page(() => import('@/features/child/pages/WorldPage')) },
    { path: 'screening', lazy: page(() => import('@/features/child/pages/ScreeningPage')) },
    { path: 'quest/:questId', lazy: page(() => import('@/features/child/pages/QuestPage')) },
    { path: 'rewards', lazy: page(() => import('@/features/child/pages/RewardsPage')) },
  ],
}

const parent: RouteObject = {
  path: 'parent',
  element: (
    <RequireRole roles={['parent', 'adult']}>
      <ParentLayout />
    </RequireRole>
  ),
  children: [
    { index: true, lazy: page(() => import('@/features/parent/pages/DashboardPage')) },
    { path: 'children/:childId', lazy: page(() => import('@/features/parent/pages/ChildProfilePage')) },
    { path: 'reports/:screeningId', lazy: page(() => import('@/features/parent/pages/ReportPage')) },
    { path: 'plan', lazy: page(() => import('@/features/parent/pages/PlanPage')) },
    { path: 'progress', lazy: page(() => import('@/features/parent/pages/ProgressPage')) },
    { path: 'settings', lazy: page(() => import('@/features/parent/pages/SettingsPage')) },
  ],
}

const clinic: RouteObject = {
  path: 'clinic',
  element: (
    <RequireRole roles={['therapist']}>
      <ClinicLayout />
    </RequireRole>
  ),
  children: [
    { index: true, element: <Navigate to="patients" replace /> },
    { path: 'patients', lazy: page(() => import('@/features/therapist/pages/PatientsPage')) },
    { path: 'patients/:childId', lazy: page(() => import('@/features/therapist/pages/PatientDetailPage')) },
    { path: 'patients/:childId/plan', lazy: page(() => import('@/features/therapist/pages/PlanEditorPage')) },
    { path: 'review', lazy: page(() => import('@/features/therapist/pages/ReviewPage')) },
    { path: 'invites', lazy: page(() => import('@/features/therapist/pages/InvitesPage')) },
    { path: 'notes', lazy: page(() => import('@/features/therapist/pages/NotesPage')) },
  ],
}

export const routes: RouteObject[] = [
  {
    path: '/',
    errorElement: <RouteError />,
    children: [
      marketing,
      auth,
      onboarding,
      child,
      parent,
      clinic,
      { path: '*', lazy: page(() => import('./NotFoundPage')) },
    ],
  },
]

export const router = createBrowserRouter(routes, {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_skipActionErrorRevalidation: true,
  },
})
