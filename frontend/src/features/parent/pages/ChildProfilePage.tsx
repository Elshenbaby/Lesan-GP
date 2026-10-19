import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { GuideArt, SeverityBadge } from '@/components/lisan'
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  ErrorState,
  Input,
  PageLoader,
  toast,
} from '@/components/ui'
import { useChild, useScreening, useUpdateChild } from '@/lib/api'
import { formatDate } from '@/lib/utils/format'
import { PageHeader } from '@/app/layouts/DashboardShell'

const schema = z.object({ name: z.string().min(2), age: z.coerce.number().int().min(4).max(12) })
type Values = z.infer<typeof schema>

export default function ChildProfilePage() {
  const { t } = useTranslation('parent')
  const { t: tc } = useTranslation()
  const { t: tm } = useTranslation('marketing')
  const { childId = '' } = useParams()
  const { data: child, isLoading, isError, refetch } = useChild(childId)
  const { data: screening } = useScreening(child?.latestScreeningId)
  const update = useUpdateChild(childId)
  const form = useForm<Values>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (child) form.reset({ name: child.name, age: child.age })
  }, [child, form])

  if (isLoading) return <PageLoader />
  if (isError || !child) return <ErrorState onRetry={() => refetch()} />

  const onSubmit = form.handleSubmit(async (v) => {
    await update.mutateAsync(v)
    toast.success(t('child.saved'))
  })

  return (
    <>
      <PageHeader
        eyebrow={t('nav.children')}
        title={child.name}
        description={t('child.age', { age: child.age })}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Card className="flex flex-col items-center gap-4 text-center" data-reveal>
          <GuideArt id={child.guideId ?? 'samsam'} className="w-40" />
          <div className="flex flex-wrap justify-center gap-2">
            {child.currentLevel && <Badge tone="teal">{tc(`levels.${child.currentLevel}`)}</Badge>}
            <Badge>{child.therapistId ? t('child.therapist') : t('child.noTherapist')}</Badge>
          </div>
          {!!child.concerns.length && (
            <div className="w-full text-start">
              <div className="eyebrow mb-2">{t('child.concerns')}</div>
              <ul className="flex flex-wrap gap-2">
                {child.concerns.map((c) => (
                  <li key={c}>
                    <Badge>{tm(`check.concerns.${c as 'unsure'}`)}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-5">
          <Card data-reveal>
            <CardHeader title={t('child.editTitle')} />
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('child.name')}
                error={form.formState.errors.name?.message}
                {...form.register('name')}
              />
              <Input
                type="number"
                label={t('child.ageLabel')}
                error={form.formState.errors.age?.message}
                {...form.register('age')}
              />
              <div className="sm:col-span-2">
                <Button type="submit" variant="primary" loading={update.isPending}>
                  {tc('actions.save')}
                </Button>
              </div>
            </form>
          </Card>

          <Card data-reveal>
            <CardHeader title={t('child.latestScreening')} />
            {screening?.overallSeverity ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={screening.overallSeverity} />
                  {screening.completedAt && (
                    <span className="text-sage text-sm">{formatDate(screening.completedAt)}</span>
                  )}
                </div>
                <ButtonLink to={`/parent/reports/${screening.id}`} size="sm">
                  {t('dashboard.viewReport')}
                </ButtonLink>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sage">{t('child.noScreening')}</span>
                <ButtonLink to={`/play/${child.id}/handover`} size="sm" variant="rust">
                  {t('child.startScreening')}
                </ButtonLink>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
