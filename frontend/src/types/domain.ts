/**
 * Domain models shared by every surface.
 * Keep in sync with backend serializers and docs/api-contract.md.
 */

export type ID = string
export type ISODate = string

// ---------- Accounts ----------

export type Role = 'parent' | 'adult' | 'therapist'

export interface User {
  id: ID
  email: string
  fullName: string
  role: Role
  locale: Locale
  avatarUrl?: string
  createdAt: ISODate
}

export type Locale = 'ar' | 'en'

export interface AuthTokens {
  access: string
  refresh: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// ---------- Speech ----------

/** MVP target sounds. س and ز first; ش and ص are on the roadmap. */
export type TargetSound = 'س' | 'ز' | 'ش' | 'ص'

export type WordPosition = 'initial' | 'medial' | 'final'

export type LispType = 'interdental' | 'dentalized' | 'lateral' | 'palatal'

export type SoundLabel = 'correct' | LispType

export type Severity = 'typical' | 'moderate' | 'severe'

/** Therapy ladder, bottom to top. */
export const LADDER_LEVELS = [
  'isolation',
  'syllables',
  'words',
  'phrases',
  'sentences',
  'stories',
  'conversation',
] as const
export type LadderLevel = (typeof LADDER_LEVELS)[number]

// ---------- Children ----------

export interface Child {
  id: ID
  name: string
  age: number
  dialect: 'egyptian'
  avatarSeed: string
  guideId?: GuideId
  previousTherapy: boolean
  concerns: string[]
  consentRecording: boolean
  consentResearch: boolean
  therapistId?: ID
  createdAt: ISODate
  /** Denormalised for dashboards */
  currentLevel?: LadderLevel
  streakDays?: number
  stars?: number
  latestScreeningId?: ID
  planId?: ID
}

export type GuideId = 'samsam' | 'zuzu' | 'shadi' | 'sara'

export interface Guide {
  id: GuideId
  nameAr: string
  nameEn: string
  species: 'snake' | 'bee' | 'owl' | 'fox'
  favouriteSound: TargetSound
  color: string
}

// ---------- Screening ----------

export interface ScreeningWord {
  id: ID
  word: string
  transliteration: string
  meaningEn: string
  targetSound: TargetSound
  position: WordPosition
  picture: PictureKey
}

/** Placeholder picture keys; swapped for illustrations later. */
export type PictureKey =
  | 'fish'
  | 'clock'
  | 'car'
  | 'chair'
  | 'cookie'
  | 'sun'
  | 'lantern'
  | 'bus'
  | 'flower'
  | 'pizza'
  | 'banana'
  | 'wind'

export interface Attempt {
  id: ID
  wordId: ID
  word: string
  targetSound: TargetSound
  position: WordPosition
  label: SoundLabel
  confidence: number
  /** true when confidence was too low; UI asks the child to repeat */
  needsRepeat: boolean
  audioUrl?: string
  createdAt: ISODate
}

export interface SoundResult {
  sound: TargetSound
  accuracy: number
  byPosition: Record<WordPosition, number>
  dominantLispType?: LispType
  severity: Severity
}

export type ScreeningStatus = 'in_progress' | 'processing' | 'completed'

export interface Screening {
  id: ID
  childId: ID
  status: ScreeningStatus
  startedAt: ISODate
  completedAt?: ISODate
  words: ScreeningWord[]
  attempts: Attempt[]
  results: SoundResult[]
  summary?: string
  overallSeverity?: Severity
  sharedWithTherapist: boolean
}

// ---------- Plans ----------

export type PlanStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'completed'

export interface PlanPhase {
  id: ID
  weekFrom: number
  weekTo: number
  sound: TargetSound
  levels: LadderLevel[]
  focus: string
}

export interface Plan {
  id: ID
  childId: ID
  status: PlanStatus
  targetSounds: TargetSound[]
  lispType: LispType
  severity: Severity
  baselineAccuracy: number
  durationWeeks: number
  minutesPerDay: number
  reassessEveryWeeks: number
  phases: PlanPhase[]
  practiceTime?: string
  reminderEnabled: boolean
  approvedByParentAt?: ISODate
  approvedByTherapistAt?: ISODate
  therapistNotes?: string
  currentLevel: LadderLevel
  currentSound: TargetSound
}

// ---------- Practice ----------

export type QuestStepKind = 'warmup' | 'sound' | 'word' | 'story'

export interface QuestStep {
  id: ID
  kind: QuestStepKind
  title: string
  prompts: ScreeningWord[]
}

export type QuestState = 'locked' | 'available' | 'today' | 'completed'

export interface Quest {
  id: ID
  day: number
  level: LadderLevel
  sound: TargetSound
  state: QuestState
  steps: QuestStep[]
  starsEarned: number
}

export interface PracticeSession {
  id: ID
  childId: ID
  questId: ID
  startedAt: ISODate
  endedAt?: ISODate
  durationMin: number
  attempts: number
  correct: number
  level: LadderLevel
  sound: TargetSound
  summary: string
}

export interface Rewards {
  stars: number
  streakDays: number
  stickers: { id: ID; name: string; unlocked: boolean }[]
  outfits: { id: ID; name: string; unlocked: boolean; equipped: boolean }[]
  calendar: { date: ISODate; practiced: boolean }[]
}

// ---------- Progress ----------

export interface ProgressPoint {
  week: string
  accuracy: number
}

export interface SoundProgress {
  sound: TargetSound
  position: WordPosition | 'all'
  series: ProgressPoint[]
}

export interface ProgressOverview {
  childId: ID
  currentLevel: LadderLevel
  levelsCompleted: LadderLevel[]
  streakDays: number
  minutesThisWeek: number
  sessionsThisWeek: number
  sounds: SoundProgress[]
  weeklyTip: string
  weeklyHeadline: string
}

// ---------- Clinic ----------

export type PatientStatus = 'practicing' | 'stuck' | 'ready' | 'inactive'

export interface Patient {
  child: Child
  parentName: string
  status: PatientStatus
  severity: Severity
  lispType: LispType
  accuracy: number
  accuracyDelta: number
  lastSessionAt?: ISODate
  pendingReviews: number
  planStatus: PlanStatus
}

export interface Recording {
  id: ID
  childId: ID
  childName: string
  word: string
  targetSound: TargetSound
  position: WordPosition
  aiLabel: SoundLabel
  aiConfidence: number
  therapistLabel?: SoundLabel
  audioUrl: string
  createdAt: ISODate
}

export interface TherapistNote {
  id: ID
  childId: ID
  childName: string
  body: string
  createdAt: ISODate
}

export interface Invite {
  id: ID
  email: string
  childName?: string
  direction: 'incoming' | 'outgoing'
  status: 'pending' | 'accepted' | 'declined'
  createdAt: ISODate
}

// ---------- Free check (public) ----------

export interface FreeCheckAnswers {
  childAge: number
  concerns: string[]
  noticedSounds: TargetSound[]
  previousTherapy: boolean
}

export interface FreeCheckResult {
  likelihood: 'low' | 'possible' | 'likely'
  soundsToCheck: TargetSound[]
  message: string
}

// ---------- Common ----------

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  status: number
  code: string
  message: string
  fields?: Record<string, string[]>
}
