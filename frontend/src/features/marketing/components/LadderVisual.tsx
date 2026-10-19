import { useTranslation } from 'react-i18next'
import { LADDER_LEVELS } from '@/types/domain'
import { cn } from '@/lib/utils/cn'
import { formatNumber } from '@/lib/utils/format'

/** Seven rising steps of the therapy ladder. */
export function LadderVisual({ current, className }: { current?: number; className?: string }) {
  const { t } = useTranslation()
  return (
    <ol className={cn('flex items-end gap-2 sm:gap-3', className)}>
      {LADDER_LEVELS.map((level, i) => (
        <li key={level} className="flex flex-1 flex-col items-center gap-3" data-reveal>
          <span className="text-center text-[0.7rem] leading-tight font-semibold sm:text-sm">
            {t(`levels.${level}`)}
          </span>
          <span
            className={cn(
              'font-display flex w-full items-start justify-center rounded-t-md pt-3 text-xl transition-colors',
              current === undefined
                ? i === LADDER_LEVELS.length - 1
                  ? 'bg-rust text-cream'
                  : 'bg-tan/70 text-teal'
                : i < current
                  ? 'bg-teal text-cream'
                  : i === current
                    ? 'bg-rust text-cream'
                    : 'bg-tan/40 text-teal/50',
            )}
            style={{ height: `${3.5 + i * 1.6}rem` }}
          >
            {formatNumber(i + 1)}
          </span>
        </li>
      ))}
    </ol>
  )
}
