import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  PageLoader,
  Select,
  Textarea,
  toast,
} from '@/components/ui'
import { useAddNote, useNotes, usePatients } from '@/lib/api'
import { formatDate } from '@/lib/utils/format'
import { PageHeader } from '@/app/layouts/DashboardShell'

export default function NotesPage() {
  const { t } = useTranslation('clinic')
  const { data: notes = [], isLoading, isError, refetch } = useNotes()
  const { data: patients = [] } = usePatients()
  const add = useAddNote()
  const [childId, setChildId] = useState('')
  const [body, setBody] = useState('')

  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  const selected = childId || patients[0]?.child.id || ''

  return (
    <>
      <PageHeader
        eyebrow={t('notes.eyebrow')}
        title={t('notes.title')}
        description={t('notes.description')}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        <Card className="self-start" data-reveal>
          <CardHeader title={t('notes.new')} />
          <form
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault()
              await add.mutateAsync({ childId: selected, body })
              setBody('')
              toast.success(t('patient.noteSaved'))
            }}
          >
            <Select label={t('notes.patient')} value={selected} onChange={(e) => setChildId(e.target.value)}>
              {patients.map((p) => (
                <option key={p.child.id} value={p.child.id}>
                  {p.child.name}
                </option>
              ))}
            </Select>
            <Textarea
              label={t('notes.body')}
              placeholder={t('patient.notePlaceholder')}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <Button
              type="submit"
              variant="primary"
              loading={add.isPending}
              disabled={!body.trim() || !selected}
            >
              {t('notes.save')}
            </Button>
          </form>
        </Card>

        {notes.length ? (
          <ul className="flex flex-col gap-3">
            {notes.map((n) => (
              <li key={n.id} data-reveal>
                <Card className="flex gap-4">
                  <Avatar name={n.childName} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <Link to={`/clinic/patients/${n.childId}`} className="hover:text-rust font-semibold">
                        {n.childName}
                      </Link>
                      <span className="text-sage text-xs">{formatDate(n.createdAt)}</span>
                    </div>
                    <p className="mt-1">{n.body}</p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={t('notes.empty')} />
        )}
      </div>
    </>
  )
}
