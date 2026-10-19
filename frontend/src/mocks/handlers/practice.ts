import { http, HttpResponse } from 'msw'
import type { Attempt, PracticeSession, Quest } from '@/types/domain'
import { db, uid } from '../db'
import { isolationPrompt, screeningWords, syllablePrompts } from '../fixtures/words'
import { fakeClassify } from './screening'
import { api, latency, notFound } from './utils'

/** New children get a fresh quest path starting at isolation. */
function questsFor(childId: string): Quest[] {
  if (childId === 'c-youssef') return db.quests
  return db.quests.map((q, i) => ({
    ...q,
    id: `${childId}-q-${q.day}`,
    state: i === 0 ? 'today' : 'locked',
    starsEarned: 0,
  }))
}

const findQuest = (id: string) => {
  const direct = db.quests.find((q) => q.id === id)
  if (direct) return direct
  const [childId] = id.split('-q-')
  return questsFor(childId).find((q) => q.id === id)
}

export const practiceHandlers = [
  http.get(api('/children/:id/quests/'), async ({ params }) => {
    await latency()
    return HttpResponse.json(questsFor(params.id as string))
  }),

  http.get(api('/quests/:id/'), async ({ params }) => {
    await latency()
    const q = findQuest(params.id as string)
    return q ? HttpResponse.json(q) : notFound('quest')
  }),

  http.post(api('/quests/:id/attempts/'), async ({ params, request }) => {
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 400))
    const q = findQuest(params.id as string)
    if (!q) return notFound('quest')
    const form = await request.formData()
    const wordId = String(form.get('wordId'))
    const word = [...screeningWords, ...syllablePrompts, isolationPrompt].find((w) => w.id === wordId)
    if (!word) return notFound('word')
    const attempt: Attempt = {
      id: uid('att'),
      wordId,
      word: word.word,
      targetSound: word.targetSound,
      position: word.position,
      ...fakeClassify(),
      createdAt: new Date().toISOString(),
    }
    return HttpResponse.json(attempt, { status: 201 })
  }),

  http.post(api('/quests/:id/complete/'), async ({ params }) => {
    await latency()
    const q = findQuest(params.id as string)
    if (!q) return notFound('quest')
    const starsEarned = 3
    if (db.quests.includes(q)) {
      q.state = 'completed'
      q.starsEarned = starsEarned
      const next = db.quests.find((x) => x.day === q.day + 1)
      if (next && next.state === 'locked') next.state = 'today'
      db.rewards.stars += starsEarned
    }
    const session: PracticeSession = {
      id: uid('ses'),
      childId: 'c-youssef',
      questId: q.id,
      startedAt: new Date(Date.now() - 9 * 60_000).toISOString(),
      endedAt: new Date().toISOString(),
      durationMin: 9,
      attempts: 20,
      correct: 15,
      level: q.level,
      sound: q.sound,
      summary: '',
    }
    db.sessions.unshift(session)
    return HttpResponse.json({ session, starsEarned })
  }),
]
