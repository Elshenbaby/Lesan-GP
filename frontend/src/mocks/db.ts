import * as fx from './fixtures/data'

/**
 * Mutable in-memory copy of the fixtures. Reset on page reload.
 * Handlers read and write here so the demo "remembers" actions during a session.
 */
export const db = {
  users: structuredClone(fx.users),
  guides: structuredClone(fx.guides),
  children: structuredClone(fx.children),
  screenings: structuredClone(fx.screenings),
  plans: structuredClone(fx.plans),
  quests: structuredClone(fx.quests),
  rewards: structuredClone(fx.rewards),
  sessions: structuredClone(fx.sessions),
  patients: structuredClone(fx.patients),
  recordings: structuredClone(fx.recordings),
  notes: structuredClone(fx.notes),
  invites: structuredClone(fx.invites),
}

export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`
