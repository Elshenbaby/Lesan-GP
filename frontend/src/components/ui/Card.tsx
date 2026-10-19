import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type Tone = 'cream' | 'sand' | 'teal' | 'tan' | 'rust'

const tones: Record<Tone, string> = {
  cream: 'bg-cream text-teal',
  sand: 'bg-sand text-teal',
  tan: 'bg-tan text-teal',
  teal: 'bg-teal text-tan',
  rust: 'bg-rust text-cream',
}

export function Card({
  tone = 'cream',
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return <div className={cn('rounded-card shadow-soft p-6', tones[tone], className)} {...rest} />
}

export function CardHeader({
  title,
  eyebrow,
  action,
  className,
}: {
  title: ReactNode
  eyebrow?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-5 flex items-start justify-between gap-4', className)}>
      <div>
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h3 className="text-xl">{title}</h3>
      </div>
      {action}
    </div>
  )
}

/** Big number tile used across dashboards. */
export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = 'cream',
}: {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  tone?: Tone
}) {
  return (
    <Card tone={tone} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        {icon && <span className="opacity-70">{icon}</span>}
      </div>
      <div className="font-display text-4xl leading-none">{value}</div>
      {hint && <div className="text-sm opacity-75">{hint}</div>}
    </Card>
  )
}
