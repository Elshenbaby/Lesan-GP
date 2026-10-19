import { Compass } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'
import { Button } from './Button'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-tan/40 animate-pulse rounded-sm', className)} />
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-card border-tan flex flex-col items-center gap-3 border-2 border-dashed p-10 text-center',
        className,
      )}
    >
      <div className="bg-sand text-sage grid size-14 place-items-center rounded-full">
        {icon ?? <Compass className="size-6" />}
      </div>
      <h3 className="text-xl">{title}</h3>
      {description && <p className="text-sage max-w-sm">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  const { t } = useTranslation()
  return (
    <EmptyState
      title={message ?? t('states.error')}
      action={
        onRetry && (
          <Button size="sm" onClick={onRetry}>
            {t('actions.retry')}
          </Button>
        )
      }
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
      <Skeleton className="h-72" />
    </div>
  )
}
