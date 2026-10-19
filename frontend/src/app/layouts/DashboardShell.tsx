import { LogOut, Menu, X, type LucideIcon } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageToggle, Logo, PageTransition } from '@/components/lisan'
import { Avatar } from '@/components/ui'
import { USE_MOCKS } from '@/lib/env'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/stores/auth'

export interface DashNavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: number
}

/** Shared chrome for the parent app and therapist dashboard: paper sidebar + content well. */
export function DashboardShell({
  nav,
  sidebarTop,
  sidebarCta,
  surfaceLabel,
  outletContext,
}: {
  nav: DashNavItem[]
  sidebarTop?: ReactNode
  sidebarCta?: ReactNode
  surfaceLabel: string
  outletContext?: unknown
}) {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-5">
      <div className="flex items-center justify-between">
        <Logo />
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label={t('nav.close')}>
          <X className="size-6" />
        </button>
      </div>
      <span className="eyebrow">{surfaceLabel}</span>
      {sidebarTop}
      <nav className="flex flex-col gap-1">
        {nav.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-sm px-3 py-2.5 text-[0.95rem] font-semibold transition-colors duration-300',
                isActive ? 'bg-teal text-cream' : 'text-teal/80 hover:bg-sand hover:text-teal',
              )
            }
          >
            <Icon className="size-[1.15rem]" strokeWidth={1.8} />
            <span className="flex-1">{label}</span>
            {!!badge && <span className="bg-rust text-cream rounded-full px-2 py-0.5 text-xs">{badge}</span>}
          </NavLink>
        ))}
      </nav>
      {sidebarCta}
      <div className="border-tan/60 mt-auto flex flex-col gap-4 border-t pt-5">
        <LanguageToggle className="text-sage" />
        {user && (
          <div className="flex items-center gap-3">
            <Avatar name={user.fullName} size={38} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{user.fullName}</div>
              <div className="text-sage truncate text-xs">{user.email}</div>
            </div>
            <button
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="text-sage hover:bg-sand hover:text-rust rounded-full p-2 transition"
              aria-label={t('nav.logout')}
            >
              <LogOut className="size-4 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="bg-sand min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-tan/60 bg-cream sticky top-0 hidden h-dvh border-e lg:block">{sidebar}</aside>

      <div
        className={cn(
          'bg-ink/40 fixed inset-0 z-50 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          'bg-cream shadow-card fixed inset-y-0 start-0 z-50 w-72 transition-transform duration-500 ease-[var(--ease-out-expo)] lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full',
        )}
      >
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-col">
        <div className="border-tan/60 bg-sand/90 sticky top-0 z-30 flex items-center justify-between border-b px-5 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label={t('nav.menu')}>
            <Menu className="size-6" />
          </button>
          <Logo />
        </div>
        {USE_MOCKS && (
          <div className="bg-tan/50 text-teal/80 px-5 py-1.5 text-center text-xs font-semibold">
            {t('mockBanner')}
          </div>
        )}
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 lg:py-10">
          <PageTransition>
            <Outlet context={outletContext} />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}

/** Page title block used at the top of every dashboard page. */
export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
}: {
  title: ReactNode
  eyebrow?: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4" data-reveal>
      <div className="max-w-2xl">
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="text-sage mt-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
