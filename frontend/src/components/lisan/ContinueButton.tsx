import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils/cn'
import { CompassIcon } from './CompassIcon'

interface Props {
  label: ReactNode
  to?: string
  onClick?: () => void
  disabled?: boolean
  /** `corner` = rust panel docked bottom-end; `round` = centred compass disc (mobile style). */
  shape?: 'corner' | 'round'
  className?: string
}

/** The reference's signature call-to-action: a rust panel with a compass, rising on hover. */
export function ContinueButton({ label, to, onClick, disabled, shape = 'corner', className }: Props) {
  const classes = cn(
    'hover-wash group z-30 flex text-tan transition-transform duration-500 ease-[var(--ease-out-cubic)]',
    shape === 'corner'
      ? 'fixed end-0 bottom-0 w-[min(27rem,92vw)] min-w-[18rem] items-baseline justify-between rounded-ss-[0.625rem] bg-rust p-4 pb-14 hover:-translate-y-1'
      : 'size-24 items-center justify-center rounded-full bg-rust shadow-card hover:scale-105',
    disabled && 'pointer-events-none translate-y-full',
    className,
  )
  const content = (
    <>
      {shape === 'corner' && <span className="font-display text-2xl">{label}</span>}
      {shape === 'round' && <span className="sr-only">{label}</span>}
      <CompassIcon className="size-11 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-[200deg]" />
    </>
  )
  return to ? (
    <Link to={to} className={classes} onClick={onClick}>
      {content}
    </Link>
  ) : (
    <button type="button" className={classes} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  )
}
