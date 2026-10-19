import { Check, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Waveform } from '@/components/lisan'
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageLoader,
  ProgressBar,
  toast,
} from '@/components/ui'
import { useLabelRecording, useReviewQueue } from '@/lib/api'
import { formatPercent, formatRelative } from '@/lib/utils/format'
import type { Recording, SoundLabel } from '@/types/domain'
import { PageHeader } from '@/app/layouts/DashboardShell'

const LABELS: SoundLabel[] = ['correct', 'interdental', 'dentalized', 'lateral', 'palatal']
const LOW_CONFIDENCE = 0.65

export default function ReviewPage() {
  const { t } = useTranslation('clinic')
  const { data: queue = [], isLoading, isError, refetch } = useReviewQueue()

  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <>
      <PageHeader
        eyebrow={t('review.eyebrow')}
        title={t('review.title')}
        description={t('review.description')}
        actions={
          queue.length > 0 && <Badge tone="rust">{t('review.remaining', { count: queue.length })}</Badge>
        }
      />
      {queue.length ? (
        <div className="flex flex-col gap-4">
          {queue.map((r) => (
            <ReviewItem key={r.id} recording={r} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<Check className="text-ok size-10" />} title={t('review.empty')} />
      )}
    </>
  )
}

function ReviewItem({ recording: r }: { recording: Recording }) {
  const { t } = useTranslation('clinic')
  const { t: tc } = useTranslation()
  const label = useLabelRecording()
  const [changing, setChanging] = useState(false)
  const low = r.aiConfidence < LOW_CONFIDENCE

  const submit = async (value: SoundLabel) => {
    await label.mutateAsync({ id: r.id, label: value })
    toast.success(t('review.saved'))
  }

  return (
    <Card className="grid gap-5 md:grid-cols-[14rem_1fr_auto] md:items-center" data-reveal>
      <div className="flex items-center gap-3">
        <Avatar name={r.childName} size={42} />
        <div>
          <div className="font-semibold">{r.childName}</div>
          <div className="text-sage text-xs">
            {formatRelative(r.createdAt)} · {tc(`positions.${r.position}`)}
          </div>
          <div className="font-display mt-1 text-2xl" lang="ar">
            {r.word}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <Waveform src={r.audioUrl} height={56} />
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-sage">{t('review.ai')}:</span>
          <Badge tone={r.aiLabel === 'correct' ? 'ok' : 'warn'}>{tc(`lispTypesShort.${r.aiLabel}`)}</Badge>
          <span className="text-sage">{t('review.confidence')}</span>
          <ProgressBar value={r.aiConfidence * 100} tone={low ? 'warn' : 'teal'} className="w-24" />
          <span className="font-semibold">{formatPercent(r.aiConfidence * 100)}</span>
          {low && <Badge tone="alert">{t('review.lowConfidence')}</Badge>}
        </div>
        {changing && (
          <div className="flex flex-col gap-2">
            <span className="text-sage text-xs font-semibold">{t('review.choose')}</span>
            <div className="flex flex-wrap gap-2">
              {LABELS.filter((l) => l !== r.aiLabel).map((l) => (
                <button
                  key={l}
                  disabled={label.isPending}
                  onClick={() => submit(l)}
                  className="border-tan hover:border-teal hover:bg-teal hover:text-cream rounded-full border-2 px-3 py-1 text-sm font-semibold transition"
                >
                  {tc(`lispTypesShort.${l}`)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 md:flex-col">
        <Button
          variant="primary"
          size="sm"
          iconStart={<Check className="size-4" />}
          loading={label.isPending && !changing}
          onClick={() => submit(r.aiLabel)}
        >
          {t('review.agree')}
        </Button>
        <Button
          size="sm"
          iconStart={<RefreshCcw className="size-4" />}
          onClick={() => setChanging((v) => !v)}
        >
          {t('review.change')}
        </Button>
      </div>
    </Card>
  )
}
