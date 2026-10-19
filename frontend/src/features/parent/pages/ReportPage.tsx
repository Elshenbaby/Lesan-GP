import { Share2, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AudioClip, Disclaimer, SeverityBadge, TrafficLight } from '@/components/lisan'
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  ErrorState,
  Input,
  Modal,
  PageLoader,
  ProgressBar,
  toast,
} from '@/components/ui'
import { useChild, useShareScreening, useScreening } from '@/lib/api'
import { formatDate, formatPercent } from '@/lib/utils/format'
import type { SoundResult, WordPosition } from '@/types/domain'
import { PageHeader } from '@/app/layouts/DashboardShell'

const POSITIONS: WordPosition[] = ['initial', 'medial', 'final']

export default function ReportPage() {
  const { t } = useTranslation('parent')
  const { t: tc } = useTranslation()
  const { screeningId = '' } = useParams()
  const { data: screening, isLoading, isError, refetch } = useScreening(screeningId)
  const { data: child } = useChild(screening?.childId)
  const [shareOpen, setShareOpen] = useState(false)

  if (isLoading) return <PageLoader />
  if (isError || !screening) return <ErrorState message={t('report.notFound')} onRetry={() => refetch()} />

  const name = child?.name ?? ''
  const severe = screening.results.some((r) => r.severity === 'severe')
  const lateral = screening.results.some((r) => r.dominantLispType === 'lateral')

  return (
    <>
      <PageHeader
        eyebrow={t('report.eyebrow')}
        title={t('report.title', { child: name })}
        description={
          screening.completedAt && t('report.completedOn', { date: formatDate(screening.completedAt) })
        }
        actions={
          screening.sharedWithTherapist ? (
            <Badge tone="ok" dot>
              {t('report.shared')}
            </Badge>
          ) : (
            <Button
              variant="primary"
              iconStart={<Share2 className="size-4" />}
              onClick={() => setShareOpen(true)}
            >
              {t('report.share')}
            </Button>
          )
        }
      />

      {(severe || lateral) && (
        <div
          className="bg-alert-soft text-rust mb-5 flex items-start gap-3 rounded-md p-4 font-semibold"
          data-reveal
        >
          <Stethoscope className="mt-0.5 size-5 shrink-0" />
          {lateral ? t('report.lateralWarning') : t('report.severeWarning')}
        </div>
      )}

      <Card tone="teal" className="mb-5" data-reveal>
        <div className="eyebrow text-tan/80 mb-2">{t('report.summaryTitle')}</div>
        <p className="font-display text-cream text-2xl leading-snug">{screening.summary}</p>
        {screening.overallSeverity && (
          <div className="mt-4">
            <SeverityBadge severity={screening.overallSeverity} />
          </div>
        )}
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        {screening.results.map((r) => (
          <SoundCard key={r.sound} result={r} />
        ))}
      </div>

      <Card className="mt-5" data-reveal>
        <CardHeader title={t('report.attempts')} eyebrow={t('report.attemptsHint', { child: name })} />
        <ul className="grid gap-3 sm:grid-cols-2">
          {screening.attempts.map((a) => (
            <li key={a.id} className="bg-sand/60 flex items-center justify-between gap-3 rounded-md p-3">
              <div>
                <div className="font-display text-xl" lang="ar">
                  {a.word}
                </div>
                <div className="text-sage text-xs">{tc(`positions.${a.position}`)}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={a.label === 'correct' ? 'ok' : 'warn'}>
                  {a.label === 'correct' ? t('report.labelCorrect') : t('report.labelOff')}
                </Badge>
                <AudioClip src={a.audioUrl} label={a.word} />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <Disclaimer className="flex-1">
          {severe || lateral ? tc('disclaimer.seeTherapist') : undefined}
        </Disclaimer>
        {child?.planId && (
          <ButtonLink to="/parent/plan" variant="rust">
            {t('report.seePlan')}
          </ButtonLink>
        )}
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        screeningId={screening.id}
        onShared={refetch}
      />
    </>
  )
}

function SoundCard({ result }: { result: SoundResult }) {
  const { t } = useTranslation('parent')
  const { t: tc } = useTranslation()
  return (
    <Card data-reveal>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="eyebrow mb-1">{t('report.perSound')}</div>
          <h3 className="text-2xl">{tc(`sounds.${result.sound}`)}</h3>
        </div>
        <TrafficLight severity={result.severity} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-5xl">{formatPercent(result.accuracy)}</span>
        <span className="text-sage">{t('report.accuracy')}</span>
      </div>
      {result.dominantLispType && (
        <p className="mt-3 text-sm">
          <span className="font-semibold">{t('report.lispType')}: </span>
          {tc(`lispTypes.${result.dominantLispType}`)}
        </p>
      )}
      <div className="mt-5 flex flex-col gap-3">
        <div className="eyebrow">{t('report.byPosition')}</div>
        {POSITIONS.map((p) => (
          <div key={p} className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-3 text-sm">
            <span className="text-sage">{tc(`positions.${p}`)}</span>
            <ProgressBar
              value={result.byPosition[p]}
              tone={result.byPosition[p] >= 85 ? 'ok' : result.byPosition[p] >= 50 ? 'warn' : 'rust'}
            />
            <span className="text-end font-semibold">{formatPercent(result.byPosition[p])}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ShareModal({
  open,
  onClose,
  screeningId,
  onShared,
}: {
  open: boolean
  onClose: () => void
  screeningId: string
  onShared: () => void
}) {
  const { t } = useTranslation('parent')
  const { t: tc } = useTranslation()
  const share = useShareScreening(screeningId)
  const [email, setEmail] = useState('therapist@lisan.app')

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('report.shareTitle')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tc('actions.cancel')}
          </Button>
          <Button
            variant="primary"
            loading={share.isPending}
            disabled={!email.includes('@')}
            onClick={async () => {
              await share.mutateAsync(email)
              toast.success(t('report.shareSent'))
              onShared()
              onClose()
            }}
          >
            {tc('actions.share')}
          </Button>
        </>
      }
    >
      <p className="text-sage mb-4">{t('report.shareBody')}</p>
      <Input
        type="email"
        label={t('report.therapistEmail')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </Modal>
  )
}
