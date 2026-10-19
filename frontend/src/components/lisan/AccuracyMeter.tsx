import { cn } from '@/lib/utils/cn'

/**
 * Child-facing "power" meter that fills with each good sound.
 * Shows no numbers; the child only sees it grow.
 */
export function AccuracyMeter({ value, className }: { value: number; className?: string }) {
  const segments = 10
  const filled = Math.round((value / 100) * segments)
  return (
    <div
      className={cn('flex items-end gap-1', className)}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          className={cn(
            'w-3 rounded-full transition-all duration-500 ease-[var(--ease-out-expo)]',
            i < filled ? 'bg-ok' : 'bg-tan/50',
          )}
          style={{ height: `${14 + i * 3.2}px`, transitionDelay: `${i * 35}ms` }}
        />
      ))}
    </div>
  )
}
