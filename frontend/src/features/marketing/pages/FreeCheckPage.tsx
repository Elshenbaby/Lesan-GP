import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Disclaimer, MicButton, Picture } from '@/components/lisan'
import { Badge, Button, ButtonLink, Card, ChoiceCard, Input, Spinner } from '@/components/ui'
import { useFreeCheck } from '@/lib/api'
import { useRecorder } from '@/lib/audio/useRecorder'
import { cn } from '@/lib/utils/cn'
import { formatNumber } from '@/lib/utils/format'
import type { FreeCheckResult, PictureKey, TargetSound } from '@/types/domain'
import { Section } from '../components/Section'

const CONCERNS = ['s_sounds_like_th', 'tongue_out', 'slushy', 'teased', 'unsure'] as const
const SOUNDS: TargetSound[] = ['س', 'ز', 'ش', 'ص']
const VOICE_WORDS: { word: string; picture: PictureKey }[] = [
  { word: 'سمكة', picture: 'fish' },
  { word: 'شمس', picture: 'sun' },
  { word: 'كرسي', picture: 'chair' },
  { word: 'زهرة', picture: 'flower' },
  { word: 'موز', picture: 'banana' },
]

const schema = z.object({
  childAge: z.coerce.number().min(2).max(99),
  concerns: z.array(z.string()),
  noticedSounds: z.array(z.string()),
  previousTherapy: z.enum(['yes', 'no']),
})
type Answers = z.infer<typeof schema>

type Step = 'questions' | 'voice' | 'result'

export default function FreeCheckPage() {
  const { t } = useTranslation('marketing')
  const [step, setStep] = useState<Step>('questions')
  const [answers, setAnswers] = useState<Answers | null>(null)
  const [result, setResult] = useState<FreeCheckResult | null>(null)
  const freeCheck = useFreeCheck()

  const submit = async (audio: Blob[]) => {
    if (!answers) return
    const res = await freeCheck.mutateAsync({
      childAge: answers.childAge,
      concerns: answers.concerns,
      noticedSounds: answers.noticedSounds as TargetSound[],
      previousTherapy: answers.previousTherapy === 'yes',
      audio,
    })
    setResult(res)
    setStep('result')
  }

  return (
    <Section className="min-h-dvh pt-36">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center" data-reveal>
          <div className="eyebrow mb-3">{t('check.eyebrow')}</div>
          <h1 className="text-5xl">{t('check.title')}</h1>
          <p className="text-sage mt-4">{t('check.intro')}</p>
        </div>

        <Stepper step={step} />

        <Card className="mt-8 p-6 sm:p-10">
          {step === 'questions' && (
            <QuestionsStep
              onDone={(a) => {
                setAnswers(a)
                setStep('voice')
              }}
            />
          )}
          {step === 'voice' && (freeCheck.isPending ? <Analyzing /> : <VoiceStep onDone={submit} />)}
          {step === 'result' && result && (
            <ResultStep
              result={result}
              onRestart={() => {
                setResult(null)
                setAnswers(null)
                setStep('questions')
              }}
            />
          )}
        </Card>
      </div>
    </Section>
  )
}

function Stepper({ step }: { step: Step }) {
  const { t } = useTranslation('marketing')
  const steps: Step[] = ['questions', 'voice', 'result']
  const idx = steps.indexOf(step)
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2 sm:gap-4">
          <span
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
              i < idx ? 'bg-teal text-cream' : i === idx ? 'bg-rust text-cream' : 'bg-tan/50 text-sage',
            )}
          >
            {i < idx ? <Check className="size-4" /> : formatNumber(i + 1)}
            <span className="hidden sm:inline">{t(`check.steps.${s}`)}</span>
          </span>
          {i < steps.length - 1 && <span className="bg-tan h-0.5 w-6 rounded sm:w-10" />}
        </li>
      ))}
    </ol>
  )
}

function QuestionsStep({ onDone }: { onDone: (a: Answers) => void }) {
  const { t } = useTranslation('marketing')
  const { t: tc } = useTranslation()
  const { register, handleSubmit, formState } = useForm<Answers>({
    resolver: zodResolver(schema),
    defaultValues: { childAge: 6, concerns: [], noticedSounds: [], previousTherapy: 'no' },
  })
  return (
    <form onSubmit={handleSubmit(onDone)} className="flex flex-col gap-8">
      <Input
        type="number"
        label={t('check.age')}
        hint={t('check.ageUnit')}
        min={2}
        max={99}
        error={formState.errors.childAge?.message}
        {...register('childAge')}
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-3 text-sm font-semibold">{t('check.concernsLabel')}</legend>
        {CONCERNS.map((c) => (
          <ChoiceCard key={c} value={c} label={t(`check.concerns.${c}`)} {...register('concerns')} />
        ))}
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">{t('check.soundsLabel')}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SOUNDS.map((s) => (
            <ChoiceCard key={s} value={s} label={tc(`sounds.${s}`)} {...register('noticedSounds')} />
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">{t('check.therapyLabel')}</legend>
        <div className="grid grid-cols-2 gap-2">
          <ChoiceCard type="radio" value="yes" label={t('check.yes')} {...register('previousTherapy')} />
          <ChoiceCard type="radio" value="no" label={t('check.no')} {...register('previousTherapy')} />
        </div>
      </fieldset>
      <Button type="submit" variant="primary" size="lg" full>
        {tc('actions.next')}
      </Button>
    </form>
  )
}

function VoiceStep({ onDone }: { onDone: (audio: Blob[]) => void }) {
  const { t } = useTranslation('marketing')
  const [index, setIndex] = useState(0)
  const [clips, setClips] = useState<Blob[]>([])
  const recorder = useRecorder({ maxDurationMs: 3000 })
  const word = VOICE_WORDS[index]
  const last = index === VOICE_WORDS.length - 1

  const advance = (clip?: Blob | null) => {
    const next = clip ? [...clips, clip] : clips
    setClips(next)
    recorder.reset()
    if (last) onDone(next)
    else setIndex((i) => i + 1)
  }

  const onMic = async () => {
    if (recorder.isRecording) return recorder.stop()
    const blob = await recorder.record()
    if (blob) setTimeout(() => advance(blob), 700)
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div>
        <h2 className="text-3xl">{t('check.voiceTitle')}</h2>
        <p className="text-sage mt-2 text-sm">{t('check.voiceHint')}</p>
      </div>
      <Badge tone="neutral">
        {t('check.wordOf', { n: formatNumber(index + 1), total: formatNumber(VOICE_WORDS.length) })}
      </Badge>
      <Picture picture={word.picture} key={word.word} className="animate-[pop_.5s_var(--ease-out-expo)]" />
      <span className="font-display text-5xl" lang="ar">
        {word.word}
      </span>
      <MicButton
        state={recorder.isRecording ? 'recording' : recorder.status === 'stopped' ? 'processing' : 'idle'}
        level={recorder.level}
        onPress={onMic}
        label={t('check.tapToRecord')}
      />
      <span className="text-sage min-h-6 text-sm font-semibold">
        {recorder.isRecording
          ? t('check.recording')
          : recorder.status === 'stopped'
            ? t('check.recorded')
            : t('check.tapToRecord')}
      </span>
      {recorder.status === 'denied' && <p className="text-rust text-sm">{t('check.micDenied')}</p>}
      <Button variant="ghost" size="sm" onClick={() => advance(null)}>
        {last ? t('check.finish') : t('check.skip')}
      </Button>
      <style>{`@keyframes pop{from{transform:scale(.6);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  )
}

function Analyzing() {
  const { t } = useTranslation('marketing')
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <Spinner className="text-rust size-10" />
      <p className="font-display text-2xl">{t('check.analyzing')}</p>
    </div>
  )
}

function ResultStep({ result, onRestart }: { result: FreeCheckResult; onRestart: () => void }) {
  const { t } = useTranslation('marketing')
  const { t: tc } = useTranslation()
  const tone = { low: 'ok', possible: 'warn', likely: 'alert' } as const
  return (
    <div className="flex flex-col gap-6">
      <Badge tone={tone[result.likelihood]} dot className="self-start">
        {t(`check.resultTitle.${result.likelihood}`)}
      </Badge>
      <h2 className="text-4xl">{t(`check.resultTitle.${result.likelihood}`)}</h2>
      <p className="text-sage">{result.message}</p>
      <div>
        <div className="mb-2 text-sm font-semibold">{t('check.soundsToCheck')}</div>
        <div className="flex flex-wrap gap-2">
          {result.soundsToCheck.map((s) => (
            <Badge key={s} tone="teal">
              {tc(`sounds.${s}`)}
            </Badge>
          ))}
        </div>
      </div>
      <Disclaimer />
      <div className="flex flex-col gap-2 sm:flex-row">
        <ButtonLink to="/signup" variant="rust" size="lg" className="flex-1">
          {t('check.fullScreening')}
        </ButtonLink>
        <Button size="lg" onClick={onRestart}>
          {t('check.restart')}
        </Button>
      </div>
    </div>
  )
}
