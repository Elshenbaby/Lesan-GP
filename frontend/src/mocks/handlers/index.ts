import { authHandlers } from './auth'
import { childrenHandlers } from './children'
import { clinicHandlers } from './clinic'
import { practiceHandlers } from './practice'
import { publicHandlers } from './public'
import { screeningHandlers } from './screening'

export const handlers = [
  ...authHandlers,
  ...childrenHandlers,
  ...screeningHandlers,
  ...practiceHandlers,
  ...clinicHandlers,
  ...publicHandlers,
]
