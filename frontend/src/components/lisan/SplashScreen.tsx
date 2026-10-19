import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Full-screen title card shown before a level/quest (reference: scenario splash with diamond badge).
 * Auto-dismisses after `duration` ms or on click.
 */
export function SplashScreen({
  title,
  subtitle,
  onDone,
  duration = 2600,
  tone = 'teal',
}: {
  title: ReactNode
  subtitle?: ReactNode
  onDone: () => void
  duration?: number
  tone?: 'teal' | 'rust'
}) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), duration)
    const t2 = setTimeout(onDone, duration + 700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [duration, onDone])

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 grid cursor-pointer place-items-center transition-[clip-path] duration-700 ease-[var(--ease-out-expo)]',
        tone === 'teal' ? 'bg-teal text-tan' : 'bg-rust text-cream',
      )}
      style={{ clipPath: leaving ? 'inset(0 0 100% 0)' : 'inset(0 0 0 0)' }}
      onClick={() => setLeaving(true)}
    >
      <div className="relative grid animate-[splash-in_1s_var(--ease-out-expo)] place-items-center p-16 text-center">
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 50 1 L 99 50 L 50 99 L 1 50 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {subtitle && <span className="eyebrow mb-3 !text-current opacity-80">{subtitle}</span>}
        <span className="font-display text-5xl leading-none sm:text-7xl">{title}</span>
      </div>
      <style>{`@keyframes splash-in{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
