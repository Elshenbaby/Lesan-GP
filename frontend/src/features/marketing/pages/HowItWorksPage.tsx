import { AudioLines, Brain, ChevronDown, Crosshair, Gauge, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AccuracyMeter, CircleStage, GuideDialog, MicButton, Picture, StarBar } from '@/components/lisan'
import { ButtonLink, Card } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { LadderVisual } from '../components/LadderVisual'
import { Section, SectionHeading } from '../components/Section'

const pipeline = [
  ['clean', AudioLines],
  ['align', Crosshair],
  ['classify', Brain],
  ['dsp', Sparkles],
  ['score', Gauge],
] as const

export default function HowItWorksPage() {
  const { t } = useTranslation(['marketing', 'child'])
  const faq = t('how.faq', { returnObjects: true }) as { q: string; a: string }[]

  return (
    <>
      <Section className="pt-36">
        <SectionHeading eyebrow={t('how.eyebrow')} title={t('how.title')} body={t('how.intro')} />
      </Section>

      <Section tone="cream">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <SectionHeading title={t('how.screening.title')} body={t('how.screening.body')} className="mb-0" />
          <ScreenFrame>
            <div className="absolute inset-x-0 top-4 flex justify-center">
              <StarBar total={8} earned={3} />
            </div>
            <div className="grid h-full place-items-center pb-28">
              <Picture picture="fish" />
            </div>
            <CircleStage guideId="samsam" className="h-[38%] min-h-0">
              <GuideDialog
                message={t('child:screening.prompt')}
                voice={false}
                className="text-lg sm:text-lg"
              />
            </CircleStage>
          </ScreenFrame>
        </div>
      </Section>

      <Section>
        <SectionHeading title={t('how.ai.title')} body={t('how.ai.body')} />
        <ol className="grid gap-3 md:grid-cols-5">
          {pipeline.map(([k, Icon], i) => (
            <li key={k} className="relative" data-reveal>
              <Card className="flex h-full flex-col gap-3">
                <span className="bg-teal text-tan grid size-11 place-items-center rounded-full">
                  <Icon className="size-5" />
                </span>
                <h3 className="text-xl">{t(`how.ai.pipeline.${k}.title`)}</h3>
                <p className="text-sage text-sm">{t(`how.ai.pipeline.${k}.body`)}</p>
              </Card>
              {i < pipeline.length - 1 && (
                <span className="border-tan absolute -end-2 top-1/2 z-10 hidden size-4 -translate-y-1/2 rotate-45 border-e-2 border-t-2 md:block rtl:-rotate-[135deg]" />
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading title={t('how.plan.title')} body={t('how.plan.body')} />
            <ul className="flex flex-col gap-3">
              {(['typical', 'moderate', 'severe'] as const).map((k) => (
                <li key={k} className="bg-sand flex items-center gap-3 rounded-md p-4" data-reveal>
                  <span
                    className={cn(
                      'size-3 shrink-0 rounded-full',
                      { typical: 'bg-ok', moderate: 'bg-warn', severe: 'bg-alert' }[k],
                    )}
                  />
                  <span className="font-semibold">{t(`how.plan.bands.${k}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-end">
            <LadderVisual current={2} className="w-full" />
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <ScreenFrame tone="teal">
            <div className="text-tan flex h-full flex-col items-center justify-center gap-6">
              <Picture picture="sun" size="md" className="size-32" />
              <span className="font-display text-cream text-4xl">شمس</span>
              <AccuracyMeter value={70} />
              <MicButton state="idle" onPress={() => undefined} label="mic" className="scale-75" />
            </div>
          </ScreenFrame>
          <SectionHeading title={t('how.practice.title')} body={t('how.practice.body')} className="mb-0" />
        </div>
      </Section>

      <Section tone="cream">
        <SectionHeading title={t('how.faqTitle')} />
        <div className="divide-tan border-tan flex flex-col divide-y border-y">
          {faq.map((item) => (
            <details key={item.q} className="group py-5" data-reveal>
              <summary className="font-display flex cursor-pointer list-none items-center justify-between gap-4 text-xl">
                {item.q}
                <ChevronDown className="size-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="text-sage mt-3 max-w-2xl">{item.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <ButtonLink to="/free-check" variant="primary" size="lg">
            {t('home.ctaPrimary')}
          </ButtonLink>
        </div>
      </Section>
    </>
  )
}

function ScreenFrame({ children, tone = 'sand' }: { children: React.ReactNode; tone?: 'sand' | 'teal' }) {
  return (
    <div
      className={cn(
        'border-ink/90 shadow-card relative aspect-[4/3] overflow-hidden rounded-[22px] border-[10px]',
        tone === 'teal' ? 'bg-teal' : 'bg-sand',
      )}
      data-reveal
    >
      {children}
    </div>
  )
}
