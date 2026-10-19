import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CircleStage,
  ContinueButton,
  GuideArt,
  GuideDialog,
  MicButton,
  Picture,
  SplashScreen,
  StarBar,
  type MicState,
} from '@/components/lisan'
import { Spinner } from '@/components/ui'
import { useCompleteScreening, useScreeningAttempt, useStartScreening } from '@/lib/api'
import { useRecorder } from '@/lib/audio/useRecorder'
import { formatNumber } from '@/lib/utils/format'
import type { Screening } from '@/types/domain'
import { useChildContext } from '../context'
import { pick } from '../locations'

type Phase = 'splash' | 'play' | 'done'

/**
 * Screening adventure: one picture at a time, the child names it.
 * No right/wrong is ever shown — every try earns a star.
 */
export default function ScreeningPage() {
  const { t } = useTranslation('child')
  const { child, guide } = useChildContext()
  const start = useStartScreening()
  const complete = useCompleteScreening()
  const [screening, setScreening] = useState<Screening | null>(null)
  const [phase, setPhase] = useState<Phase>('splash')
  const [index, setIndex] = useState(0)
  const [stars, setStars] = useState(0)
  const [line, setLine] = useState(t('screening.intro'))
  const [typing, setTyping] = useState(true)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    start.mutateAsync(child.id).then(setScreening)
  }, [child.id, start])

  const attempt = useScreeningAttempt(screening?.id ?? '')
  const recorder = useRecorder({ maxDurationMs: 3000 })
  const words = screening?.words ?? []
  const word = words[index]

  const submit = async (audio: Blob | null) => {
    if (!word) return
    const result = await attempt.mutateAsync({ wordId: word.id, audio })
    recorder.reset()
    if (result.needsRepeat) {
      setLine(t('screening.again'))
      return
    }
    setStars((s) => s + 1)
    setLine(pick(t('screening.nice', { returnObjects: true }) as string[]))
    setTimeout(async () => {
      if (index + 1 < words.length) {
        setIndex((i) => i + 1)
        setLine(t('screening.prompt'))
      } else {
        await complete.mutateAsync(screening!.id)
        setPhase('done')
      }
    }, 1100)
  }

  const onMic = async () => {
    if (recorder.isRecording) return recorder.stop()
    setLine(t('screening.listening'))
    const blob = await recorder.record()
    if (blob) submit(blob)
  }

  const micState: MicState =
    attempt.isPending || complete.isPending ? 'processing' : recorder.isRecording ? 'recording' : 'idle'

  if (phase === 'splash') {
    return (
      <SplashScreen
        title={t('screening.splash')}
        subtitle={t('screening.splashSub')}
        onDone={() => setPhase('play')}
      />
    )
  }

  if (phase === 'done') {
    return (
      <div className="bg-cream absolute inset-0 grid place-items-center px-6">
        <div className="flex max-w-lg flex-col items-center gap-6 text-center" data-reveal>
          <GuideArt id={guide?.id ?? 'samsam'} className="animate-float w-52" />
          <StarBar
            total={Math.min(stars, 12)}
            earned={Math.min(stars, 12)}
            className="flex-wrap justify-center"
          />
          <h1 className="text-5xl">{t('screening.doneTitle')}</h1>
          <p className="text-sage text-lg">{t('screening.doneBody', { count: stars })}</p>
        </div>
        <ContinueButton label={t('screening.toMap')} to={`/play/${child.id}/world`} />
      </div>
    )
  }

  if (!screening || !word) {
    return (
      <div className="grid h-full place-items-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="bg-sand absolute inset-0">
      <div className="absolute inset-x-0 top-20 z-10 flex justify-center sm:top-8">
        <StarBar
          total={words.length}
          earned={stars}
          className="bg-cream/80 max-w-[70vw] flex-wrap justify-center rounded-full px-4 py-2"
        />
      </div>

      <div className="absolute inset-x-0 top-[16%] flex flex-col items-center gap-6">
        <Picture key={word.id} picture={word.picture} className="animate-[pop_.6s_var(--ease-out-expo)]" />
        <MicButton state={micState} level={recorder.level} onPress={onMic} label={t('screening.prompt')} />
        {(recorder.status === 'denied' || recorder.status === 'unsupported') && (
          <button
            className="text-sage text-sm font-semibold underline underline-offset-4"
            onClick={() => submit(null)}
          >
            {t('screening.noMic')}
          </button>
        )}
        <span className="sr-only">{formatNumber(index + 1)}</span>
      </div>

      <CircleStage guideId={guide?.id} speaking={typing} className="h-[26vh] min-h-[11rem]">
        <GuideDialog key={line + index} message={line} onCompleted={() => setTyping(false)} />
      </CircleStage>
      <style>{`@keyframes pop{from{transform:scale(.6) rotate(-6deg);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  )
}
