import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDirection } from '@/lib/hooks/useDirection'
import { cn } from '@/lib/utils/cn'

export interface MenuTile {
  to: string
  title: string
  label: ReactNode
  tone?: 'teal' | 'tan' | 'rust' | 'cream'
  large?: boolean
}

/** Full-screen navigation overlay built from tiles (reference: .c-nav). */
export function MenuOverlay({
  open,
  onClose,
  tiles,
  footer,
}: {
  open: boolean
  onClose: () => void
  tiles: MenuTile[]
  footer?: ReactNode
}) {
  const { t } = useTranslation()
  const { isRtl } = useDirection()
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[90] transition-[visibility] duration-700',
        open ? 'visible' : 'invisible delay-500',
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          'bg-ink/50 absolute inset-0 transition-opacity duration-500',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <nav
        className={cn(
          'bg-teal text-tan absolute inset-2 overflow-y-auto rounded-md p-4 transition-[clip-path] duration-700 ease-[var(--ease-out-expo)] sm:inset-4 sm:p-6',
        )}
        style={{ clipPath: open ? 'inset(0 0 0 0 round 10px)' : 'inset(0 0 100% 0 round 10px)' }}
        aria-label={t('nav.menu')}
      >
        <button
          onClick={onClose}
          className="border-tan/30 hover:border-tan absolute end-4 top-4 z-10 grid size-12 place-items-center rounded-full border-2 transition sm:end-6 sm:top-6"
          aria-label={t('nav.close')}
        >
          <X className="size-5" />
        </button>

        <ul className="grid min-h-full auto-rows-fr gap-3 pt-16 sm:grid-cols-2 lg:grid-cols-4 lg:pt-0">
          {tiles.map((tile, i) => (
            <li
              key={tile.to}
              className={cn(
                tile.large && 'lg:col-span-2 lg:row-span-2',
                'transition-all duration-700 ease-[var(--ease-out-expo)]',
              )}
              style={{
                transitionDelay: open ? `${150 + i * 60}ms` : '0ms',
                opacity: open ? 1 : 0,
                transform: open ? 'none' : 'translateY(24px)',
              }}
            >
              <Link
                to={tile.to}
                onClick={onClose}
                className={cn(
                  'hover-wash group flex h-full min-h-40 flex-col justify-between rounded-md p-6',
                  {
                    teal: 'border-tan/25 text-tan border-2',
                    tan: 'bg-tan text-teal',
                    rust: 'bg-rust text-cream',
                    cream: 'bg-cream text-teal',
                  }[tile.tone ?? 'teal'],
                )}
              >
                <span className="eyebrow !text-current opacity-75">{tile.title}</span>
                <span
                  className={cn(
                    'font-display leading-tight',
                    tile.large ? 'text-4xl sm:text-5xl' : 'text-2xl',
                  )}
                >
                  {tile.label}
                </span>
                <Arrow className="size-6 transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
        {footer && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 px-2 text-sm">{footer}</div>
        )}
      </nav>
    </div>,
    document.body,
  )
}
