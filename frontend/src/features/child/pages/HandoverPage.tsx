import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GuideArt, SoundToggle } from '@/components/lisan'
import { Button } from '@/components/ui'
import { useChildContext } from '../context'

/** Dark "Bienvenue"-style card: the parent hands the device to the child. */
export default function HandoverPage() {
  const { t } = useTranslation('child')
  const { child } = useChildContext()
  const navigate = useNavigate()

  const start = () => {
    if (!child.guideId) navigate(`/play/${child.id}/guide`)
    else if (!child.latestScreeningId) navigate(`/play/${child.id}/screening`)
    else navigate(`/play/${child.id}/world`)
  }

  return (
    <div className="bg-night text-tan absolute inset-0 z-[45] grid place-items-center px-6">
      <div className="flex max-w-xl flex-col items-center gap-7 text-center" data-reveal>
        <GuideArt id={child.guideId ?? 'samsam'} className="animate-float w-36" />
        <span className="eyebrow !text-tan/70">{t('handover.eyebrow')}</span>
        <h1 className="text-tan text-4xl sm:text-5xl">{t('handover.title', { name: child.name })}</h1>
        <p className="text-lg opacity-85">{t('handover.body')}</p>
        <div className="flex flex-col items-center gap-2">
          <span
            className="text-[0.65rem] leading-tight font-bold tracking-wider uppercase"
            dangerouslySetInnerHTML={{ __html: t('handover.soundHint') }}
          />
          <SoundToggle className="text-tan" />
        </div>
        <Button variant="outline" size="lg" className="border-tan text-tan" onClick={start}>
          {t('handover.start')}
        </Button>
      </div>
    </div>
  )
}
