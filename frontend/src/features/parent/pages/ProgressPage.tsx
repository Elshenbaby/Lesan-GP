import { CheckCircle2, Clock, Flame, Repeat } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AccuracyChart } from '@/components/lisan'
import { Card, CardHeader, EmptyState, PageLoader, StatTile } from '@/components/ui'
import { useProgress } from '@/lib/api'
import { cn } from '@/lib/utils/cn'
import { formatNumber } from '@/lib/utils/format'
import { LADDER_LEVELS } from '@/types/domain'
import { PageHeader } from '@/app/layouts/DashboardShell'
import { useActiveChild } from '../useActiveChild'

export default function ProgressPage() {
  const { t } = useTranslation('parent')
  const { t: tc } = useTranslation()
  const { child, isLoading } = useActiveChild()
  const { data: progress, isLoading: loadingProgress } = useProgress(child?.id)

  if (isLoading || loadingProgress) return <PageLoader />

  return (
    <>
      <PageHeader eyebrow={t('progress.eyebrow')} title={t('progress.title', { child: child?.name ?? '' })} />
      {!progress || !progress.sounds.length ? (
        <EmptyState title={t('progress.empty')} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" data-reveal>
            <StatTile
              label={t('progress.sessions')}
              value={formatNumber(progress.sessionsThisWeek)}
              icon={<Repeat className="size-5" />}
            />
            <StatTile
              label={t('progress.minutes')}
              value={formatNumber(progress.minutesThisWeek)}
              icon={<Clock className="size-5" />}
            />
            <StatTile
              label={t('progress.streak')}
              value={formatNumber(progress.streakDays)}
              icon={<Flame className="text-rust size-5" />}
            />
          </div>

          <Card className="mt-5" data-reveal>
            <CardHeader title={t('progress.chartTitle')} eyebrow={progress.weeklyHeadline} />
            <AccuracyChart sounds={progress.sounds} />
          </Card>

          <Card className="mt-5" data-reveal>
            <CardHeader title={t('progress.ladder')} />
            <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {LADDER_LEVELS.map((l) => {
                const done = progress.levelsCompleted.includes(l)
                const current = progress.currentLevel === l
                return (
                  <li
                    key={l}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-md p-4 text-center text-sm font-semibold',
                      done
                        ? 'bg-teal text-cream'
                        : current
                          ? 'bg-rust text-cream ring-rust/20 ring-4'
                          : 'bg-sand text-sage',
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <span className="size-5 rounded-full border-2 border-current" />
                    )}
                    {tc(`levels.${l}`)}
                  </li>
                )
              })}
            </ol>
          </Card>
        </>
      )}
    </>
  )
}
