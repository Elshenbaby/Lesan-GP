import {
  ArrowDown,
  Baby,
  ClipboardCheck,
  Gamepad2,
  Heart,
  MapPinned,
  Play,
  Stethoscope,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ContinueButton, GuideArt, GuideCard } from '@/components/lisan'
import { ButtonLink, Card } from '@/components/ui'
import { useMouseParallax } from '@/lib/hooks/useMouseParallax'
import { formatNumber } from '@/lib/utils/format'
import type { Guide } from '@/types/domain'
import { LadderVisual } from '../components/LadderVisual'
import { Section, SectionHeading } from '../components/Section'

const heroGuide: Guide = {
  id: 'samsam',
  nameAr: 'سمسم',
  nameEn: 'Samsam',
  species: 'snake',
  favouriteSound: 'س',
  color: '#5f8a63',
}

export default function HomePage() {
  const { t } = useTranslation('marketing')
  const parallax = useMouseParallax<HTMLDivElement>()
  const testimonials = t('home.testimonials', { returnObjects: true }) as { quote: string; name: string }[]

  return (
    <>
      <section ref={parallax} className="relative flex min-h-dvh items-center overflow-hidden pt-24 pb-32">
        <div
          className="bg-cream absolute top-1/2 left-1/2 aspect-square w-[150vw] max-w-[68rem] -translate-x-1/2 -translate-y-1/2 rounded-full sm:w-[90vw]"
          aria-hidden="true"
        />
        <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col items-start gap-6">
            <span className="bg-tan/60 rounded-full px-4 py-1.5 text-sm font-semibold" data-reveal>
              {t('home.hook')}
            </span>
            <h1 className="text-5xl text-balance sm:text-6xl lg:text-7xl" data-reveal>
              {t('home.title')}
            </h1>
            <p className="text-sage max-w-xl text-lg sm:text-xl" data-reveal>
              {t('home.subtitle')}
            </p>
            <div className="flex flex-wrap gap-3" data-reveal>
              <ButtonLink to="/free-check" variant="primary" size="lg">
                {t('home.ctaPrimary')}
              </ButtonLink>
              <ButtonLink to="/how-it-works" size="lg">
                {t('home.ctaSecondary')}
              </ButtonLink>
            </div>
          </div>
          <div
            className="relative mx-auto hidden h-[30rem] w-full max-w-sm sm:block"
            style={{ transform: 'translate3d(calc(var(--mx,0) * 14px), calc(var(--my,0) * 10px), 0)' }}
            aria-hidden="true"
          >
            <div className="absolute start-10 top-0 rotate-[9deg] opacity-80">
              <GuideCard
                guide={{
                  ...heroGuide,
                  id: 'zuzu',
                  nameAr: 'زوزو',
                  nameEn: 'Zuzu',
                  favouriteSound: 'ز',
                  color: '#d49a3a',
                }}
                className="scale-[0.82]"
              />
            </div>
            <div className="absolute start-0 top-10">
              <GuideCard guide={heroGuide} active className="animate-float" />
            </div>
          </div>
        </div>
        <a
          href="#why"
          className="text-sage absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-sm font-semibold"
        >
          {t('home.scroll')}
          <ArrowDown className="size-4 animate-bounce" />
        </a>
        <ContinueButton label={t('home.continue')} to="/free-check" className="absolute hidden md:flex" />
      </section>
      <Section id="why" tone="cream">
        <SectionHeading eyebrow={t('home.problemEyebrow')} title={t('home.problemTitle')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(['access', 'practice', 'late', 'arabic'] as const).map((k, i) => (
            <Card key={k} tone="sand" className="flex flex-col gap-3" data-reveal>
              <span className="font-display text-rust text-5xl">{formatNumber(i + 1)}</span>
              <h3 className="text-xl">{t(`home.problems.${k}.title`)}</h3>
              <p className="text-sage">{t(`home.problems.${k}.body`)}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section>
        <SectionHeading eyebrow={t('home.stepsEyebrow')} title={t('home.stepsTitle')} align="center" />
        <div className="relative grid gap-6 md:grid-cols-3">
          <svg
            className="absolute inset-x-0 top-12 hidden h-4 w-full md:block"
            preserveAspectRatio="none"
            viewBox="0 0 100 4"
            aria-hidden="true"
          >
            <path
              d="M 8 2 L 92 2"
              stroke="#c9b79c"
              strokeWidth="3"
              strokeDasharray="6 8"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {(
            [
              ['check', ClipboardCheck],
              ['plan', MapPinned],
              ['practice', Gamepad2],
            ] as const
          ).map(([k, Icon]) => (
            <div key={k} className="relative flex flex-col items-center gap-4 text-center" data-reveal>
              <span className="bg-cream text-rust shadow-soft grid size-24 place-items-center rounded-full">
                <Icon className="size-10" strokeWidth={1.4} />
              </span>
              <h3 className="text-3xl">{t(`home.steps.${k}.title`)}</h3>
              <p className="text-sage max-w-xs">{t(`home.steps.${k}.body`)}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section tone="teal">
        <SectionHeading eyebrow={t('home.videoEyebrow')} title={t('home.videoTitle')} />
        <div className="group bg-teal-soft relative aspect-video overflow-hidden rounded-md" data-reveal>
          <div className="absolute inset-0 grid place-items-center">
            <GuideArt
              id="samsam"
              className="absolute -bottom-10 w-72 opacity-30 transition-transform duration-1000 group-hover:scale-105"
            />
            <button
              className="bg-rust text-cream shadow-card relative grid size-24 place-items-center rounded-full transition-transform hover:scale-105"
              aria-label="Play"
            >
              <Play className="ms-1 size-9 fill-current" />
            </button>
          </div>
          <p className="absolute inset-x-0 bottom-0 p-5 text-center text-sm opacity-70">
            {t('home.videoCaption')}
          </p>
        </div>
      </Section>
      <Section tone="cream">
        <SectionHeading eyebrow={t('home.usersEyebrow')} title={t('home.usersTitle')} />
        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              ['child', Baby, 'rust'],
              ['parent', Users, 'tan'],
              ['therapist', Stethoscope, 'teal'],
            ] as const
          ).map(([k, Icon, tone]) => (
            <Card
              key={k}
              tone={tone}
              className="flex min-h-64 flex-col justify-between gap-6 p-8"
              data-reveal
            >
              <Icon className="size-9" strokeWidth={1.4} />
              <div>
                <h3 className="mb-2 text-3xl">{t(`home.users.${k}.title`)}</h3>
                <p className="opacity-85">{t(`home.users.${k}.body`)}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>
      <Section>
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_1.3fr]">
          <SectionHeading
            eyebrow={t('home.ladderEyebrow')}
            title={t('home.ladderTitle')}
            body={t('home.ladderBody')}
            className="mb-0"
          />
          <LadderVisual />
        </div>
      </Section>
      <Section tone="cream">
        <SectionHeading eyebrow={t('home.testimonialsEyebrow')} title={t('home.testimonialsTitle')} />
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((q) => (
            <figure
              key={q.name}
              className="rounded-card border-tan flex flex-col justify-between gap-6 border-2 p-7"
              data-reveal
            >
              <Heart className="text-rust size-6" />
              <blockquote className="font-display text-xl leading-snug">“{q.quote}”</blockquote>
              <figcaption className="text-sage text-sm font-semibold">{q.name}</figcaption>
            </figure>
          ))}
        </div>
        <p className="text-sage mt-4 text-xs">{t('home.testimonialsNote')}</p>
      </Section>
      <Section tone="rust" className="relative overflow-hidden">
        <div className="relative flex flex-col items-center gap-6 text-center">
          <h2 className="text-4xl sm:text-6xl" data-reveal>
            {t('home.ctaTitle')}
          </h2>
          <p className="text-lg opacity-85" data-reveal>
            {t('home.ctaBody')}
          </p>
          <ButtonLink to="/free-check" variant="cream" size="lg" data-reveal>
            {t('home.ctaPrimary')}
          </ButtonLink>
        </div>
      </Section>
    </>
  )
}
