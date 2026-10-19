import { BarChart3, Gamepad2, LayoutDashboard, Route, Settings, UserPlus } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { buttonClass } from '@/components/ui'
import { useChildren } from '@/lib/api'
import { cn } from '@/lib/utils/cn'
import { useChildMode } from '@/stores/childMode'
import { DashboardShell } from './DashboardShell'

export function ParentLayout() {
  const { t } = useTranslation('parent')
  const { data: children } = useChildren()
  const { activeChildId, setActiveChild } = useChildMode()
  const active = children?.find((c) => c.id === activeChildId) ?? children?.[0]

  useEffect(() => {
    if (active && active.id !== activeChildId) setActiveChild(active.id)
  }, [active, activeChildId, setActiveChild])

  return (
    <DashboardShell
      surfaceLabel={t('surface')}
      nav={[
        { to: '/parent', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
        { to: '/parent/plan', label: t('nav.plan'), icon: Route },
        { to: '/parent/progress', label: t('nav.progress'), icon: BarChart3 },
        { to: '/parent/settings', label: t('nav.settings'), icon: Settings },
      ]}
      sidebarTop={
        <div className="flex flex-col gap-2">
          <span className="text-sage text-xs font-semibold">{t('nav.children')}</span>
          <div className="flex flex-wrap gap-2">
            {children?.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveChild(c.id)}
                className={cn(
                  'rounded-full border-2 px-3 py-1 text-sm font-semibold transition',
                  c.id === active?.id
                    ? 'border-teal bg-teal text-cream'
                    : 'border-tan text-teal hover:border-teal',
                )}
              >
                {c.name}
              </button>
            ))}
            <Link
              to="/onboarding/child"
              className="border-tan text-sage hover:border-teal hover:text-teal inline-flex items-center gap-1 rounded-full border-2 border-dashed px-3 py-1 text-sm font-semibold"
            >
              <UserPlus className="size-3.5" />
              {t('nav.addChild')}
            </Link>
          </div>
        </div>
      }
      sidebarCta={
        active && (
          <Link to={`/play/${active.id}/handover`} className={buttonClass({ variant: 'rust', full: true })}>
            <Gamepad2 className="size-5" />
            {t('nav.childMode', { name: active.name })}
          </Link>
        )
      }
    />
  )
}
