import { PencilLine } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AccuracyChart, AudioClip, SeverityBadge } from '@/components/lisan'
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  ErrorState,
  PageLoader,
  StatTile,
  Textarea,
  toast,
} from '@/components/ui'
import { useAddNote, useChildRecordings, useNotes, usePatient, useProgress } from '@/lib/api'
import { formatPercent, formatRelative } from '@/lib/utils/format'
import { PageHeader } from '@/app/layouts/DashboardShell'
import { statusTone } from '../status'

export default function PatientDetailPage() {
  const { t } = useTranslation('clinic')
  const { t: tc } = useTranslation()
  const { childId = '' } = useParams()
  const { data: patient, isLoading, isError, refetch } = usePatient(childId)
  const { data: progress } = useProgress(childId)
  const { data: recordings = [] } = useChildRecordings(childId)

  if (isLoading) return <PageLoader />
  if (isError || !patient) return <ErrorState onRetry={() => refetch()} />
  const { child } = patient

  return (
    <>
      <PageHeader
        eyebrow={t('patient.eyebrow')}
        title={
          <span className="flex items-center gap-3">
            <Avatar name={child.name} size={48} />
            {child.name}
          </span>
        }
        description={t('patient.age', { age: child.age, parent: patient.parentName })}
        actions={
          <ButtonLink
            to={`/clinic/patients/${child.id}/plan`}
            variant="primary"
            iconStart={<PencilLine className="size-4" />}
          >
            {t('patient.editPlan')}
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" data-reveal>
        <StatTile
          label={t('patient.status')}
          value={<Badge tone={statusTone[patient.status]}>{t(`patients.filters.${patient.status}`)}</Badge>}
        />
        <StatTile
          label={t('patients.columns.accuracy')}
          value={formatPercent(patient.accuracy)}
          hint={t('patient.delta', {
            value: `${patient.accuracyDelta >= 0 ? '+' : ''}${patient.accuracyDelta}`,
          })}
        />
        <StatTile
          label={t('patients.columns.level')}
          value={child.currentLevel ? tc(`levels.${child.currentLevel}`) : '—'}
        />
        <StatTile
          label={t('patients.columns.type')}
          value={<SeverityBadge severity={patient.severity} />}
          hint={tc(`lispTypes.${patient.lispType}`)}
        />
      </div>

      <Card className="mt-5" data-reveal>
        <CardHeader title={t('patient.progress')} eyebrow={progress?.weeklyHeadline || undefined} />
        {progress?.sounds.length ? (
          <AccuracyChart sounds={progress.sounds} height={280} />
        ) : (
          <p className="text-sage">{t('patient.noProgress')}</p>
        )}
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card data-reveal>
          <CardHeader title={t('patient.recordings')} />
          {recordings.length ? (
            <ul className="flex flex-col gap-2">
              {recordings.map((r) => (
                <li key={r.id} className="bg-sand/60 flex items-center justify-between gap-3 rounded-md p-3">
                  <div>
                    <span className="font-display text-xl" lang="ar">
                      {r.word}
                    </span>
                    <span className="text-sage ms-2 text-xs">{formatRelative(r.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={(r.therapistLabel ?? r.aiLabel) === 'correct' ? 'ok' : 'warn'}>
                      {tc(`lispTypesShort.${r.therapistLabel ?? r.aiLabel}`)}
                    </Badge>
                    <AudioClip src={r.audioUrl} label={r.word} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sage">{t('patient.noRecordings')}</p>
          )}
        </Card>
        <NotesCard childId={child.id} />
      </div>
    </>
  )
}

function NotesCard({ childId }: { childId: string }) {
  const { t } = useTranslation('clinic')
  const { data: notes = [] } = useNotes()
  const add = useAddNote()
  const [body, setBody] = useState('')
  const mine = notes.filter((n) => n.childId === childId)

  return (
    <Card data-reveal>
      <CardHeader title={t('patient.notes')} />
      <form
        className="mb-5 flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault()
          await add.mutateAsync({ childId, body })
          setBody('')
          toast.success(t('patient.noteSaved'))
        }}
      >
        <Textarea
          label={t('patient.addNote')}
          placeholder={t('patient.notePlaceholder')}
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button
          type="submit"
          size="sm"
          variant="primary"
          className="self-start"
          loading={add.isPending}
          disabled={!body.trim()}
        >
          {t('notes.save')}
        </Button>
      </form>
      <ul className="flex flex-col gap-3">
        {mine.map((n) => (
          <li key={n.id} className="border-tan border-s-2 ps-3">
            <p>{n.body}</p>
            <span className="text-sage text-xs">{formatRelative(n.createdAt)}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
