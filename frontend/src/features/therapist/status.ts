import type { BadgeTone } from '@/components/ui'
import type { PatientStatus } from '@/types/domain'

export const statusTone: Record<PatientStatus, BadgeTone> = {
  practicing: 'teal',
  stuck: 'alert',
  ready: 'ok',
  inactive: 'neutral',
}
