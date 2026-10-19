import { http, HttpResponse } from 'msw'
import { endpoints as ep } from '@/lib/api/endpoints'
import type {
  Attempt,
  LispType,
  Plan,
  Screening,
  Severity,
  SoundLabel,
  SoundResult,
  TargetSound,
  WordPosition,
} from '@/types/domain'
import { db, uid } from '../db'
import { screeningSummary } from '../fixtures/data'
import { screeningWords } from '../fixtures/words'
import { api, latency, loc, media, notFound } from './utils'

const LISP_TYPES: LispType[] = ['interdental', 'dentalized', 'lateral', 'palatal']

/** Stand-in for the AI service: mostly correct, interdental-heavy errors, sometimes unsure. */
export function fakeClassify(): Pick<Attempt, 'label' | 'confidence' | 'needsRepeat'> {
  const r = Math.random()
  const confidence = 0.55 + Math.random() * 0.43
  if (r < 0.08) return { label: 'correct', confidence: 0.38, needsRepeat: true }
  if (r < 0.62) return { label: 'correct', confidence, needsRepeat: false }
  const label: SoundLabel = r < 0.9 ? 'interdental' : LISP_TYPES[Math.floor(Math.random() * 4)]
  return { label, confidence, needsRepeat: false }
}

export const severityFor = (accuracy: number): Severity =>
  accuracy >= 85 ? 'typical' : accuracy >= 50 ? 'moderate' : 'severe'

function computeResults(attempts: Attempt[]): SoundResult[] {
  const sounds = [...new Set(attempts.map((a) => a.targetSound))] as TargetSound[]
  return sounds.map((sound) => {
    const forSound = attempts.filter((a) => a.targetSound === sound && !a.needsRepeat)
    const pct = (xs: Attempt[]) =>
      xs.length ? Math.round((xs.filter((a) => a.label === 'correct').length / xs.length) * 100) : 100
    const byPosition = Object.fromEntries(
      (['initial', 'medial', 'final'] as WordPosition[]).map((p) => [
        p,
        pct(forSound.filter((a) => a.position === p)),
      ]),
    ) as Record<WordPosition, number>
    const errors = forSound.filter((a) => a.label !== 'correct')
    const counts = LISP_TYPES.map((t) => [t, errors.filter((e) => e.label === t).length] as const).sort(
      (a, b) => b[1] - a[1],
    )
    const accuracy = pct(forSound)
    return {
      sound,
      accuracy,
      byPosition,
      dominantLispType: errors.length ? counts[0][0] : undefined,
      severity: severityFor(accuracy),
    }
  })
}

const withMedia = (s: Screening): Screening => ({
  ...s,
  attempts: s.attempts.map((a) => ({ ...a, audioUrl: media(a.audioUrl) })),
})

export const screeningHandlers = [
  http.post(api(ep.screening.start), async ({ request }) => {
    await latency()
    const { childId } = (await request.json()) as { childId: string }
    const screening: Screening = {
      id: uid('scr'),
      childId,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      words: screeningWords,
      attempts: [],
      results: [],
      sharedWithTherapist: false,
    }
    db.screenings.push(screening)
    return HttpResponse.json(screening, { status: 201 })
  }),

  http.get(api('/screenings/:id/'), async ({ params, request }) => {
    await latency()
    const s = db.screenings.find((x) => x.id === params.id)
    if (!s) return notFound('screening')
    const summary = screeningSummary[s.id] ? loc(request, screeningSummary[s.id]) : s.summary
    return HttpResponse.json(withMedia({ ...s, summary }))
  }),

  http.post(api('/screenings/:id/attempts/'), async ({ params, request }) => {
    await delay600()
    const s = db.screenings.find((x) => x.id === params.id)
    if (!s) return notFound('screening')
    const form = await request.formData()
    const word = s.words.find((w) => w.id === form.get('wordId'))
    if (!word) return notFound('word')
    const attempt: Attempt = {
      id: uid('att'),
      wordId: word.id,
      word: word.word,
      targetSound: word.targetSound,
      position: word.position,
      ...fakeClassify(),
      audioUrl: `/media/recordings/${word.id}.wav`,
      createdAt: new Date().toISOString(),
    }
    s.attempts = [...s.attempts.filter((a) => a.wordId !== word.id), attempt]
    return HttpResponse.json(attempt, { status: 201 })
  }),

  http.post(api('/screenings/:id/complete/'), async ({ params, request }) => {
    await latency()
    const s = db.screenings.find((x) => x.id === params.id)
    if (!s) return notFound('screening')
    s.status = 'completed'
    s.completedAt = new Date().toISOString()
    s.results = computeResults(s.attempts)
    const worst = [...s.results].sort((a, b) => a.accuracy - b.accuracy)[0]
    s.overallSeverity = worst?.severity ?? 'typical'
    const lisp = worst?.dominantLispType ?? 'interdental'
    s.summary = loc(request, {
      ar: `لسان لاحظ صعوبة في ${worst?.sound ?? 'س'} (${worst?.accuracy ?? 0}٪ صح).`,
      en: `Lisan noticed difficulty with ${worst?.sound ?? 'س'} (${worst?.accuracy ?? 0}% correct).`,
    })

    const child = db.children.find((c) => c.id === s.childId)
    if (child) {
      child.latestScreeningId = s.id
      const plan: Plan = {
        id: uid('plan'),
        childId: child.id,
        status: 'pending_approval',
        targetSounds: s.results.filter((r) => r.accuracy < 85).map((r) => r.sound),
        lispType: lisp,
        severity: s.overallSeverity,
        baselineAccuracy: worst?.accuracy ?? 100,
        durationWeeks: s.overallSeverity === 'typical' ? 3 : 8,
        minutesPerDay: 10,
        reassessEveryWeeks: 2,
        reminderEnabled: true,
        currentLevel: 'isolation',
        currentSound: worst?.sound ?? 'س',
        phases: [
          {
            id: uid('ph'),
            weekFrom: 1,
            weekTo: 2,
            sound: worst?.sound ?? 'س',
            levels: ['isolation', 'syllables'],
            focus: 'tongue_placement',
          },
          {
            id: uid('ph'),
            weekFrom: 3,
            weekTo: 5,
            sound: worst?.sound ?? 'س',
            levels: ['words'],
            focus: 'words_start_end_middle',
          },
          {
            id: uid('ph'),
            weekFrom: 6,
            weekTo: 8,
            sound: worst?.sound ?? 'س',
            levels: ['phrases', 'sentences'],
            focus: 'phrases_then_z',
          },
        ],
      }
      db.plans.push(plan)
      child.planId = plan.id
      child.currentLevel = 'isolation'
    }
    return HttpResponse.json(withMedia(s))
  }),

  http.post(api('/screenings/:id/share/'), async ({ params }) => {
    await latency()
    const s = db.screenings.find((x) => x.id === params.id)
    if (!s) return notFound('screening')
    s.sharedWithTherapist = true
    return HttpResponse.json({ ok: true })
  }),

  // ---------- Plans ----------
  http.get(api('/plans/:id/'), async ({ params }) => {
    await latency()
    const p = db.plans.find((x) => x.id === params.id)
    return p ? HttpResponse.json(p) : notFound('plan')
  }),

  http.patch(api('/plans/:id/'), async ({ params, request }) => {
    const p = db.plans.find((x) => x.id === params.id)
    if (!p) return notFound('plan')
    Object.assign(p, await request.json())
    return HttpResponse.json(p)
  }),

  http.post(api('/plans/:id/approve/'), async ({ params, request }) => {
    await latency()
    const p = db.plans.find((x) => x.id === params.id)
    if (!p) return notFound('plan')
    Object.assign(p, await request.json(), { approvedByParentAt: new Date().toISOString() })
    p.status = p.approvedByTherapistAt ? 'active' : 'approved'
    return HttpResponse.json(p)
  }),
]

function delay600() {
  return new Promise((r) => setTimeout(r, 600 + Math.random() * 500))
}
