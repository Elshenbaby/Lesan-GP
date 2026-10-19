import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GuideArt, LanguageToggle, Logo, PageTransition } from '@/components/lisan'
import { cn } from '@/lib/utils/cn'

/** Split screen: teal story panel + paper form panel. `wide` is used by multi-step onboarding. */
export function AuthLayout({ variant = 'split' }: { variant?: 'split' | 'wide' }) {
  const { t } = useTranslation(['common', 'auth'])
  return (
    <div className={cn('bg-sand grid min-h-dvh', variant === 'split' && 'lg:grid-cols-[1fr_1.1fr]')}>
      {variant === 'split' && (
        <aside className="bg-teal text-tan relative hidden overflow-hidden p-10 lg:flex lg:flex-col">
          <Logo />
          <div className="relative z-10 mt-[14vh] max-w-md">
            <p className="font-display text-cream text-4xl leading-tight">{t('auth:aside.quote')}</p>
            <p className="mt-4 text-sm opacity-80">{t('auth:aside.caption')}</p>
          </div>
          <div
            className="bg-teal-soft pointer-events-none absolute -end-24 -bottom-24 size-[34rem] rounded-full"
            aria-hidden="true"
          />
          <GuideArt id="samsam" className="animate-float pointer-events-none absolute -end-6 bottom-6 w-80" />
        </aside>
      )}
      <div className="relative flex flex-col">
        <div className="flex items-center justify-between p-5 sm:p-6">
          <span className={cn(variant === 'split' && 'lg:invisible')}>
            <Logo />
          </span>
          <LanguageToggle />
        </div>
        <div className="flex flex-1 items-start justify-center px-5 pb-16 sm:items-center">
          <PageTransition className={cn('w-full', variant === 'split' ? 'max-w-md' : 'max-w-2xl')}>
            <Outlet />
          </PageTransition>
        </div>
      </div>
    </div>
  )
}
