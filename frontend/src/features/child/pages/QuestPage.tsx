import { Volume2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AccuracyMeter,
  BreatheExercise,
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
import { Button, Spinner } from '@/components/ui'
import { useCompleteQuest, usePlan, useQuest, useQuestAttempt } from '@/lib/api'
import { speak } from '@/lib/audio/speak'
import { useRecorder } from '@/lib/audio/useRecorder'
import { cn } from '@/lib/utils/cn'
import type { LispType, QuestStep, ScreeningWord } from '@/types/domain'
import { useChildContext } from '../context'
import { pick } from '../locations'

/** Repetitions per prompt in the sound (isolation) step. */
const SOUND_REPS = 3

export default function QuestPage() {
  const { t } = useTranslation('child')
  const { t: tc } = useTranslation()
  const { questId = '' } = useParams()
  const { child, guide, guideName } = useChildContext()
  const { data: quest } = useQuest(questId)
  const { data: plan } = usePlan(child.planId)
  const completeQuest = useCompleteQuest(child.id)
  const [splash, setSplash] = useState(true)
  const [stepIndex, setStepIndex] = useState(0)
  const [result, setResult] = useState<{ stars: number } | null>(null)

  if (!quest) {
    return (
      <div className="grid h-full place-items-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (splash) {
    return (
      <SplashScreen
        title={tc(`levels.${quest.level}`)}
        subtitle={t('quest.splashSub')}
        onDone={() => setSplash(false)}
      />
    )
  }

  if (result) {
    return (
      <div className="bg-cream absolute inset-0 grid place-items-center px-6">
        <div className="flex max-w-lg flex-col items-center gap-6 text-center" data-reveal>
          <GuideArt id={guide?.id ?? 'samsam'} className="animate-float w-52" />
          <StarBar total={3} earned={result.stars} />
          <h1 className="text-5xl">{t('quest.doneTitle')}</h1>
          <p className="text-sage text-lg">
            {t('quest.doneBody', { count: result.stars, guide: guideName })}
          </p>
        </div>
        <ContinueButton label={t('quest.toMap')} to={`/play/${child.id}/world`} />
      </div>
    )
  }

  const steps = quest.steps.filter((s) => s.kind === 'warmup' || s.prompts.length > 0)
  const step = steps[stepIndex]
  const next = async () => {
    if (stepIndex + 1 < steps.length) setStepIndex((i) => i + 1)
    else {
      const res = await completeQuest.mutateAsync(quest.id)
      setResult({ stars: res.starsEarned })
    }
  }

  return (
    <div className="bg-sand absolute inset-0">
      <StepTrack steps={steps} current={stepIndex} />
      {step.kind === 'warmup' && <WarmupStep key={step.id} onDone={next} />}
      {step.kind !== 'warmup' && (
        <PracticeStep
          key={step.id}
          questId={quest.id}
          prompts={step.kind === 'sound' ? Array(SOUND_REPS).fill(step.prompts[0]) : step.prompts}
          intro={step.kind === 'sound' ? t('quest.soundIntro') : t('quest.wordIntro')}
          lispType={plan?.lispType}
          onDone={next}
          busy={completeQuest.isPending}
        />
      )}
    </div>
  )
}

function StepTrack({ steps, current }: { steps: QuestStep[]; current: number }) {
  const { t } = useTranslation('child')
  return (
    <ol className="absolute inset-x-0 top-20 z-10 flex justify-center gap-2 px-4 sm:top-8">
      {steps.map((s, i) => (
        <li
          key={s.id}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-bold transition-colors sm:text-sm',
            i < current
              ? 'bg-teal text-cream'
              : i === current
                ? 'bg-rust text-cream'
                : 'bg-cream/70 text-sage',
          )}
        >
          {t(`quest.steps.${s.kind}`)}
        </li>
      ))}
    </ol>
  )
}

function WarmupStep({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation('child')
  const { guide } = useChildContext()
  const [done, setDone] = useState(false)
  return (
    <>
      <div className="absolute inset-x-0 top-[15%] flex justify-center">
        <BreatheExercise
          rounds={1}
          labels={{
            inhale: t('quest.breathe.inhale'),
            hold: t('quest.breathe.hold'),
            exhale: t('quest.breathe.exhale'),
          }}
          onCompleted={() => setDone(true)}
        />
      </div>
      <CircleStage guideId={guide?.id} className="h-[24vh] min-h-[10rem]">
        <GuideDialog message={t('quest.warmupIntro')} />
        <Button variant={done ? 'rust' : 'ghost'} size="sm" className="mt-3" onClick={onDone}>
          {t('quest.skip')}
        </Button>
      </CircleStage>
    </>
  )
}

function PracticeStep({
  questId,
  prompts,
  intro,
  lispType,
  onDone,
  busy,
}: {
  questId: string
  prompts: ScreeningWord[]
  intro: string
  lispType?: LispType
  onDone: () => void
  busy: boolean
}) {
  const { t } = useTranslation('child')
  const { guide, guideName } = useChildContext()
  const attempt = useQuestAttempt(questId)
  const recorder = useRecorder({ maxDurationMs: 3000 })
  const [index, setIndex] = useState(0)
  const [good, setGood] = useState(0)
  const [tries, setTries] = useState(0)
  const [line, setLine] = useState(intro)
  const prompt = prompts[index]
  const meter = useMemo(
    () => (tries ? Math.round((good / prompts.length) * 100) : 0),
    [good, tries, prompts.length],
  )

  const submit = async (audio: Blob | null) => {
    const res = await attempt.mutateAsync({ wordId: prompt.id, audio })
    recorder.reset()
    setTries((n) => n + 1)
    if (res.needsRepeat) {
      setLine(t('quest.retry.correct'))
      return
    }
    if (res.label === 'correct') {
      setGood((g) => g + 1)
      setLine(pick(t('quest.correct', { returnObjects: true, guide: guideName }) as string[]))
      setTimeout(() => (index + 1 < prompts.length ? setIndex((i) => i + 1) : onDone()), 1200)
    } else {
      setLine(t(`quest.retry.${lispType ?? res.label}`))
      setTimeout(() => speak(prompt.word, 'ar'), 1800)
    }
  }

  const onMic = async () => {
    if (recorder.isRecording) return recorder.stop()
    const blob = await recorder.record()
    if (blob) submit(blob)
  }

  const micState: MicState =
    attempt.isPending || busy ? 'processing' : recorder.isRecording ? 'recording' : 'idle'

  return (
    <>
      <div className="absolute inset-x-0 top-[13%] flex flex-col items-center gap-4">
        <Picture
          key={`${prompt.id}-${index}`}
          picture={prompt.picture}
          size="lg"
          className="size-44 sm:size-56 [&_svg]:size-24"
        />
        <button
          onClick={() => speak(prompt.word, 'ar')}
          className="font-display text-teal flex items-center gap-2 text-5xl"
          lang="ar"
          aria-label={t('quest.listen', { word: prompt.word })}
        >
          {prompt.word}
          <Volume2 className="text-sage size-6" />
        </button>
        <AccuracyMeter value={meter} />
        <MicButton state={micState} level={recorder.level} onPress={onMic} label={t('quest.tap')} />
        <div className="flex gap-4">
          {(recorder.status === 'denied' || recorder.status === 'unsupported') && (
            <button
              className="text-sage text-sm font-semibold underline underline-offset-4"
              onClick={() => submit(null)}
            >
              {t('screening.noMic')}
            </button>
          )}
          <button
            className="text-sage text-sm font-semibold underline underline-offset-4"
            onClick={() => (index + 1 < prompts.length ? setIndex((i) => i + 1) : onDone())}
          >
            {t('quest.skip')}
          </button>
        </div>
      </div>
      <CircleStage guideId={guide?.id} className="h-[22vh] min-h-[9.5rem]">
        <GuideDialog key={line + index + tries} message={line} />
      </CircleStage>
    </>
  )
}
