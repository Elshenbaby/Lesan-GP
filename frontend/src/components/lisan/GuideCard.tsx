import type { Guide } from '@/types/domain'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'
import { CompassIcon } from './CompassIcon'
import { GuideArt } from './GuideArt'

/** Worn playing-card portrait, like the reference's friend-selection deck. */
export function GuideCard({
  guide,
  active,
  className,
}: {
  guide: Guide
  active?: boolean
  className?: string
}) {
  const { i18n } = useTranslation()
  const name = i18n.language === 'ar' ? guide.nameAr : guide.nameEn
  return (
    <div
      className={cn(
        'paper-grain shadow-card relative flex aspect-[5/7] w-[17rem] flex-col items-center justify-between rounded-[18px] border border-black/5 bg-[#e8e4de] p-5 transition-transform duration-500 ease-[var(--ease-out-cubic)]',
        active ? 'scale-100 rotate-[-4deg]' : 'scale-90 opacity-70',
        className,
      )}
    >
      <div className="absolute inset-3 rounded-[12px] border border-black/5" />
      <GuideArt id={guide.id} className="relative mt-3 w-full drop-shadow-[0_10px_14px_rgb(33_57_59/0.18)]" />
      <CompassIcon className="text-teal/50 absolute top-[58%] size-12" />
      <span
        className="font-script text-teal relative self-end text-4xl"
        style={{ transform: 'rotate(-6deg)' }}
      >
        {name}
      </span>
      <span
        className="font-display text-cream absolute start-5 top-4 grid size-10 place-items-center rounded-full text-xl"
        style={{ background: guide.color }}
        aria-hidden="true"
      >
        {guide.favouriteSound}
      </span>
    </div>
  )
}
