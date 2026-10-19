import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Keyboard, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { ContinueButton, GuideCard } from '@/components/lisan'
import { Spinner } from '@/components/ui'
import { useGuides, useSetGuide } from '@/lib/api'
import { speak } from '@/lib/audio/speak'
import { useDirection } from '@/lib/hooks/useDirection'
import { cn } from '@/lib/utils/cn'
import { useChildContext } from '../context'

/** Vertical deck of guide cards on a cream disc — the reference's friend-selection. */
export default function GuideSelectPage() {
  const { t } = useTranslation('child')
  const { lang } = useDirection()
  const { child } = useChildContext()
  const navigate = useNavigate()
  const { data: guides } = useGuides()
  const setGuide = useSetGuide(child.id)
  const initial = Math.max(0, guides?.findIndex((g) => g.id === child.guideId) ?? 0)
  const [index, setIndex] = useState(initial)
  const [hover, setHover] = useState(false)

  if (!guides) {
    return (
      <div className="grid h-full place-items-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  const current = guides[index]
  const name = lang === 'ar' ? current.nameAr : current.nameEn

  const choose = async () => {
    await setGuide.mutateAsync(current.id)
    navigate(child.latestScreeningId ? `/play/${child.id}/world` : `/play/${child.id}/screening`)
  }

  return (
    <div className="relative h-full">
      <div
        className={cn(
          'bg-cream absolute top-1/2 left-1/2 aspect-square w-[min(80rem,130vw)] -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-700 ease-[var(--ease-out-cubic)]',
          hover && 'scale-[0.94]',
        )}
        aria-hidden="true"
      />
      <h1 className="absolute inset-x-0 top-24 z-10 text-center text-3xl sm:top-16 sm:text-4xl">
        {t('guide.title')}
      </h1>

      <Swiper
        className="!absolute inset-0 !pt-36"
        modules={[Mousewheel, Keyboard]}
        direction="vertical"
        slidesPerView={1.6}
        centeredSlides
        loop
        speed={500}
        mousewheel
        keyboard
        grabCursor
        initialSlide={initial}
        onRealIndexChange={(s) => {
          setIndex(s.realIndex)
          const g = guides[s.realIndex]
          speak(t('guide.choose', { name: lang === 'ar' ? g.nameAr : g.nameEn }), lang)
        }}
      >
        {guides.map((g, i) => (
          <SwiperSlide key={g.id} className="!flex items-center justify-center">
            <div
              className="flex flex-col items-center gap-3"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              <GuideCard guide={g} active={i === index} />
              <span
                className={cn(
                  'text-sage text-sm font-semibold transition-opacity',
                  i === index ? 'opacity-100' : 'opacity-0',
                )}
              >
                {t(`guide.species.${g.species}`)} · {t('guide.loves', { sound: g.favouriteSound })}
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <ContinueButton label={t('guide.choose', { name })} onClick={choose} disabled={setGuide.isPending} />
    </div>
  )
}
