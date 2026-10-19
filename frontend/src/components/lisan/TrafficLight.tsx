import { useTranslation } from 'react-i18next'
import type { Severity } from '@/types/domain'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

export const severityTone: Record<Severity, BadgeTone> = { typical: 'ok', moderate: 'warn', severe: 'alert' }

/** Three-dot traffic light with the active severity lit. */
export function TrafficLight({ severity, className }: { severity: Severity; className?: string }) {
  const lit = { typical: 0, moderate: 1, severe: 2 }[severity]
  const colors = ['bg-ok', 'bg-warn', 'bg-alert']
  return (
    <span className={cn('bg-teal/90 inline-flex gap-1 rounded-full p-1', className)} aria-hidden="true">
      {colors.map((c, i) => (
        <span key={c} className={cn('size-2.5 rounded-full', i === lit ? c : 'bg-cream/20')} />
      ))}
    </span>
  )
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { t } = useTranslation()
  return (
    <Badge tone={severityTone[severity]} dot>
      {t(`severity.${severity}`)}
    </Badge>
  )
}
