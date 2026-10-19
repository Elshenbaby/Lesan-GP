/**
 * React Query hooks — the only data API components should use.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Child, GuideId, Plan, SoundLabel } from '@/types/domain'
import { useAuthStore } from '@/stores/auth'
import { qk } from './queryKeys'
import {
  authApi,
  childrenApi,
  clinicApi,
  plansApi,
  practiceApi,
  publicApi,
  screeningApi,
  type AttemptInput,
  type ChildInput,
  type LoginInput,
  type SignupInput,
} from './services'

// ---------- Auth ----------
export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: ({ user, tokens }) => setSession(user, tokens),
  })
}

export function useSignup() {
  const setSession = useAuthStore((s) => s.setSession)
  return useMutation({
    mutationFn: (input: SignupInput) => authApi.signup(input),
    onSuccess: ({ user, tokens }) => setSession(user, tokens),
  })
}

export const useForgotPassword = () => useMutation({ mutationFn: authApi.forgotPassword })

// ---------- Children ----------
export const useChildren = () => useQuery({ queryKey: qk.children, queryFn: childrenApi.list })

export const useChild = (id?: string) =>
  useQuery({ queryKey: qk.child(id ?? ''), queryFn: () => childrenApi.get(id!), enabled: !!id })

export function useCreateChild() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ChildInput) => childrenApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.children }),
  })
}

export function useUpdateChild(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Child>) => childrenApi.update(id, input),
    onSuccess: (child) => {
      qc.setQueryData(qk.child(id), child)
      qc.invalidateQueries({ queryKey: qk.children })
    },
  })
}

export const useGuides = () =>
  useQuery({ queryKey: qk.guides, queryFn: childrenApi.guides, staleTime: Infinity })

export function useSetGuide(childId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (guideId: GuideId) => childrenApi.setGuide(childId, guideId),
    onSuccess: (child) => qc.setQueryData(qk.child(childId), child),
  })
}

export const useRewards = (childId: string) =>
  useQuery({ queryKey: qk.rewards(childId), queryFn: () => childrenApi.rewards(childId) })

export const useProgress = (childId?: string) =>
  useQuery({
    queryKey: qk.progress(childId ?? ''),
    queryFn: () => childrenApi.progress(childId!),
    enabled: !!childId,
  })

export const useSessions = (childId?: string) =>
  useQuery({
    queryKey: qk.sessions(childId ?? ''),
    queryFn: () => childrenApi.sessions(childId!),
    enabled: !!childId,
  })

export const useChildRecordings = (childId?: string) =>
  useQuery({
    queryKey: qk.childRecordings(childId ?? ''),
    queryFn: () => childrenApi.recordings(childId!),
    enabled: !!childId,
  })

export function useDeleteRecordings(childId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => childrenApi.deleteRecordings(childId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.childRecordings(childId) }),
  })
}

// ---------- Screening ----------
export const useScreening = (id?: string) =>
  useQuery({ queryKey: qk.screening(id ?? ''), queryFn: () => screeningApi.get(id!), enabled: !!id })

export const useStartScreening = () => useMutation({ mutationFn: screeningApi.start })

export const useScreeningAttempt = (screeningId: string) =>
  useMutation({ mutationFn: (input: AttemptInput) => screeningApi.submitAttempt(screeningId, input) })

export function useCompleteScreening() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: screeningApi.complete,
    onSuccess: (s) => {
      qc.setQueryData(qk.screening(s.id), s)
      qc.invalidateQueries({ queryKey: qk.child(s.childId) })
    },
  })
}

export const useShareScreening = (id: string) =>
  useMutation({ mutationFn: (email: string) => screeningApi.share(id, email) })

// ---------- Plans ----------
export const usePlan = (id?: string) =>
  useQuery({ queryKey: qk.plan(id ?? ''), queryFn: () => plansApi.get(id!), enabled: !!id })

export function useUpdatePlan(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Plan>) => plansApi.update(id, input),
    onSuccess: (plan) => qc.setQueryData(qk.plan(id), plan),
  })
}

export function useApprovePlan(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Pick<Plan, 'practiceTime' | 'reminderEnabled'>) => plansApi.approve(id, input),
    onSuccess: (plan) => qc.setQueryData(qk.plan(id), plan),
  })
}

// ---------- Practice ----------
export const useQuests = (childId: string) =>
  useQuery({ queryKey: qk.quests(childId), queryFn: () => practiceApi.quests(childId) })

export const useQuest = (questId?: string) =>
  useQuery({
    queryKey: qk.quest(questId ?? ''),
    queryFn: () => practiceApi.quest(questId!),
    enabled: !!questId,
  })

export const useQuestAttempt = (questId: string) =>
  useMutation({ mutationFn: (input: AttemptInput) => practiceApi.submitAttempt(questId, input) })

export function useCompleteQuest(childId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: practiceApi.complete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.quests(childId) })
      qc.invalidateQueries({ queryKey: qk.rewards(childId) })
      qc.invalidateQueries({ queryKey: qk.progress(childId) })
    },
  })
}

// ---------- Clinic ----------
export const usePatients = () => useQuery({ queryKey: qk.patients, queryFn: clinicApi.patients })

export const usePatient = (childId?: string) =>
  useQuery({
    queryKey: qk.patient(childId ?? ''),
    queryFn: () => clinicApi.patient(childId!),
    enabled: !!childId,
  })

export const useReviewQueue = () => useQuery({ queryKey: qk.reviewQueue, queryFn: clinicApi.reviewQueue })

export function useLabelRecording() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, label }: { id: string; label: SoundLabel }) => clinicApi.labelRecording(id, label),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.reviewQueue }),
  })
}

export const useNotes = () => useQuery({ queryKey: qk.notes, queryFn: clinicApi.notes })

export function useAddNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ childId, body }: { childId: string; body: string }) => clinicApi.addNote(childId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notes }),
  })
}

export const useInvites = () => useQuery({ queryKey: qk.invites, queryFn: clinicApi.invites })

export function useSendInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: clinicApi.sendInvite,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.invites }),
  })
}

export function useRespondInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) => clinicApi.respondInvite(id, accept),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.invites })
      qc.invalidateQueries({ queryKey: qk.patients })
    },
  })
}

// ---------- Public ----------
export const useFreeCheck = () => useMutation({ mutationFn: publicApi.freeCheck })
export const usePartnerRequest = () => useMutation({ mutationFn: publicApi.partnerRequest })
