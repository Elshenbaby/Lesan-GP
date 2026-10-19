import { http, HttpResponse } from 'msw'
import { endpoints as ep } from '@/lib/api/endpoints'
import type { Child, GuideId, PracticeSession } from '@/types/domain'
import { db, uid } from '../db'
import { progress, weeklyCopy } from '../fixtures/data'
import { api, latency, loc, media, notFound } from './utils'

const sessionSummary = (request: Request, s: PracticeSession, name: string) =>
  loc(request, {
    ar: `${name} اتمرّن ${s.durationMin} دقايق ونطق ${s.correct} من ${s.attempts} صح.`,
    en: `${name} practised for ${s.durationMin} minutes and said ${s.correct} of ${s.attempts} sounds right.`,
  })

export const childrenHandlers = [
  http.get(api(ep.guides), () => HttpResponse.json(db.guides)),

  http.get(api(ep.children.list), async () => {
    await latency()
    return HttpResponse.json(db.children)
  }),

  http.post(api(ep.children.list), async ({ request }) => {
    await latency()
    const body = (await request.json()) as Partial<Child>
    const child: Child = {
      id: uid('c'),
      name: body.name ?? 'Child',
      age: body.age ?? 6,
      dialect: 'egyptian',
      avatarSeed: body.name ?? 'child',
      previousTherapy: !!body.previousTherapy,
      concerns: body.concerns ?? [],
      consentRecording: !!body.consentRecording,
      consentResearch: !!body.consentResearch,
      createdAt: new Date().toISOString(),
      streakDays: 0,
      stars: 0,
    }
    db.children.push(child)
    return HttpResponse.json(child, { status: 201 })
  }),

  http.get(api('/children/:id/'), async ({ params }) => {
    await latency()
    const child = db.children.find((c) => c.id === params.id)
    return child ? HttpResponse.json(child) : notFound('child')
  }),

  http.patch(api('/children/:id/'), async ({ params, request }) => {
    const child = db.children.find((c) => c.id === params.id)
    if (!child) return notFound('child')
    Object.assign(child, await request.json())
    return HttpResponse.json(child)
  }),

  http.post(api('/children/:id/guide/'), async ({ params, request }) => {
    const child = db.children.find((c) => c.id === params.id)
    if (!child) return notFound('child')
    child.guideId = ((await request.json()) as { guideId: GuideId }).guideId
    return HttpResponse.json(child)
  }),

  http.get(api('/children/:id/rewards/'), async ({ params }) => {
    await latency()
    const child = db.children.find((c) => c.id === params.id)
    if (!child) return notFound('child')
    return HttpResponse.json(
      child.id === 'c-youssef'
        ? db.rewards
        : {
            ...db.rewards,
            stars: child.stars ?? 0,
            streakDays: 0,
            calendar: db.rewards.calendar.map((d) => ({ ...d, practiced: false })),
            stickers: db.rewards.stickers.map((s) => ({ ...s, unlocked: false })),
          },
    )
  }),

  http.get(api('/children/:id/progress/'), async ({ params, request }) => {
    await latency()
    const id = params.id as string
    const base = progress[id]
    const copy = weeklyCopy[id]
    if (!base || !copy) {
      return HttpResponse.json({
        childId: id,
        currentLevel: 'isolation',
        levelsCompleted: [],
        streakDays: 0,
        minutesThisWeek: 0,
        sessionsThisWeek: 0,
        sounds: [],
        weeklyHeadline: loc(request, { ar: 'لسه مفيش تمارين الأسبوع ده', en: 'No practice yet this week' }),
        weeklyTip: loc(request, {
          ar: 'ابدأوا بالاختبار عشان نعمل خطة مناسبة.',
          en: 'Start with the screening so we can build a plan.',
        }),
      })
    }
    return HttpResponse.json({
      ...base,
      weeklyHeadline: loc(request, copy.headline),
      weeklyTip: loc(request, copy.tip),
    })
  }),

  http.get(api('/children/:id/sessions/'), async ({ params, request }) => {
    await latency()
    const child = db.children.find((c) => c.id === params.id)
    if (!child) return notFound('child')
    return HttpResponse.json(
      db.sessions
        .filter((s) => s.childId === child.id)
        .map((s) => ({ ...s, summary: sessionSummary(request, s, child.name) })),
    )
  }),

  http.get(api('/children/:id/recordings/'), async ({ params }) => {
    await latency()
    return HttpResponse.json(
      db.recordings
        .filter((r) => r.childId === params.id)
        .map((r) => ({ ...r, audioUrl: media(r.audioUrl) })),
    )
  }),

  http.delete(api('/children/:id/recordings/'), async ({ params }) => {
    await latency()
    const before = db.recordings.length
    db.recordings = db.recordings.filter((r) => r.childId !== params.id)
    return HttpResponse.json({ deleted: before - db.recordings.length })
  }),
]
