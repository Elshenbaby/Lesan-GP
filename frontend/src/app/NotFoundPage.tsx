import { useTranslation } from 'react-i18next'
import { CompassIcon } from '@/components/lisan'
import { ButtonLink } from '@/components/ui'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="bg-sand text-teal grid min-h-dvh place-items-center p-6 text-center">
      <div className="flex flex-col items-center gap-5">
        <CompassIcon className="text-tan-dark size-20 animate-[spin_12s_linear_infinite]" />
        <h1 className="text-5xl">404</h1>
        <p className="text-sage">{t('states.notFound')}</p>
        <ButtonLink to="/" variant="primary">
          {t('nav.home')}
        </ButtonLink>
      </div>
    </div>
  )
}
