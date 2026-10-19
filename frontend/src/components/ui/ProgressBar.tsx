import { cn } from '@/lib/utils/cn'

export function ProgressBar({
  value,
  className,
  tone = 'teal',
  label,
}: {
  value: number
  className?: string
  tone?: 'teal' | 'rust' | 'ok' | 'warn'
  label?: string
}) {
  const color = { teal: 'bg-teal', rust: 'bg-rust', ok: 'bg-ok', warn: 'bg-warn' }[tone]
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('bg-tan/40 h-2 w-full overflow-hidden rounded-full', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out-cubic)]',
          color,
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}
