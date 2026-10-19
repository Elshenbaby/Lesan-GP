import { http, HttpResponse } from 'msw'
import { endpoints as ep } from '@/lib/api/endpoints'
import type { Role, User } from '@/types/domain'
import { db, uid } from '../db'
import { api, latency, userIdFrom } from './utils'

const tokensFor = (user: User) => ({ access: `mock-access.${user.id}`, refresh: `mock-refresh.${user.id}` })

export const authHandlers = [
  http.post(api(ep.auth.login), async ({ request }) => {
    await latency()
    const { email } = (await request.json()) as { email: string; password: string }
    let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      if (!email.includes('@')) {
        return HttpResponse.json(
          { code: 'invalid_credentials', message: 'Wrong email or password' },
          { status: 400 },
        )
      }
      // Any unknown email logs in as a new parent so the demo never dead-ends.
      user = {
        id: uid('u'),
        email,
        fullName: email.split('@')[0],
        role: 'parent',
        locale: 'ar',
        createdAt: new Date().toISOString(),
      }
      db.users.push(user)
    }
    return HttpResponse.json({ user, tokens: tokensFor(user) })
  }),

  http.post(api(ep.auth.signup), async ({ request }) => {
    await latency()
    const body = (await request.json()) as { email: string; fullName: string; role: Role }
    if (db.users.some((u) => u.email === body.email)) {
      return HttpResponse.json(
        { code: 'email_taken', message: 'Email already registered', fields: { email: ['taken'] } },
        { status: 400 },
      )
    }
    const user: User = {
      id: uid('u'),
      email: body.email,
      fullName: body.fullName,
      role: body.role,
      locale: 'ar',
      createdAt: new Date().toISOString(),
    }
    db.users.push(user)
    return HttpResponse.json({ user, tokens: tokensFor(user) }, { status: 201 })
  }),

  http.post(api(ep.auth.refresh), async ({ request }) => {
    const { refresh } = (await request.json()) as { refresh: string }
    return HttpResponse.json({ access: refresh.replace('mock-refresh.', 'mock-access.') })
  }),

  http.get(api(ep.auth.me), ({ request }) => {
    const user = db.users.find((u) => u.id === userIdFrom(request))
    return user ? HttpResponse.json(user) : HttpResponse.json({ code: 'unauthorized' }, { status: 401 })
  }),

  http.post(api(ep.auth.forgotPassword), async () => {
    await latency()
    return HttpResponse.json({ ok: true })
  }),
]
