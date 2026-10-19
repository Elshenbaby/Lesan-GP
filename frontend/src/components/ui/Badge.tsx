import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export type BadgeTone = 'neutral' | 'ok' | 'warn' | 'alert' | 'teal' | 'rust'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-sand text-sage',
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-[#9a6a1c]',
  alert: 'bg-alert-soft text-rust',
  teal: 'bg-teal text-tan',
  rust: 'bg-rust text-cream',
}

export function Badge({
  tone = 'neutral',
  children,
  className,
  dot,
}: {
  tone?: BadgeTone
  children: ReactNode
  className?: string
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
