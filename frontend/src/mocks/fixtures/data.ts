import type {
  Child,
  Guide,
  Invite,
  LadderLevel,
  Patient,
  Plan,
  PracticeSession,
  ProgressOverview,
  Quest,
  Recording,
  Rewards,
  Screening,
  TherapistNote,
  User,
} from '@/types/domain'
import { isolationPrompt, screeningWords, syllablePrompts } from './words'

/** Text the real API localises from Accept-Language. */
export type Localized = { ar: string; en: string }

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()

// ---------- Users ----------
export const users: User[] = [
  {
    id: 'u-parent',
    email: 'parent@lisan.app',
    fullName: 'Mona Hassan',
    role: 'parent',
    locale: 'ar',
    createdAt: daysAgo(40),
  },
  {
    id: 'u-therapist',
    email: 'therapist@lisan.app',
    fullName: 'Dr. Nour El-Din',
    role: 'therapist',
    locale: 'ar',
    createdAt: daysAgo(120),
  },
  {
    id: 'u-adult',
    email: 'adult@lisan.app',
    fullName: 'Karim Adel',
    role: 'adult',
    locale: 'en',
    createdAt: daysAgo(10),
  },
]

// ---------- Guides ----------
export const guides: Guide[] = [
  { id: 'samsam', nameAr: 'سمسم', nameEn: 'Samsam', species: 'snake', favouriteSound: 'س', color: '#5f8a63' },
  { id: 'zuzu', nameAr: 'زوزو', nameEn: 'Zuzu', species: 'bee', favouriteSound: 'ز', color: '#d49a3a' },
  { id: 'shadi', nameAr: 'شادي', nameEn: 'Shadi', species: 'owl', favouriteSound: 'ش', color: '#8a6a4f' },
  { id: 'sara', nameAr: 'سارة', nameEn: 'Sara', species: 'fox', favouriteSound: 'ص', color: '#bb4d34' },
]

// ---------- Children (owned by u-parent) ----------
export const children: Child[] = [
  {
    id: 'c-youssef',
    name: 'Youssef',
    age: 6,
    dialect: 'egyptian',
    avatarSeed: 'youssef',
    guideId: 'samsam',
    previousTherapy: false,
    concerns: ['s_sounds_like_th', 'teased'],
    consentRecording: true,
    consentResearch: true,
    therapistId: 'u-therapist',
    createdAt: daysAgo(35),
    currentLevel: 'words',
    streakDays: 5,
    stars: 64,
    latestScreeningId: 'scr-youssef',
    planId: 'plan-youssef',
  },
  {
    id: 'c-malak',
    name: 'Malak',
    age: 8,
    dialect: 'egyptian',
    avatarSeed: 'malak',
    previousTherapy: false,
    concerns: ['unsure'],
    consentRecording: true,
    consentResearch: false,
    createdAt: daysAgo(2),
    streakDays: 0,
    stars: 0,
  },
]

// ---------- Screening ----------
export const screenings: Screening[] = [
  {
    id: 'scr-youssef',
    childId: 'c-youssef',
    status: 'completed',
    startedAt: daysAgo(30),
    completedAt: daysAgo(30),
    words: screeningWords,
    attempts: screeningWords.map((w, i) => ({
      id: `att-${w.id}`,
      wordId: w.id,
      word: w.word,
      targetSound: w.targetSound,
      position: w.position,
      label: [0, 1, 3, 5, 8].includes(i) ? 'interdental' : 'correct',
      confidence: 0.72 + (i % 4) * 0.06,
      needsRepeat: false,
      audioUrl: `/media/recordings/att-${w.id}.wav`,
      createdAt: daysAgo(30),
    })),
    results: [
      {
        sound: 'س',
        accuracy: 58,
        byPosition: { initial: 34, medial: 67, final: 72 },
        dominantLispType: 'interdental',
        severity: 'moderate',
      },
      {
        sound: 'ز',
        accuracy: 66,
        byPosition: { initial: 50, medial: 75, final: 75 },
        dominantLispType: 'interdental',
        severity: 'moderate',
      },
    ],
    overallSeverity: 'moderate',
    sharedWithTherapist: true,
  },
]

export const screeningSummary: Record<string, Localized> = {
  'scr-youssef': {
    ar: 'لسان لاحظ لثغة بين الأسنان في السين والزاي، أغلبها في أول الكلمة — درجة متوسطة.',
    en: 'Lisan noticed an interdental (frontal) lisp on S and Z, mostly at the start of words — moderate.',
  },
}

// ---------- Plan ----------
export const plans: Plan[] = [
  {
    id: 'plan-youssef',
    childId: 'c-youssef',
    status: 'active',
    targetSounds: ['س', 'ز'],
    lispType: 'interdental',
    severity: 'moderate',
    baselineAccuracy: 58,
    durationWeeks: 8,
    minutesPerDay: 10,
    reassessEveryWeeks: 2,
    practiceTime: '17:30',
    reminderEnabled: true,
    approvedByParentAt: daysAgo(29),
    approvedByTherapistAt: daysAgo(28),
    therapistNotes: 'Keep warm-ups focused on tongue-behind-teeth. Start ز in week 6 only if س words ≥ 80%.',
    currentLevel: 'words',
    currentSound: 'س',
    phases: [
      {
        id: 'ph1',
        weekFrom: 1,
        weekTo: 2,
        sound: 'س',
        levels: ['isolation', 'syllables'],
        focus: 'tongue_placement',
      },
      { id: 'ph2', weekFrom: 3, weekTo: 5, sound: 'س', levels: ['words'], focus: 'words_start_end_middle' },
      {
        id: 'ph3',
        weekFrom: 6,
        weekTo: 8,
        sound: 'س',
        levels: ['phrases', 'sentences'],
        focus: 'phrases_then_z',
      },
    ],
  },
]

// ---------- Quests (Youssef) ----------
const questLevels: LadderLevel[] = [
  'isolation',
  'isolation',
  'syllables',
  'syllables',
  'words',
  'words',
  'words',
  'phrases',
  'phrases',
  'sentences',
  'stories',
  'conversation',
]

export const quests: Quest[] = questLevels.map((level, i) => {
  const day = i + 1
  const prompts =
    level === 'isolation'
      ? [isolationPrompt]
      : level === 'syllables'
        ? syllablePrompts
        : screeningWords.filter((w) => w.targetSound === 'س')
  return {
    id: `q-${day}`,
    day,
    level,
    sound: 'س',
    state: day < 5 ? 'completed' : day === 5 ? 'today' : 'locked',
    starsEarned: day < 5 ? 3 : 0,
    steps: [
      { id: `q-${day}-warm`, kind: 'warmup', title: 'warmup', prompts: [] },
      { id: `q-${day}-sound`, kind: 'sound', title: 'sound', prompts: [isolationPrompt] },
      { id: `q-${day}-word`, kind: 'word', title: 'word', prompts: prompts.slice(0, 5) },
    ],
  }
})

export const rewards: Rewards = {
  stars: 64,
  streakDays: 5,
  stickers: [
    { id: 'st1', name: 'first_hiss', unlocked: true },
    { id: 'st2', name: 'three_days', unlocked: true },
    { id: 'st3', name: 'word_explorer', unlocked: true },
    { id: 'st4', name: 'five_days', unlocked: true },
    { id: 'st5', name: 'phrase_climber', unlocked: false },
    { id: 'st6', name: 'story_teller', unlocked: false },
    { id: 'st7', name: 'summit', unlocked: false },
    { id: 'st8', name: 'graduate', unlocked: false },
  ],
  outfits: [
    { id: 'o1', name: 'explorer_hat', unlocked: true, equipped: true },
    { id: 'o2', name: 'scarf', unlocked: true, equipped: false },
    { id: 'o3', name: 'backpack', unlocked: false, equipped: false },
    { id: 'o4', name: 'crown', unlocked: false, equipped: false },
  ],
  calendar: Array.from({ length: 14 }, (_, i) => ({
    date: daysAgo(13 - i),
    practiced: i >= 9 || i % 3 !== 0,
  })),
}

// ---------- Progress ----------
const weeks = ['W1', 'W2', 'W3', 'W4', 'W5']
export const progress: Record<string, Omit<ProgressOverview, 'weeklyTip' | 'weeklyHeadline'>> = {
  'c-youssef': {
    childId: 'c-youssef',
    currentLevel: 'words',
    levelsCompleted: ['isolation', 'syllables'],
    streakDays: 5,
    minutesThisWeek: 48,
    sessionsThisWeek: 5,
    sounds: [
      {
        sound: 'س',
        position: 'initial',
        series: [34, 41, 45, 58, 72].map((accuracy, i) => ({ week: weeks[i], accuracy })),
      },
      {
        sound: 'س',
        position: 'medial',
        series: [67, 66, 71, 75, 80].map((accuracy, i) => ({ week: weeks[i], accuracy })),
      },
      {
        sound: 'س',
        position: 'final',
        series: [72, 74, 78, 81, 85].map((accuracy, i) => ({ week: weeks[i], accuracy })),
      },
      {
        sound: 'ز',
        position: 'all',
        series: [66, 66, 68, 70, 71].map((accuracy, i) => ({ week: weeks[i], accuracy })),
      },
    ],
  },
}

export const weeklyCopy: Record<string, { headline: Localized; tip: Localized }> = {
  'c-youssef': {
    headline: { ar: 'السين في أول الكلمة: ٤٥٪ ← ٧٢٪ الأسبوع ده', en: 'S at word start: 45% → 72% this week' },
    tip: {
      ar: 'وأنتم في السوبر ماركت، اطلبوا من يوسف يسمّي ٣ حاجات فيها سين — "سكر، سمنة، بسكوت".',
      en: 'At the supermarket, ask Youssef to name 3 things with S — "sukkar, samna, baskot".',
    },
  },
}

export const sessions: PracticeSession[] = [4, 3, 2, 1].map((n, i) => ({
  id: `ses-${n}`,
  childId: 'c-youssef',
  questId: `q-${n}`,
  startedAt: daysAgo(i + 1),
  endedAt: daysAgo(i + 1),
  durationMin: 9 + (i % 2),
  attempts: 24 + i * 2,
  correct: 17 + i,
  level: n <= 2 ? 'isolation' : 'syllables',
  sound: 'س',
  summary: 'session_summary',
}))

// ---------- Clinic ----------
const synthetic = (
  id: string,
  name: string,
  age: number,
  level: LadderLevel,
  extra: Partial<Patient>,
): Patient => ({
  child: {
    id,
    name,
    age,
    dialect: 'egyptian',
    avatarSeed: id,
    previousTherapy: false,
    concerns: [],
    consentRecording: true,
    consentResearch: true,
    therapistId: 'u-therapist',
    createdAt: daysAgo(60),
    currentLevel: level,
    streakDays: 0,
    stars: 0,
  },
  parentName: 'Parent',
  status: 'practicing',
  severity: 'moderate',
  lispType: 'interdental',
  accuracy: 60,
  accuracyDelta: 0,
  pendingReviews: 0,
  planStatus: 'active',
  ...extra,
})

export const patients: Patient[] = [
  {
    child: children[0],
    parentName: 'Mona Hassan',
    status: 'practicing',
    severity: 'moderate',
    lispType: 'interdental',
    accuracy: 72,
    accuracyDelta: 14,
    lastSessionAt: daysAgo(1),
    pendingReviews: 3,
    planStatus: 'active',
  },
  synthetic('c-omar', 'Omar', 7, 'syllables', {
    parentName: 'Ahmed Samir',
    status: 'stuck',
    accuracy: 44,
    accuracyDelta: -3,
    lastSessionAt: daysAgo(2),
    pendingReviews: 2,
    lispType: 'dentalized',
  }),
  synthetic('c-laila', 'Laila', 5, 'words', {
    parentName: 'Heba Mostafa',
    status: 'ready',
    accuracy: 84,
    accuracyDelta: 9,
    lastSessionAt: daysAgo(0),
    pendingReviews: 1,
    severity: 'typical',
  }),
  synthetic('c-hamza', 'Hamza', 9, 'phrases', {
    parentName: 'Tamer Fawzy',
    status: 'practicing',
    accuracy: 68,
    accuracyDelta: 5,
    lastSessionAt: daysAgo(1),
    pendingReviews: 0,
  }),
  synthetic('c-farida', 'Farida', 6, 'isolation', {
    parentName: 'Dina Salah',
    status: 'inactive',
    accuracy: 52,
    accuracyDelta: 0,
    lastSessionAt: daysAgo(9),
    pendingReviews: 0,
    planStatus: 'pending_approval',
  }),
  synthetic('c-adam', 'Adam', 10, 'syllables', {
    parentName: 'Rania Kamal',
    status: 'practicing',
    severity: 'severe',
    lispType: 'lateral',
    accuracy: 38,
    accuracyDelta: 6,
    lastSessionAt: daysAgo(1),
    pendingReviews: 2,
  }),
]

const recWords = screeningWords
export const recordings: Recording[] = [
  ['c-youssef', 'Youssef', 0, 'interdental', 0.81],
  ['c-youssef', 'Youssef', 5, 'correct', 0.64],
  ['c-youssef', 'Youssef', 8, 'interdental', 0.58],
  ['c-omar', 'Omar', 1, 'dentalized', 0.77],
  ['c-omar', 'Omar', 6, 'correct', 0.52],
  ['c-laila', 'Laila', 3, 'correct', 0.91],
  ['c-adam', 'Adam', 2, 'lateral', 0.88],
  ['c-adam', 'Adam', 9, 'lateral', 0.69],
].map(([childId, childName, w, aiLabel, aiConfidence], i) => {
  const word = recWords[w as number]
  return {
    id: `rec-${i + 1}`,
    childId: childId as string,
    childName: childName as string,
    word: word.word,
    targetSound: word.targetSound,
    position: word.position,
    aiLabel: aiLabel as Recording['aiLabel'],
    aiConfidence: aiConfidence as number,
    audioUrl: `/media/recordings/rec-${i + 1}.wav`,
    createdAt: daysAgo(i % 3),
  }
})

export const notes: TherapistNote[] = [
  {
    id: 'n1',
    childId: 'c-youssef',
    childName: 'Youssef',
    body: 'Great tongue placement in isolation. Moving to words this week; watch word-initial S.',
    createdAt: daysAgo(6),
  },
  {
    id: 'n2',
    childId: 'c-adam',
    childName: 'Adam',
    body: 'Lateral pattern confirmed. Booked in-person visit; keep app practice to isolation only.',
    createdAt: daysAgo(3),
  },
  {
    id: 'n3',
    childId: 'c-omar',
    childName: 'Omar',
    body: 'Stuck at syllables for 2 weeks. Try mirror cues and slower pace.',
    createdAt: daysAgo(1),
  },
]

export const invites: Invite[] = [
  {
    id: 'inv1',
    email: 'heba.m@example.com',
    childName: 'Laila',
    direction: 'incoming',
    status: 'accepted',
    createdAt: daysAgo(20),
  },
  {
    id: 'inv2',
    email: 'sherif.a@example.com',
    childName: 'Selim',
    direction: 'incoming',
    status: 'pending',
    createdAt: daysAgo(1),
  },
  {
    id: 'inv3',
    email: 'family.k@example.com',
    direction: 'outgoing',
    status: 'pending',
    createdAt: daysAgo(4),
  },
]
