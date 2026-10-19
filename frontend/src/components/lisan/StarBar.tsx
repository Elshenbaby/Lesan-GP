import { Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/** Row of stars across the top of child screens — stars for trying, never for being "right". */
export function StarBar({ total, earned, className }: { total: number; earned: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-1.5', className)} aria-label={`${earned}/${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'size-6 transition-all duration-500 ease-[var(--ease-out-expo)]',
            i < earned ? 'scale-100 fill-[#e2ad4a] text-[#c99230]' : 'text-tan scale-90',
          )}
          style={{ transitionDelay: `${i * 40}ms` }}
        />
      ))}
    </div>
  )
}
