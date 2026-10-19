import {
  Award,
  Backpack,
  Crown,
  Flame,
  GraduationCap,
  Lock,
  Mountain,
  Scroll,
  Shirt,
  Sparkles,
  Star,
  Sun,
  Tent,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ContinueButton, GuideArt } from '@/components/lisan'
import { Spinner } from '@/components/ui'
import { useRewards } from '@/lib/api'
import { cn } from '@/lib/utils/cn'
import { formatDate, formatNumber } from '@/lib/utils/format'
import { useChildContext } from '../context'

const stickerIcons = [Sparkles, Flame, Sun, Award, Mountain, Scroll, Tent, GraduationCap]
const outfitIcons = [Shirt, Shirt, Backpack, Crown]

export default function RewardsPage() {
  const { t } = useTranslation('child')
  const { child, guide, guideName } = useChildContext()
  const { data } = useRewards(child.id)
  const [equipped, setEquipped] = useState<string | null>(null)

  if (!data) {
    return (
      <div className="grid h-full place-items-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  const current = equipped ?? data.outfits.find((o) => o.equipped)?.id

  return (
    <div className="bg-cream absolute inset-0 overflow-y-auto pt-24 pb-36">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-start" data-reveal>
          <GuideArt id={guide?.id ?? 'samsam'} className="animate-float w-36" />
          <div className="flex-1">
            <h1 className="text-5xl">{t('rewards.title')}</h1>
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              <Stat
                icon={<Star className="size-6 fill-[#e2ad4a] text-[#c99230]" />}
                value={data.stars}
                label={t('rewards.stars')}
              />
              <Stat
                icon={<Flame className="text-rust size-6" />}
                value={data.streakDays}
                label={t('rewards.streak')}
              />
            </div>
          </div>
        </div>

        <section data-reveal>
          <h2 className="mb-4 text-2xl">{t('rewards.calendar')}</h2>
          <div className="grid grid-cols-7 gap-2">
            {data.calendar.map((d) => (
              <div
                key={d.date}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center rounded-md text-xs font-semibold',
                  d.practiced ? 'bg-ok text-cream' : 'bg-sand text-sage',
                )}
                title={formatDate(d.date)}
              >
                {d.practiced ? (
                  <Star className="size-5 fill-current" />
                ) : (
                  formatDate(d.date, { day: 'numeric' })
                )}
              </div>
            ))}
          </div>
        </section>

        <section data-reveal>
          <h2 className="mb-4 text-2xl">{t('rewards.stickers')}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.stickers.map((s, i) => {
              const Icon = stickerIcons[i % stickerIcons.length]
              return (
                <div
                  key={s.id}
                  className={cn(
                    'rounded-card flex flex-col items-center gap-2 p-5 text-center transition-transform',
                    s.unlocked
                      ? 'bg-tan text-teal shadow-soft rotate-[-2deg] hover:rotate-0'
                      : 'border-tan text-tan-dark border-2 border-dashed',
                  )}
                  title={s.unlocked ? undefined : t('rewards.locked')}
                >
                  {s.unlocked ? <Icon className="size-10" strokeWidth={1.4} /> : <Lock className="size-8" />}
                  <span className="text-sm font-bold">{t(`rewards.names.${s.name as 'first_hiss'}`)}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section data-reveal>
          <h2 className="mb-4 text-2xl">{t('rewards.outfits', { guide: guideName })}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.outfits.map((o, i) => {
              const Icon = outfitIcons[i % outfitIcons.length]
              const on = current === o.id
              return (
                <button
                  key={o.id}
                  disabled={!o.unlocked}
                  onClick={() => setEquipped(o.id)}
                  className={cn(
                    'rounded-card flex flex-col items-center gap-2 border-2 p-5 transition',
                    on ? 'border-rust bg-rust/10' : 'border-tan hover:border-teal',
                    !o.unlocked && 'opacity-50',
                  )}
                >
                  {o.unlocked ? <Icon className="size-9" strokeWidth={1.4} /> : <Lock className="size-8" />}
                  <span className="text-sm font-bold">{t(`rewards.names.${o.name as 'scarf'}`)}</span>
                  {o.unlocked && (
                    <span className="text-sage text-xs">
                      {on ? t('rewards.equipped') : t('rewards.equip')}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      </div>
      <ContinueButton label={t('rewards.back')} to={`/play/${child.id}/world`} />
    </div>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="bg-sand flex items-center gap-3 rounded-full px-5 py-2.5">
      {icon}
      <span className="font-display text-3xl">{formatNumber(value)}</span>
      <span className="text-sage text-sm font-semibold">{label}</span>
    </div>
  )
}
