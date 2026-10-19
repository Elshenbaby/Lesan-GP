import { cn } from '@/lib/utils/cn'

/** Light compass mark used on every "continue" affordance. */
export function CompassIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('size-10', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="21" />
      <path d="M24 9 L27 24 L24 39 L21 24 Z" fill="currentColor" fillOpacity="0.15" strokeLinejoin="round" />
      <path d="M24 9 L27 24 H21 Z" fill="currentColor" />
      <circle cx="24" cy="24" r="1.6" fill="currentColor" />
    </svg>
  )
}
