import type { ReactNode } from 'react'
import type { GuideId } from '@/types/domain'
import { cn } from '@/lib/utils/cn'
import { GuideAvatar } from './GuideAvatar'

/**
 * The cream half-circle that rises from the bottom of the screen with the guide
 * perched on top — the main "talking" surface of the child app (see reference map view).
 */
export function CircleStage({
  guideId,
  speaking,
  children,
  onClick,
  className,
  size = 'md',
}: {
  guideId?: GuideId
  speaking?: boolean
  children: ReactNode
  onClick?: () => void
  className?: string
  size?: 'md' | 'lg'
}) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center',
        size === 'lg' ? 'h-[48vh]' : 'h-[34vh] min-h-[15rem]',
        className,
      )}
    >
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <ellipse cx="50" cy="100" rx="78" ry={size === 'lg' ? 100 : 86} fill="#FCF7F1" />
      </svg>
      <div
        className={cn(
          'pointer-events-auto relative flex w-full max-w-3xl flex-col items-center px-6 text-center',
          onClick && 'cursor-pointer',
        )}
        onClick={onClick}
      >
        {guideId && <GuideAvatar guideId={guideId} speaking={speaking} size="md" className="-mt-8" />}
        <div className="mt-4 w-full">{children}</div>
      </div>
    </div>
  )
}
