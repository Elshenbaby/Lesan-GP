import { delay, HttpResponse } from 'msw'
import { API_URL } from '@/lib/api/client'
import type { Localized } from '../fixtures/data'

export const api = (path: string) => `${API_URL}${path}`

export const media = (path?: string) => (path && path.startsWith('/') ? `${API_URL}${path}` : path)

export const langOf = (request: Request): 'ar' | 'en' =>
  request.headers.get('Accept-Language')?.startsWith('en') ? 'en' : 'ar'

export const loc = (request: Request, text: Localized) => text[langOf(request)]

/** Simulated network latency so loading states are visible. */
export const latency = () => delay(250 + Math.random() * 350)

export const notFound = (what = 'resource') =>
  HttpResponse.json({ code: 'not_found', message: `${what} not found` }, { status: 404 })

export const userIdFrom = (request: Request) => {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  return token.startsWith('mock-access.') ? token.slice('mock-access.'.length) : null
}
