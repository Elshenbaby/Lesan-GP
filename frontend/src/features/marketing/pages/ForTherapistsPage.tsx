import { zodResolver } from '@hookform/resolvers/zod'
import { AudioWaveform, ClipboardList, LayoutDashboard, NotebookPen } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { SeverityBadge, TrafficLight } from '@/components/lisan'
import { Avatar, Badge, Button, Card, Input, ProgressBar, Textarea, toast } from '@/components/ui'
import { usePartnerRequest } from '@/lib/api'
import { formatPercent } from '@/lib/utils/format'
import type { Severity } from '@/types/domain'
import { Section, SectionHeading } from '../components/Section'

const benefits = [
  ['monitor', LayoutDashboard],
  ['review', AudioWaveform],
  ['plans', ClipboardList],
  ['prep', NotebookPen],
] as const

const preview: { name: string; acc: number; severity: Severity; status: 'ok' | 'warn' | 'alert' }[] = [
  { name: 'Youssef', acc: 72, severity: 'moderate', status: 'ok' },
  { name: 'Omar', acc: 44, severity: 'severe', status: 'alert' },
  { name: 'Laila', acc: 84, severity: 'typical', status: 'ok' },
  { name: 'Adam', acc: 38, severity: 'severe', status: 'warn' },
]

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  clinic: z.string().min(2),
  message: z.string().optional(),
})
type Form = z.infer<typeof schema>

export default function ForTherapistsPage() {
  const { t } = useTranslation('marketing')
  const partner = usePartnerRequest()
  const { register, handleSubmit, reset, formState } = useForm<Form>({ resolver: zodResolver(schema) })

  return (
    <>
      <Section tone="teal" className="pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow={t('therapists.eyebrow')}
            title={t('therapists.title')}
            body={t('therapists.intro')}
            className="mb-0"
          />
          <Card className="p-5" data-reveal>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl">{t('therapists.previewTitle')}</h3>
              <Badge tone="rust">7</Badge>
            </div>
            <ul className="divide-tan/60 flex flex-col divide-y">
              {preview.map((p) => (
                <li key={p.name} className="flex items-center gap-3 py-3">
                  <Avatar name={p.name} size={36} />
                  <span className="w-20 font-semibold">{p.name}</span>
                  <div className="flex-1">
                    <ProgressBar value={p.acc} tone={p.acc >= 70 ? 'ok' : p.acc >= 50 ? 'warn' : 'rust'} />
                  </div>
                  <span className="w-12 text-end text-sm font-semibold">{formatPercent(p.acc)}</span>
                  <TrafficLight severity={p.severity} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section tone="cream">
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map(([k, Icon]) => (
            <Card key={k} tone="sand" className="flex gap-5 p-7" data-reveal>
              <span className="bg-cream text-rust grid size-14 shrink-0 place-items-center rounded-full">
                <Icon className="size-6" />
              </span>
              <div>
                <h3 className="mb-2 text-2xl">{t(`therapists.benefits.${k}.title`)}</h3>
                <p className="text-sage">{t(`therapists.benefits.${k}.body`)}</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2" data-reveal>
          <SeverityBadge severity="typical" />
          <SeverityBadge severity="moderate" />
          <SeverityBadge severity="severe" />
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <SectionHeading title={t('therapists.partnerTitle')} body={t('therapists.partnerBody')} />
          <Card className="p-8" data-reveal>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit(async (values) => {
                await partner.mutateAsync(values)
                toast.success(t('therapists.form.sent'))
                reset()
              })}
            >
              <Input
                label={t('therapists.form.name')}
                error={formState.errors.name && ' '}
                {...register('name')}
              />
              <Input
                type="email"
                label={t('therapists.form.email')}
                error={formState.errors.email && ' '}
                {...register('email')}
              />
              <Input
                label={t('therapists.form.clinic')}
                error={formState.errors.clinic && ' '}
                {...register('clinic')}
              />
              <Textarea label={t('therapists.form.message')} {...register('message')} />
              <Button type="submit" variant="primary" size="lg" loading={partner.isPending}>
                {t('therapists.form.submit')}
              </Button>
            </form>
          </Card>
        </div>
      </Section>
    </>
  )
}
