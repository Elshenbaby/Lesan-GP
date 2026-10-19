import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/** Centered paper card on a teal veil — same treatment as the reference's confirm modal. */
export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  const { t } = useTranslation()
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="bg-teal/60 absolute inset-0 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          'bg-cream text-teal shadow-card relative w-full max-w-md animate-[modal-in_.45s_var(--ease-out-cubic)] rounded-md p-7 focus:outline-none',
          className,
        )}
      >
        <button
          onClick={onClose}
          className="text-sage hover:bg-sand hover:text-teal absolute end-4 top-4 rounded-full p-1.5 transition"
          aria-label={t('nav.close')}
        >
          <X className="size-5" />
        </button>
        {title && <h2 className="mb-4 pe-8 text-2xl">{title}</h2>}
        <div>{children}</div>
        {footer && <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">{footer}</div>}
      </div>
      <style>{`@keyframes modal-in{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}`}</style>
    </div>,
    document.body,
  )
}
