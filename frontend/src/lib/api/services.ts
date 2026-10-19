/**
 * Typed request functions, grouped by backend resource.
 * Components never call `http` directly: they use the hooks in ./hooks, which call these.
 */
import type {
  Attempt,
  AuthResponse,
  Child,
  FreeCheckAnswers,
  FreeCheckResult,
  Guide,
  GuideId,
  Invite,
  Patient,
  Plan,
  PracticeSession,
  ProgressOverview,
  Quest,
  Recording,
  Rewards,
  Role,
  Screening,
  SoundLabel,
  TherapistNote,
  User,
} from '@/types/domain'
import { http } from './client'
import { endpoints as ep } from './endpoints'

const data = <T>(p: Promise<{ data: T }>) => p.then((r) => r.data)

// ---------- Auth ----------
export interface LoginInput {
  email: string
  password: string
}
export interface SignupInput extends LoginInput {
  fullName: string
  role: Role
  clinicName?: string
  licenseNumber?: string
}

export const authApi = {
  login: (input: LoginInput) => data(http.post<AuthResponse>(ep.auth.login, input)),
  signup: (input: SignupInput) => data(http.post<AuthResponse>(ep.auth.signup, input)),
  me: () => data(http.get<User>(ep.auth.me)),
  forgotPassword: (email: string) => data(http.post<{ ok: true }>(ep.auth.forgotPassword, { email })),
}

// ---------- Children ----------
export type ChildInput = Pick<
  Child,
  'name' | 'age' | 'previousTherapy' | 'concerns' | 'consentRecording' | 'consentResearch'
>

export const childrenApi = {
  list: () => data(http.get<Child[]>(ep.children.list)),
  get: (id: string) => data(http.get<Child>(ep.children.detail(id))),
  create: (input: ChildInput) => data(http.post<Child>(ep.children.list, input)),
  update: (id: string, input: Partial<Child>) => data(http.patch<Child>(ep.children.detail(id), input)),
  setGuide: (id: string, guideId: GuideId) => data(http.post<Child>(ep.children.guide(id), { guideId })),
  rewards: (id: string) => data(http.get<Rewards>(ep.children.rewards(id))),
  progress: (id: string) => data(http.get<ProgressOverview>(ep.children.progress(id))),
  sessions: (id: string) => data(http.get<PracticeSession[]>(ep.children.sessions(id))),
  recordings: (id: string) => data(http.get<Recording[]>(ep.children.recordings(id))),
  deleteRecordings: (id: string) => data(http.delete<{ deleted: number }>(ep.children.recordings(id))),
  guides: () => data(http.get<Guide[]>(ep.guides)),
}

// ---------- Screening ----------
export interface AttemptInput {
  wordId: string
  audio: Blob | null
}

function attemptForm({ wordId, audio }: AttemptInput) {
  const form = new FormData()
  form.append('wordId', wordId)
  if (audio) form.append('audio', audio, `${wordId}.webm`)
  return form
}

export const screeningApi = {
  start: (childId: string) => data(http.post<Screening>(ep.screening.start, { childId })),
  get: (id: string) => data(http.get<Screening>(ep.screening.detail(id))),
  submitAttempt: (id: string, input: AttemptInput) =>
    data(
      http.post<Attempt>(ep.screening.attempt(id), attemptForm(input), {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ),
  complete: (id: string) => data(http.post<Screening>(ep.screening.complete(id))),
  share: (id: string, therapistEmail: string) =>
    data(http.post<{ ok: true }>(ep.screening.share(id), { therapistEmail })),
}

// ---------- Plans ----------
export const plansApi = {
  get: (id: string) => data(http.get<Plan>(ep.plans.detail(id))),
  update: (id: string, input: Partial<Plan>) => data(http.patch<Plan>(ep.plans.detail(id), input)),
  approve: (id: string, input: Pick<Plan, 'practiceTime' | 'reminderEnabled'>) =>
    data(http.post<Plan>(ep.plans.approve(id), input)),
}

// ---------- Practice ----------
export const practiceApi = {
  quests: (childId: string) => data(http.get<Quest[]>(ep.practice.quests(childId))),
  quest: (questId: string) => data(http.get<Quest>(ep.practice.quest(questId))),
  submitAttempt: (questId: string, input: AttemptInput) =>
    data(
      http.post<Attempt>(ep.practice.attempt(questId), attemptForm(input), {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ),
  complete: (questId: string) =>
    data(http.post<{ session: PracticeSession; starsEarned: number }>(ep.practice.complete(questId))),
}

// ---------- Clinic ----------
export const clinicApi = {
  patients: () => data(http.get<Patient[]>(ep.clinic.patients)),
  patient: (childId: string) => data(http.get<Patient>(ep.clinic.patient(childId))),
  reviewQueue: () => data(http.get<Recording[]>(ep.clinic.reviewQueue)),
  labelRecording: (id: string, label: SoundLabel) =>
    data(http.post<Recording>(ep.clinic.labelRecording(id), { label })),
  notes: () => data(http.get<TherapistNote[]>(ep.clinic.notes)),
  addNote: (childId: string, body: string) =>
    data(http.post<TherapistNote>(ep.clinic.notes, { childId, body })),
  invites: () => data(http.get<Invite[]>(ep.clinic.invites)),
  sendInvite: (email: string) => data(http.post<Invite>(ep.clinic.invites, { email })),
  respondInvite: (id: string, accept: boolean) =>
    data(http.patch<Invite>(ep.clinic.invite(id), { status: accept ? 'accepted' : 'declined' })),
}

// ---------- Public ----------
export const publicApi = {
  freeCheck: (answers: FreeCheckAnswers & { audio: Blob[] }) => {
    const form = new FormData()
    form.append('answers', JSON.stringify({ ...answers, audio: undefined }))
    answers.audio.forEach((b, i) => form.append('audio', b, `word-${i}.webm`))
    return data(
      http.post<FreeCheckResult>(ep.freeCheck, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
    )
  },
  partnerRequest: (input: { name: string; email: string; clinic: string; message?: string }) =>
    data(http.post<{ ok: true }>(ep.partnerRequest, input)),
}
