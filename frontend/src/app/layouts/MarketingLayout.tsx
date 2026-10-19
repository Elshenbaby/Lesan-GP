import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LanguageToggle,
  Logo,
  MenuOverlay,
  PageTransition,
  SoundToggle,
  type MenuTile,
} from '@/components/lisan'
import { cn } from '@/lib/utils/cn'
import { homeForRole, useAuthStore } from '@/stores/auth'

export function MarketingLayout() {
  const { t } = useTranslation(['common', 'marketing'])
  const [menuOpen, setMenuOpen] = useState(false)
  const user = useAuthStore((s) => s.user)

  const tiles: MenuTile[] = [
    {
      to: '/how-it-works',
      title: t('nav.howItWorks'),
      label: t('marketing:menu.how'),
      large: true,
      tone: 'tan',
    },
    { to: '/free-check', title: t('nav.freeCheck'), label: t('marketing:menu.check'), tone: 'rust' },
    { to: '/for-therapists', title: t('nav.forTherapists'), label: t('marketing:menu.therapists') },
    { to: '/about', title: t('nav.about'), label: t('marketing:menu.about') },
    { to: '/privacy', title: t('nav.privacy'), label: t('marketing:menu.privacy') },
    user
      ? { to: homeForRole(user.role), title: t('nav.dashboard'), label: user.fullName, tone: 'cream' }
      : { to: '/signup', title: t('nav.signup'), label: t('marketing:menu.signup'), tone: 'cream' },
  ]

  return (
    <div className="bg-sand flex min-h-dvh flex-col">
      <ScrollRestoration />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
        <div className="flex items-start justify-between p-4 sm:p-6">
          <Logo className="pointer-events-auto" />
          <nav
            className="bg-tan text-teal shadow-soft pointer-events-auto flex items-stretch overflow-hidden rounded-sm"
            aria-label={t('nav.menu')}
          >
            <Link
              to="/free-check"
              className="hover-wash border-teal/70 relative m-1.5 hidden w-28 flex-col justify-between border-2 p-1.5 text-[0.7rem] font-semibold sm:flex"
            >
              <span>{t('nav.freeCheck')}</span>
              <svg className="absolute inset-0 size-full" aria-hidden="true">
                <line x1="0" y1="100%" x2="100%" y2="0" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="text-rust self-end">●</span>
            </Link>
            <div className="hidden items-center gap-5 px-4 text-sm font-semibold lg:flex">
              <NavLink
                to="/how-it-works"
                className={({ isActive }) =>
                  cn('hover:opacity-70', isActive && 'underline underline-offset-4')
                }
              >
                {t('nav.howItWorks')}
              </NavLink>
              <NavLink
                to="/for-therapists"
                className={({ isActive }) =>
                  cn('hover:opacity-70', isActive && 'underline underline-offset-4')
                }
              >
                {t('nav.forTherapists')}
              </NavLink>
            </div>
            <Link
              to={user ? homeForRole(user.role) : '/login'}
              className="hover-wash border-teal/20 flex items-center border-s px-4 text-sm font-semibold"
            >
              {user ? t('nav.dashboard') : t('nav.login')}
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="hover-wash border-teal/20 flex items-center gap-2 border-s px-4 text-sm font-semibold"
              aria-expanded={menuOpen}
            >
              <span className="hidden sm:inline">{t('nav.menu')}</span>
              <Menu className="size-5" />
            </button>
          </nav>
        </div>
      </header>

      <MenuOverlay
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        tiles={tiles}
        footer={
          <>
            <SoundToggle />
            <LanguageToggle />
            <span className="opacity-70">{t('footer.madeWith')}</span>
          </>
        }
      />

      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <Footer />
    </div>
  )
}

function Footer() {
  const { t } = useTranslation(['common', 'marketing'])
  const links = [
    ['/how-it-works', t('nav.howItWorks')],
    ['/free-check', t('nav.freeCheck')],
    ['/for-therapists', t('nav.forTherapists')],
    ['/about', t('nav.about')],
    ['/privacy', t('nav.privacy')],
  ] as const
  return (
    <footer className="bg-teal text-tan">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo tone="tan" />
          <p className="max-w-sm text-sm opacity-80">{t('marketing:footer.blurb')}</p>
        </div>
        <ul className="flex flex-col gap-2.5 text-sm font-semibold">
          {links.map(([to, label]) => (
            <li key={to}>
              <Link to={to} className="hover:text-cream">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-col items-start gap-4 text-sm">
          <LanguageToggle />
          <SoundToggle />
          <p className="opacity-70">{t('disclaimer.screening')}</p>
        </div>
      </div>
      <div className="border-tan/15 border-t">
        <div className="container-page flex flex-wrap justify-between gap-2 py-5 text-xs opacity-70">
          <span>{t('footer.rights', { year: new Date().getFullYear() })}</span>
          <span>{t('footer.madeWith')}</span>
        </div>
      </div>
    </footer>
  )
}
