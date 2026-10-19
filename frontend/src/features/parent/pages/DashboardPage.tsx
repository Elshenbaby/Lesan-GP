import { ArrowUpRight, Clock, Flame, Gamepad2, Lightbulb, Star, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { GuideArt, SeverityBadge } from '@/components/lisan'
import { Badge, ButtonLink, Card, CardHeader, EmptyState, PageLoader, StatTile } from '@/components/ui'
import { usePlan, useProgress, useQuests, useScreening, useSessions } from '@/lib/api'
import { formatDate, formatNumber, formatPercent, formatRelative } from '@/lib/utils/format'
import { useAuthStore } from '@/stores/auth'
import type { Child } from '@/types/domain'
import { PageHeader } from '@/app/layouts/DashboardShell'
import { useActiveChild } from '../useActiveChild'

export default function DashboardPage() {
  const { t } = useTranslation('parent')
  const { child, isLoading } = useActiveChild()

  if (isLoading) return <PageLoader />
  if (!child) {
    return (
      <EmptyState
        className="mt-10"
        icon={<GuideArt id="samsam" className="w-32" />}
        title={t('dashboard.noChildTitle')}
        description={t('dashboard.noChildBody')}
        action={
          <ButtonLink to="/onboarding/child" variant="rust">
            {t('dashboard.noChildCta')}
          </ButtonLink>
        }
      />
    )
  }
  return <ChildDashboard child={child} />
}

function ChildDashboard({ child }: { child: Child }) {
  const { t } = useTranslation('parent')
  const { t: tc } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const { data: progress } = useProgress(child.id)
  const { data: plan } = usePlan(child.planId)
  const { data: screening } = useScreening(child.latestScreeningId)
  const { data: quests = [] } = useQuests(child.id)
  const { data: sessions = [] } = useSessions(child.id)
  const today = quests.find((q) => q.state === 'today')
  const firstName = user?.fullName.split(' ')[0] ?? ''

  return (
    <>
      <PageHeader
        eyebrow={formatDate(new Date().toISOString(), { weekday: 'long', day: 'numeric', month: 'long' })}
        title={t('dashboard.greeting', { name: firstName })}
        description={t('dashboard.subtitle', { child: child.name })}
      />

      {!child.latestScreeningId ? (
        <Card tone="teal" className="relative overflow-hidden p-8 sm:p-10" data-reveal>
          <div className="relative z-10 max-w-lg">
            <h2 className="text-cream text-3xl">{t('dashboard.screeningTitle')}</h2>
            <p className="text-tan mt-3">{t('dashboard.screeningBody', { child: child.name })}</p>
            <ButtonLink
              to={`/play/${child.id}/handover`}
              variant="rust"
              className="mt-6"
              iconStart={<Gamepad2 className="size-5" />}
            >
              {t('dashboard.screeningCta', { child: child.name })}
            </ButtonLink>
          </div>
          <GuideArt
            id={child.guideId ?? 'samsam'}
            className="absolute end-4 -bottom-6 hidden w-56 sm:block"
          />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card tone="teal" className="relative overflow-hidden p-8" data-reveal>
            <div className="eyebrow text-tan/80 mb-2">{t('dashboard.todayTitle')}</div>
            {today ? (
              <>
                <h2 className="text-cream text-3xl">{tc(`levels.${today.level}`)}</h2>
                <p className="text-tan mt-2">
                  {t('dashboard.todayBody', {
                    minutes: tc('time.minutes', { count: plan?.minutesPerDay ?? 10 }),
                    level: tc(`levels.${today.level}`),
                    sound: today.sound,
                  })}
                </p>
                <ButtonLink
                  to={`/play/${child.id}/handover`}
                  variant="rust"
                  className="mt-6"
                  iconStart={<Gamepad2 className="size-5" />}
                >
                  {t('dashboard.todayCta')}
                </ButtonLink>
              </>
            ) : (
              <p className="text-cream max-w-sm text-2xl">{t('dashboard.todayDone')}</p>
            )}
            <GuideArt
              id={child.guideId ?? 'samsam'}
              className="absolute end-2 -bottom-4 hidden w-44 opacity-95 sm:block"
            />
          </Card>

          {progress && (
            <Card tone="tan" data-reveal>
              <div className="eyebrow mb-3 flex items-center gap-2">
                <TrendingUp className="size-4" />
                {t('dashboard.weekly')}
              </div>
              <p className="font-display text-2xl leading-snug">{progress.weeklyHeadline}</p>
              <div className="bg-cream/70 mt-6 flex items-start gap-3 rounded-md p-4 text-sm">
                <Lightbulb className="text-rust mt-0.5 size-5 shrink-0" />
                <div>
                  <div className="mb-1 font-bold">{t('dashboard.tip')}</div>
                  {progress.weeklyTip}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {plan?.status === 'pending_approval' && (
        <Card
          className="border-rust/40 mt-5 flex flex-wrap items-center justify-between gap-4 border-2"
          data-reveal
        >
          <span className="font-semibold">{t('dashboard.planPending')}</span>
          <ButtonLink to="/parent/plan" size="sm" variant="rust">
            {t('dashboard.reviewPlan')}
          </ButtonLink>
        </Card>
      )}

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4" data-reveal>
        <StatTile
          label={t('dashboard.streak')}
          value={formatNumber(progress?.streakDays ?? child.streakDays ?? 0)}
          icon={<Flame className="text-rust size-5" />}
        />
        <StatTile
          label={t('dashboard.stars')}
          value={formatNumber(child.stars ?? 0)}
          icon={<Star className="size-5 text-[#c99230]" />}
        />
        <StatTile
          label={t('dashboard.level')}
          value={tc(`levels.${progress?.currentLevel ?? child.currentLevel ?? 'isolation'}`)}
        />
        <StatTile
          label={t('dashboard.minutes')}
          value={formatNumber(progress?.minutesThisWeek ?? 0)}
          icon={<Clock className="size-5" />}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card data-reveal>
          <CardHeader title={t('dashboard.lastSessions')} />
          {sessions.length ? (
            <ul className="divide-tan/50 divide-y">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="font-semibold">
                      {tc(`levels.${s.level}`)} · {s.sound}
                    </div>
                    <div className="text-sage text-sm">
                      {formatRelative(s.startedAt)} · {tc('time.minutes', { count: s.durationMin })}
                    </div>
                  </div>
                  <Badge tone={s.correct / s.attempts >= 0.8 ? 'ok' : 'neutral'}>
                    {formatPercent((s.correct / s.attempts) * 100)}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sage">{t('dashboard.noSessions')}</p>
          )}
        </Card>

        {screening?.overallSeverity && (
          <Card data-reveal>
            <CardHeader
              title={t('dashboard.report')}
              action={
                <ButtonLink
                  to={`/parent/reports/${screening.id}`}
                  size="sm"
                  iconEnd={<ArrowUpRight className="size-4 rtl:-scale-x-100" />}
                >
                  {t('dashboard.viewReport')}
                </ButtonLink>
              }
            />
            <SeverityBadge severity={screening.overallSeverity} />
            <p className="text-sage mt-3">{screening.summary}</p>
          </Card>
        )}
      </div>
    </>
  )
}
