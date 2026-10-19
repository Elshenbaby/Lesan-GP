import {
  Brain,
  Database,
  GraduationCap,
  Handshake,
  LayoutTemplate,
  Server,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, ButtonLink, Card } from '@/components/ui'
import { Section, SectionHeading } from '../components/Section'

const roles = [
  ['ai', Brain],
  ['backend', Server],
  ['frontend', LayoutTemplate],
  ['ux', Stethoscope],
  ['agent', Database],
] as const

export default function AboutPage() {
  const { t } = useTranslation('marketing')
  return (
    <>
      <Section className="pt-36">
        <SectionHeading eyebrow={t('about.eyebrow')} title={t('about.title')} body={t('about.intro')} />
      </Section>

      <Section tone="cream">
        <SectionHeading title={t('about.teamTitle')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {roles.map(([k, Icon], i) => (
            <Card key={k} tone="sand" className="flex flex-col gap-4" data-reveal>
              <div className="flex items-center justify-between">
                <Avatar name={`${t('about.memberPlaceholder')} ${i + 1}`} size={52} />
                <Icon className="text-sage size-5" />
              </div>
              <div>
                <div className="font-semibold">{t('about.memberPlaceholder')}</div>
                <h3 className="mt-1 text-lg">{t(`about.roles.${k}.title`)}</h3>
                <p className="text-sage mt-2 text-sm">{t(`about.roles.${k}.body`)}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              ['academic', GraduationCap, 'cream'],
              ['partners', Handshake, 'tan'],
              ['ethics', ShieldCheck, 'teal'],
            ] as const
          ).map(([k, Icon, tone]) => (
            <Card key={k} tone={tone} className="flex flex-col gap-4 p-8" data-reveal>
              <Icon className="size-8" strokeWidth={1.4} />
              <h3 className="text-2xl">{t(`about.${k}Title`)}</h3>
              <p className="opacity-80">{t(`about.${k}Body`)}</p>
              {k === 'ethics' && (
                <ButtonLink to="/privacy" variant="cream" size="sm" className="mt-auto self-start">
                  {t('about.ethicsLink')}
                </ButtonLink>
              )}
            </Card>
          ))}
        </div>
      </Section>
    </>
  )
}
