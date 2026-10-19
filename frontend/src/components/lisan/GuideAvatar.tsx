import type { GuideId } from '@/types/domain'
import { cn } from '@/lib/utils/cn'
import { GuideArt } from './GuideArt'

/** Round framed guide portrait. `speaking` adds the soft pulsing ring from the reference. */
export function GuideAvatar({
  guideId,
  speaking,
  size = 'md',
  className,
}: {
  guideId: GuideId
  speaking?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const dims = { sm: 'size-12', md: 'size-16', lg: 'size-24', xl: 'size-36' }[size]
  return (
    <figure className={cn('relative shrink-0', dims, className)}>
      {speaking && (
        <span className="animate-pulse-ring bg-tan absolute inset-0 rounded-full" aria-hidden="true" />
      )}
      <span className="border-tan bg-paper shadow-soft relative block size-full overflow-hidden rounded-full border-[3px]">
        <GuideArt id={guideId} className="size-full scale-110" />
      </span>
    </figure>
  )
}
