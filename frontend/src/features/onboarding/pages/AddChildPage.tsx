import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { GuideArt } from '@/components/lisan'
import { Button, ButtonLink, Card, ChoiceCard, Input, Select } from '@/components/ui'
import { useCreateChild } from '@/lib/api'
import { cn } from '@/lib/utils/cn'
import { formatNumber } from '@/lib/utils/format'
import { useChildMode } from '@/stores/childMode'
import type { Child } from '@/types/domain'

const CONCERNS = ['s_sounds_like_th', 'tongue_out', 'slushy', 'teased', 'unsure'] as const

const schema = z.object({
  name: z.string().min(1),
  age: z.coerce.number().min(2).max(99),
  previousTherapy: z.enum(['yes', 'no']),
  concerns: z.array(z.string()),
  consentRecording: z.literal(true),
  consentResearch: z.boolean(),
})
type Form = z.infer<typeof schema>

const STEPS = ['about', 'concerns', 'consent'] as const
const stepFields: Record<(typeof STEPS)[number], (keyof Form)[]> = {
  about: ['name', 'age', 'previousTherapy'],
  concerns: ['concerns'],
  consent: ['consentRecording', 'consentResearch'],
}

export default function AddChildPage() {
  const { t } = useTranslation('auth')
  const { t: tm } = useTranslation('marketing')
  const { t: tc } = useTranslation()
  const navigate = useNavigate()
  const createChild = useCreateChild()
  const setActiveChild = useChildMode((s) => s.setActiveChild)
  const [step, setStep] = useState(0)
  const [created, setCreated] = useState<Child | null>(null)

  const { register, handleSubmit, trigger, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { age: 6, previousTherapy: 'no', concerns: [], consentResearch: false },
  })

  const next = async () => {
    if (await trigger(stepFields[STEPS[step]])) setStep((s) => s + 1)
  }

  const onSubmit = handleSubmit(async (v) => {
    const child = await createChild.mutateAsync({
      name: v.name,
      age: v.age,
      previousTherapy: v.previousTherapy === 'yes',
      concerns: v.concerns,
      consentRecording: v.consentRecording,
      consentResearch: v.consentResearch,
    })
    setActiveChild(child.id)
    setCreated(child)
  })

  if (created) {
    return (
      <Card className="flex flex-col items-center gap-5 p-10 text-center">
        <GuideArt id="samsam" className="animate-float w-44" />
        <h1 className="text-4xl">{t('onboarding.doneTitle', { name: created.name })}</h1>
        <p className="text-sage max-w-md">{t('onboarding.doneBody', { name: created.name })}</p>
        <ButtonLink to={`/play/${created.id}/handover`} variant="rust" size="lg">
          {t('onboarding.startScreening')}
        </ButtonLink>
        <button
          className="text-sage text-sm font-semibold underline underline-offset-4"
          onClick={() => navigate('/parent')}
        >
          {t('onboarding.later')}
        </button>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div data-reveal>
        <div className="eyebrow mb-2">{t('onboarding.eyebrow')}</div>
        <ol className="flex gap-2">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={cn(
                'flex flex-1 items-center gap-2 border-t-4 pt-2 text-sm font-semibold transition-colors',
                i <= step ? 'border-rust text-teal' : 'border-tan text-sage',
              )}
            >
              {i < step ? <Check className="size-4" /> : formatNumber(i + 1)}
              {t(`onboarding.steps.${s}`)}
            </li>
          ))}
        </ol>
      </div>

      <Card className="p-6 sm:p-10">
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          {step === 0 && (
            <>
              <h1 className="text-3xl">{t('onboarding.aboutTitle')}</h1>
              <Input
                label={t('onboarding.name')}
                hint={t('onboarding.nameHint')}
                error={formState.errors.name && ' '}
                {...register('name')}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input type="number" min={2} max={99} label={t('onboarding.age')} {...register('age')} />
                <Select label={t('onboarding.language')} disabled>
                  <option>{t('onboarding.dialectEgyptian')}</option>
                </Select>
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">{t('onboarding.previousTherapy')}</legend>
                <div className="grid grid-cols-2 gap-2">
                  <ChoiceCard
                    type="radio"
                    value="yes"
                    label={tm('check.yes')}
                    {...register('previousTherapy')}
                  />
                  <ChoiceCard
                    type="radio"
                    value="no"
                    label={tm('check.no')}
                    {...register('previousTherapy')}
                  />
                </div>
              </fieldset>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-3xl">{t('onboarding.concernsTitle')}</h1>
              <div className="flex flex-col gap-2">
                {CONCERNS.map((c) => (
                  <ChoiceCard key={c} value={c} label={tm(`check.concerns.${c}`)} {...register('concerns')} />
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-3xl">{t('onboarding.consentTitle')}</h1>
              <p className="text-sage">{t('onboarding.consentIntro')}</p>
              <ChoiceCard
                label={t('onboarding.consentRecording')}
                description={t('onboarding.consentRecordingHint')}
                className={cn(formState.errors.consentRecording && 'border-rust')}
                {...register('consentRecording')}
              />
              <ChoiceCard
                label={t('onboarding.consentResearch')}
                description={t('onboarding.consentResearchHint')}
                {...register('consentResearch')}
              />
            </>
          )}

          <div className="flex justify-between gap-3 pt-2">
            <Button variant="ghost" onClick={() => (step ? setStep((s) => s - 1) : navigate(-1))}>
              {tc('actions.back')}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="primary" onClick={next}>
                {tc('actions.next')}
              </Button>
            ) : (
              <Button type="submit" variant="rust" loading={createChild.isPending}>
                {t('onboarding.submit')}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}
