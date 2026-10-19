import {
  Armchair,
  Banana,
  Bus,
  Car,
  Clock,
  Cookie,
  Fish,
  Flower2,
  Lamp,
  Pizza,
  Sun,
  Wind,
  type LucideIcon,
} from 'lucide-react'
import type { PictureKey } from '@/types/domain'
import { cn } from '@/lib/utils/cn'

/** Placeholder pictures for screening/practice words. Swap for illustrations in public/assets/pictures/. */
const icons: Record<PictureKey, { icon: LucideIcon; bg: string; fg: string }> = {
  fish: { icon: Fish, bg: '#dfe9ea', fg: '#2f6f73' },
  clock: { icon: Clock, bg: '#efe8df', fg: '#21393b' },
  car: { icon: Car, bg: '#f3dcd4', fg: '#bb4d34' },
  chair: { icon: Armchair, bg: '#ece2d3', fg: '#8a6a4f' },
  cookie: { icon: Cookie, bg: '#f6e9cf', fg: '#a8742a' },
  sun: { icon: Sun, bg: '#f9ecc8', fg: '#d49a3a' },
  lantern: { icon: Lamp, bg: '#f6e3cf', fg: '#bb4d34' },
  bus: { icon: Bus, bg: '#e3ecdf', fg: '#5f8a63' },
  flower: { icon: Flower2, bg: '#f3dfe4', fg: '#b2506e' },
  pizza: { icon: Pizza, bg: '#f6e3cf', fg: '#bb4d34' },
  banana: { icon: Banana, bg: '#f9efc8', fg: '#c09224' },
  wind: { icon: Wind, bg: '#e3ecdf', fg: '#5f8a63' },
}

export function Picture({
  picture,
  size = 'lg',
  className,
}: {
  picture: PictureKey
  size?: 'md' | 'lg'
  className?: string
}) {
  const { icon: Icon, bg, fg } = icons[picture]
  return (
    <div
      className={cn(
        'paper-grain shadow-card grid place-items-center rounded-full',
        size === 'lg' ? 'size-56 sm:size-72' : 'size-24',
        className,
      )}
      style={{ backgroundColor: bg, color: fg }}
    >
      <Icon className={size === 'lg' ? 'size-28 sm:size-36' : 'size-12'} strokeWidth={1.2} />
    </div>
  )
}
