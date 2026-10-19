import { http, HttpResponse } from 'msw'
import { endpoints as ep } from '@/lib/api/endpoints'
import type { Invite, SoundLabel, TherapistNote } from '@/types/domain'
import { db, uid } from '../db'
import { api, latency, media, notFound } from './utils'

export const clinicHandlers = [
  http.get(api(ep.clinic.patients), async () => {
    await latency()
    return HttpResponse.json(db.patients)
  }),

  http.get(api('/clinic/patients/:id/'), async ({ params }) => {
    await latency()
    const p = db.patients.find((x) => x.child.id === params.id)
    return p ? HttpResponse.json(p) : notFound('patient')
  }),

  http.get(api(ep.clinic.reviewQueue), async () => {
    await latency()
    return HttpResponse.json(
      db.recordings.filter((r) => !r.therapistLabel).map((r) => ({ ...r, audioUrl: media(r.audioUrl) })),
    )
  }),

  http.post(api('/clinic/recordings/:id/label/'), async ({ params, request }) => {
    await latency()
    const rec = db.recordings.find((r) => r.id === params.id)
    if (!rec) return notFound('recording')
    rec.therapistLabel = ((await request.json()) as { label: SoundLabel }).label
    const patient = db.patients.find((p) => p.child.id === rec.childId)
    if (patient) patient.pendingReviews = Math.max(0, patient.pendingReviews - 1)
    return HttpResponse.json({ ...rec, audioUrl: media(rec.audioUrl) })
  }),

  http.get(api(ep.clinic.notes), async () => {
    await latency()
    return HttpResponse.json([...db.notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }),

  http.post(api(ep.clinic.notes), async ({ request }) => {
    const { childId, body } = (await request.json()) as { childId: string; body: string }
    const childName = db.patients.find((p) => p.child.id === childId)?.child.name ?? ''
    const note: TherapistNote = {
      id: uid('n'),
      childId,
      childName,
      body,
      createdAt: new Date().toISOString(),
    }
    db.notes.push(note)
    return HttpResponse.json(note, { status: 201 })
  }),

  http.get(api(ep.clinic.invites), async () => {
    await latency()
    return HttpResponse.json(db.invites)
  }),

  http.post(api(ep.clinic.invites), async ({ request }) => {
    await latency()
    const { email } = (await request.json()) as { email: string }
    const invite: Invite = {
      id: uid('inv'),
      email,
      direction: 'outgoing',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    db.invites.unshift(invite)
    return HttpResponse.json(invite, { status: 201 })
  }),

  http.patch(api('/clinic/invites/:id/'), async ({ params, request }) => {
    const inv = db.invites.find((i) => i.id === params.id)
    if (!inv) return notFound('invite')
    Object.assign(inv, await request.json())
    return HttpResponse.json(inv)
  }),
]
