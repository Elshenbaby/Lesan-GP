import { useTranslation } from 'react-i18next'
import { formatNumber } from '@/lib/utils/format'
import { Section, SectionHeading } from '../components/Section'

export default function PrivacyPage() {
  const { t } = useTranslation('marketing')
  const principles = t('privacy.principles', { returnObjects: true }) as { title: string; body: string }[]
  return (
    <>
      <Section className="pt-36">
        <SectionHeading eyebrow={t('privacy.eyebrow')} title={t('privacy.title')} body={t('privacy.intro')} />
      </Section>
      <Section tone="cream">
        <ol className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {principles.map((p, i) => (
            <li key={p.title} className="border-tan flex gap-5 border-t-2 pt-6" data-reveal>
              <span className="font-display text-rust text-4xl">{formatNumber(i + 1)}</span>
              <div>
                <h3 className="mb-2 text-2xl">{p.title}</h3>
                <p className="text-sage">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-sage mt-14">{t('privacy.contact')}</p>
      </Section>
    </>
  )
}
