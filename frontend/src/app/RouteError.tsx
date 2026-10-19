import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui'

export function RouteError() {
  const error = useRouteError()
  const { t } = useTranslation()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : (error as Error)?.message
  return (
    <div className="bg-sand text-teal grid min-h-dvh place-items-center p-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <h1 className="text-4xl">{t('states.error')}</h1>
        {import.meta.env.DEV && message && (
          <pre className="text-sage max-w-full overflow-auto text-xs">{message}</pre>
        )}
        <ButtonLink to="/" variant="primary">
          {t('nav.home')}
        </ButtonLink>
      </div>
    </div>
  )
}
