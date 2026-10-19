import { LogOut, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo, SoundToggle } from '@/components/lisan'
import { Spinner } from '@/components/ui'
import { ParentalGate } from '@/features/child/components/ParentalGate'
import type { ChildModeContext } from '@/features/child/context'
import { useChild, useGuides } from '@/lib/api'
import { stopSpeaking } from '@/lib/audio/speak'
import { formatNumber } from '@/lib/utils/format'
import { useChildMode } from '@/stores/childMode'

/**
 * Immersive, full-screen shell for the child app. No parent navigation is reachable
 * from here except through the parental gate.
 */
export function ChildLayout() {
  const { t, i18n } = useTranslation('child')
  const { childId = '' } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { data: child, isLoading } = useChild(childId)
  const { data: guides } = useGuides()
  const { enter, exit } = useChildMode()
  const [gateOpen, setGateOpen] = useState(false)

  useEffect(() => {
    enter(childId)
    return stopSpeaking
  }, [childId, enter])

  if (isLoading || !child) {
    return (
      <div className="bg-sand text-teal grid h-dvh place-items-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  const needsGuide = !child.guideId && !/\/(guide|handover)$/.test(pathname)
  if (needsGuide) return <Navigate to={`/play/${childId}/guide`} replace />

  const guide = guides?.find((g) => g.id === child.guideId)
  const ctx: ChildModeContext = {
    child,
    guide,
    guideName: guide ? (i18n.language === 'ar' ? guide.nameAr : guide.nameEn) : '',
  }

  return (
    <div className="bg-sand text-teal relative h-dvh overflow-hidden select-none">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between p-4 sm:p-6">
        <Logo to={`/play/${childId}/world`} className="pointer-events-auto" />
        <div className="bg-tan shadow-soft pointer-events-auto flex items-center gap-2 rounded-sm p-1.5">
          <Link
            to={`/play/${childId}/rewards`}
            className="hover-wash border-teal/60 flex items-center gap-1.5 rounded-xs border-2 px-3 py-1.5 text-sm font-bold"
          >
            <Star className="size-4 fill-[#e2ad4a] text-[#c99230]" />
            {formatNumber(child.stars ?? 0)}
          </Link>
          <button
            onClick={() => setGateOpen(true)}
            className="hover-wash flex items-center gap-1.5 rounded-xs px-3 py-1.5 text-sm font-semibold"
          >
            <LogOut className="size-4 rtl:rotate-180" />
            <span className="hidden sm:inline">{t('exit')}</span>
          </button>
        </div>
      </header>

      <Outlet context={ctx} />

      <div className="text-teal absolute start-4 bottom-4 z-40 sm:start-6 sm:bottom-6">
        <SoundToggle />
      </div>

      <ParentalGate
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onPass={() => {
          setGateOpen(false)
          exit()
          stopSpeaking()
          navigate('/parent')
        }}
      />
    </div>
  )
}
