import { Droplets, Landmark, Pyramid, Sailboat, Store, Tent, TreePalm, type LucideIcon } from 'lucide-react'
import type { LadderLevel } from '@/types/domain'

/** The therapy ladder drawn as an Egyptian journey. Coordinates are % of the map (LTR). */
export const LOCATIONS: Record<LadderLevel, { icon: LucideIcon; x: number; y: number }> = {
  isolation: { icon: Droplets, x: 12, y: 58 },
  syllables: { icon: TreePalm, x: 27, y: 40 },
  words: { icon: Store, x: 22, y: 20 },
  phrases: { icon: Sailboat, x: 44, y: 30 },
  sentences: { icon: Landmark, x: 60, y: 50 },
  stories: { icon: Tent, x: 74, y: 30 },
  conversation: { icon: Pyramid, x: 88, y: 16 },
}

export const mirrorX = (x: number, rtl: boolean) => (rtl ? 100 - x : x)

export const pick = <T>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]
