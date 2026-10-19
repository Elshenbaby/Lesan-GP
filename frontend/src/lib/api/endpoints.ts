/**
 * Single source of truth for REST paths (relative to VITE_API_URL).
 * Mirrors docs/api-contract.md and the Django urls in backend/apps/*.
 */
export const endpoints = {
  auth: {
    login: '/auth/login/',
    signup: '/auth/signup/',
    refresh: '/auth/refresh/',
    me: '/auth/me/',
    forgotPassword: '/auth/password/forgot/',
  },
  children: {
    list: '/children/',
    detail: (id: string) => `/children/${id}/`,
    guide: (id: string) => `/children/${id}/guide/`,
    rewards: (id: string) => `/children/${id}/rewards/`,
    progress: (id: string) => `/children/${id}/progress/`,
    sessions: (id: string) => `/children/${id}/sessions/`,
    recordings: (id: string) => `/children/${id}/recordings/`,
  },
  guides: '/guides/',
  screening: {
    start: '/screenings/',
    detail: (id: string) => `/screenings/${id}/`,
    attempt: (id: string) => `/screenings/${id}/attempts/`,
    complete: (id: string) => `/screenings/${id}/complete/`,
    share: (id: string) => `/screenings/${id}/share/`,
  },
  plans: {
    detail: (id: string) => `/plans/${id}/`,
    approve: (id: string) => `/plans/${id}/approve/`,
  },
  practice: {
    quests: (childId: string) => `/children/${childId}/quests/`,
    quest: (questId: string) => `/quests/${questId}/`,
    attempt: (questId: string) => `/quests/${questId}/attempts/`,
    complete: (questId: string) => `/quests/${questId}/complete/`,
  },
  clinic: {
    patients: '/clinic/patients/',
    patient: (childId: string) => `/clinic/patients/${childId}/`,
    reviewQueue: '/clinic/recordings/',
    labelRecording: (id: string) => `/clinic/recordings/${id}/label/`,
    notes: '/clinic/notes/',
    invites: '/clinic/invites/',
    invite: (id: string) => `/clinic/invites/${id}/`,
  },
  freeCheck: '/public/free-check/',
  partnerRequest: '/public/partner-request/',
} as const
