import { ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'

/** Mandatory on every report: results are screening, not diagnosis. */
export function Disclaimer({ className, children }: { className?: string; children?: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'border-tan bg-paper text-sage flex items-start gap-3 rounded-md border p-4 text-sm',
        className,
      )}
    >
      <ShieldAlert className="text-rust mt-0.5 size-5 shrink-0" />
      <p>{children ?? t('disclaimer.screening')}</p>
    </div>
  )
}
