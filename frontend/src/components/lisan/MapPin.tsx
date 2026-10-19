import { Check, Lock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils/cn'

export type PinState = 'locked' | 'current' | 'done'

interface Props {
  x: number
  y: number
  label: ReactNode
  icon: LucideIcon
  state: PinState
  to?: string
  badge?: ReactNode
}

/** Round location marker on the world map. */
export function MapPin({ x, y, label, icon: Icon, state, to, badge }: Props) {
  const body = (
    <>
      <span
        className={cn(
          'mb-2 rounded-xs px-2 py-0.5 text-center text-sm leading-tight font-semibold whitespace-nowrap transition-all duration-500',
          state === 'current' ? 'bg-teal text-cream' : 'text-teal/80',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'relative grid size-[4.5rem] place-items-center rounded-full transition-all duration-500 ease-[var(--ease-out-cubic)] sm:size-[5.5rem]',
          state === 'locked' && 'bg-cream/60 text-tan-dark blur-[1.2px]',
          state === 'done' && 'bg-cream/90 text-tan-dark',
          state === 'current' && 'animate-glow bg-cream text-rust group-hover:scale-110',
        )}
      >
        <Icon className="size-8 sm:size-9" strokeWidth={1.4} />
        {state === 'done' && (
          <span className="bg-teal text-cream absolute -end-1 -top-1 grid size-7 place-items-center rounded-full">
            <Check className="size-4" />
          </span>
        )}
        {state === 'locked' && (
          <span className="bg-tan text-cream absolute -end-1 -top-1 grid size-6 place-items-center rounded-full">
            <Lock className="size-3" />
          </span>
        )}
      </span>
      {badge}
    </>
  )

  // Physical `left` on purpose: callers mirror x for RTL so pins and trail stay aligned.
  const style = { left: `${x}%`, top: `${y}%` }
  const cls = 'group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center'

  if (state === 'locked' || !to) {
    return (
      <div
        className={cn(cls, state === 'locked' && 'pointer-events-none')}
        style={style}
        aria-disabled={state === 'locked'}
      >
        {body}
      </div>
    )
  }
  return (
    <Link to={to} className={cls} style={style}>
      {body}
    </Link>
  )
}
