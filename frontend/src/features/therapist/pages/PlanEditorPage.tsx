import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SeverityBadge } from '@/components/lisan'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ChoiceCard,
  EmptyState,
  ErrorState,
  Input,
  PageLoader,
  Select,
  Textarea,
  toast,
} from '@/components/ui'
import { usePatient, usePlan, useUpdatePlan } from '@/lib/api'
import { LADDER_LEVELS, type LadderLevel, type Plan, type TargetSound } from '@/types/domain'
import { PageHeader } from '@/app/layouts/DashboardShell'

const SOUNDS: TargetSound[] = ['س', 'ز', 'ش', 'ص']

interface Values {
  targetSounds: TargetSound[]
  minutesPerDay: number
  durationWeeks: number
  reassessEveryWeeks: number
  currentLevel: LadderLevel
  currentSound: TargetSound
  therapistNotes: string
}

export default function PlanEditorPage() {
  const { t } = useTranslation('clinic')
  const { childId = '' } = useParams()
  const { data: patient, isLoading, isError, refetch } = usePatient(childId)
  const { data: plan, isLoading: planLoading } = usePlan(patient?.child.planId)

  if (isLoading || planLoading) return <PageLoader />
  if (isError || !patient) return <ErrorState onRetry={() => refetch()} />

  return (
    <>
      <PageHeader eyebrow={t('plan.eyebrow')} title={t('plan.title', { child: patient.child.name })} />
      {plan ? <PlanForm plan={plan} /> : <EmptyState title={t('plan.none')} />}
    </>
  )
}

function PlanForm({ plan }: { plan: Plan }) {
  const { t } = useTranslation('clinic')
  const { t: tc } = useTranslation()
  const { t: tp } = useTranslation('parent')
  const update = useUpdatePlan(plan.id)
  const { register, handleSubmit, reset, formState } = useForm<Values>()

  useEffect(() => {
    reset({
      targetSounds: plan.targetSounds,
      minutesPerDay: plan.minutesPerDay,
      durationWeeks: plan.durationWeeks,
      reassessEveryWeeks: plan.reassessEveryWeeks,
      currentLevel: plan.currentLevel,
      currentSound: plan.currentSound,
      therapistNotes: plan.therapistNotes ?? '',
    })
  }, [plan, reset])

  const save = (activate: boolean) =>
    handleSubmit(async (v) => {
      await update.mutateAsync({
        ...v,
        minutesPerDay: Number(v.minutesPerDay),
        durationWeeks: Number(v.durationWeeks),
        reassessEveryWeeks: Number(v.reassessEveryWeeks),
        ...(activate && { status: 'active', approvedByTherapistAt: new Date().toISOString() }),
      })
      toast.success(activate ? t('plan.approved') : t('plan.saved'))
    })

  const needsApproval = !plan.approvedByTherapistAt

  return (
    <form onSubmit={save(false)} className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-5">
        <Card data-reveal>
          <CardHeader title={t('plan.targets')} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SOUNDS.map((s) => (
              <ChoiceCard key={s} value={s} label={tc(`sounds.${s}`)} {...register('targetSounds')} />
            ))}
          </div>
        </Card>
        <Card data-reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input type="number" min={5} max={30} label={t('plan.pace')} {...register('minutesPerDay')} />
            <Input type="number" min={2} max={24} label={t('plan.duration')} {...register('durationWeeks')} />
            <Input
              type="number"
              min={1}
              max={8}
              label={t('plan.reassess')}
              {...register('reassessEveryWeeks')}
            />
          </div>
        </Card>
        <Card data-reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label={t('plan.level')} hint={t('plan.levelHint')} {...register('currentLevel')}>
              {LADDER_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {tc(`levels.${l}`)}
                </option>
              ))}
            </Select>
            <Select label={t('plan.sound')} {...register('currentSound')}>
              {SOUNDS.map((s) => (
                <option key={s} value={s}>
                  {tc(`sounds.${s}`)}
                </option>
              ))}
            </Select>
          </div>
        </Card>
        <Card data-reveal>
          <Textarea label={t('plan.notes')} rows={4} {...register('therapistNotes')} />
        </Card>
      </div>

      <div className="flex flex-col gap-5">
        <Card tone="sand" className="border-tan border lg:sticky lg:top-6" data-reveal>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge dot tone={plan.status === 'active' ? 'ok' : 'warn'}>
              {tp(`plan.status.${plan.status}`)}
            </Badge>
            <SeverityBadge severity={plan.severity} />
          </div>
          <p className="text-sage mb-5 text-sm">{tc(`lispTypes.${plan.lispType}`)}</p>
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              variant="primary"
              full
              loading={update.isPending}
              disabled={!formState.isDirty}
            >
              {t('plan.save')}
            </Button>
            {needsApproval && (
              <Button variant="rust" full onClick={save(true)} loading={update.isPending}>
                {t('plan.approve')}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </form>
  )
}
