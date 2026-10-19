import { CalendarClock, CheckCircle2, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SeverityBadge } from '@/components/lisan'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ChoiceCard,
  EmptyState,
  Input,
  PageLoader,
  StatTile,
  toast,
} from '@/components/ui'
import { useApprovePlan, usePlan } from '@/lib/api'
import { cn } from '@/lib/utils/cn'
import { formatDate, formatPercent } from '@/lib/utils/format'
import type { Plan, PlanStatus } from '@/types/domain'
import { LADDER_LEVELS } from '@/types/domain'
import { PageHeader } from '@/app/layouts/DashboardShell'
import { useActiveChild } from '../useActiveChild'

const statusTone: Record<PlanStatus, 'neutral' | 'warn' | 'teal' | 'ok'> = {
  draft: 'neutral',
  pending_approval: 'warn',
  approved: 'teal',
  active: 'ok',
  completed: 'ok',
}

export default function PlanPage() {
  const { t } = useTranslation('parent')
  const { child, isLoading } = useActiveChild()
  const { data: plan, isLoading: planLoading } = usePlan(child?.planId)

  if (isLoading || planLoading) return <PageLoader />

  return (
    <>
      <PageHeader eyebrow={t('plan.eyebrow')} title={t('plan.title', { child: child?.name ?? '' })} />
      {plan ? <PlanView plan={plan} childName={child?.name ?? ''} /> : <EmptyState title={t('plan.none')} />}
    </>
  )
}

function PlanView({ plan, childName }: { plan: Plan; childName: string }) {
  const { t } = useTranslation('parent')
  const { t: tc } = useTranslation()
  const currentIdx = LADDER_LEVELS.indexOf(plan.currentLevel)

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col gap-5">
        <Card data-reveal>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Badge tone={statusTone[plan.status]} dot>
              {t(`plan.status.${plan.status}`)}
            </Badge>
            <SeverityBadge severity={plan.severity} />
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Fact label={t('plan.target')} value={plan.targetSounds.join(' · ')} />
            <Fact label={t('plan.type')} value={tc(`lispTypesShort.${plan.lispType}`)} />
            <Fact label={t('plan.baseline')} value={formatPercent(plan.baselineAccuracy)} />
            <Fact label={t('plan.duration')} value={tc('time.weeks', { count: plan.durationWeeks })} />
            <Fact label={t('plan.daily')} value={tc('time.minutes', { count: plan.minutesPerDay })} />
            <Fact
              label={t('plan.reassess')}
              value={t('plan.every', { weeks: tc('time.weeks', { count: plan.reassessEveryWeeks }) })}
            />
          </dl>
        </Card>

        <Card data-reveal>
          <CardHeader title={t('plan.eyebrow')} />
          <ol className="border-tan relative flex flex-col gap-4 border-s-2 border-dashed ps-6">
            {plan.phases.map((ph) => {
              const active = ph.levels.includes(plan.currentLevel)
              return (
                <li key={ph.id} className="relative">
                  <span
                    className={cn(
                      'border-cream absolute -start-[1.95rem] top-1 size-4 rounded-full border-2',
                      active ? 'bg-rust ring-rust/20 ring-4' : 'bg-tan',
                    )}
                  />
                  <div className="eyebrow mb-1">{t('plan.weeks', { from: ph.weekFrom, to: ph.weekTo })}</div>
                  <div className="font-semibold">{t(`plan.focus.${ph.focus as 'tongue_placement'}`)}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone="teal">{ph.sound}</Badge>
                    {ph.levels.map((l) => (
                      <Badge key={l}>{tc(`levels.${l}`)}</Badge>
                    ))}
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>

        <Card tone="sand" className="border-tan border" data-reveal>
          <CardHeader title={tc(`levels.${plan.currentLevel}`)} eyebrow={t('progress.ladder')} />
          <div className="flex gap-1.5">
            {LADDER_LEVELS.map((l, i) => (
              <div
                key={l}
                title={tc(`levels.${l}`)}
                className={cn(
                  'h-3 flex-1 rounded-full',
                  i < currentIdx ? 'bg-teal' : i === currentIdx ? 'bg-rust' : 'bg-tan/60',
                )}
              />
            ))}
          </div>
          <p className="text-sage mt-4 text-sm">{t('plan.rule', { child: childName })}</p>
        </Card>
      </div>

      <div className="flex flex-col gap-5">
        {plan.status === 'pending_approval' ? (
          <ApproveCard plan={plan} />
        ) : (
          <>
            <StatTile
              label={t('plan.practiceTime')}
              value={plan.practiceTime ?? '—'}
              icon={<Clock className="size-5" />}
              hint={plan.reminderEnabled ? t('plan.reminder') : undefined}
            />
            <Card data-reveal>
              <ul className="flex flex-col gap-3 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={cn('size-5', plan.approvedByParentAt ? 'text-ok' : 'text-tan')} />
                  {t('plan.approved')}
                  {plan.approvedByParentAt && (
                    <span className="text-sage ms-auto">{formatDate(plan.approvedByParentAt)}</span>
                  )}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2
                    className={cn('size-5', plan.approvedByTherapistAt ? 'text-ok' : 'text-tan')}
                  />
                  {plan.approvedByTherapistAt ? t('plan.approvedByTherapist') : t('plan.awaitingTherapist')}
                  {plan.approvedByTherapistAt && (
                    <span className="text-sage ms-auto">{formatDate(plan.approvedByTherapistAt)}</span>
                  )}
                </li>
              </ul>
            </Card>
          </>
        )}
        {plan.therapistNotes && (
          <Card tone="tan" data-reveal>
            <div className="eyebrow mb-2">{t('plan.therapistNote')}</div>
            <p className="font-display text-lg leading-snug">{plan.therapistNotes}</p>
          </Card>
        )}
      </div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sage text-xs font-semibold">{label}</dt>
      <dd className="font-display mt-1 text-xl">{value}</dd>
    </div>
  )
}

function ApproveCard({ plan }: { plan: Plan }) {
  const { t } = useTranslation('parent')
  const approve = useApprovePlan(plan.id)
  const [time, setTime] = useState(plan.practiceTime ?? '17:30')
  const [reminder, setReminder] = useState(true)

  useEffect(() => setTime(plan.practiceTime ?? '17:30'), [plan.practiceTime])

  return (
    <Card className="border-rust/40 border-2" data-reveal>
      <CardHeader title={t('plan.approveTitle')} />
      <div className="flex flex-col gap-4">
        <Input
          type="time"
          label={
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-4" />
              {t('plan.practiceTime')}
            </span>
          }
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <ChoiceCard
          label={t('plan.reminder')}
          checked={reminder}
          onChange={(e) => setReminder(e.target.checked)}
        />
        <Button
          variant="rust"
          full
          loading={approve.isPending}
          onClick={async () => {
            await approve.mutateAsync({ practiceTime: time, reminderEnabled: reminder })
            toast.success(t('plan.approved'))
          }}
        >
          {t('plan.approve')}
        </Button>
      </div>
    </Card>
  )
}
