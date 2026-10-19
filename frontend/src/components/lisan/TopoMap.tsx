import type { ReactNode } from 'react'
import { useMouseParallax } from '@/lib/hooks/useMouseParallax'
import { cn } from '@/lib/utils/cn'

export interface MapPoint {
  x: number
  y: number
}

/**
 * Hand-drawn topographic paper map: contour lines, palms, a river and a dashed
 * trail joining the given points. Children (pins) are positioned in % over it.
 */
export function TopoMap({
  trail,
  progressIndex = -1,
  children,
  className,
}: {
  trail: MapPoint[]
  /** Trail is solid up to this point index, dashed after. */
  progressIndex?: number
  children?: ReactNode
  className?: string
}) {
  const ref = useMouseParallax<HTMLDivElement>()
  const d = trail.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ')
  const done = trail
    .slice(0, Math.max(0, progressIndex + 1))
    .map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`)
    .join(' ')

  return (
    <div ref={ref} className={cn('absolute inset-0 overflow-hidden bg-[#ebe7e1]', className)}>
      <div
        className="absolute -inset-[3%] transition-transform duration-[1.2s] ease-[var(--ease-out-cubic)]"
        style={{ transform: 'translate3d(calc(var(--mx, 0) * -12px), calc(var(--my, 0) * -10px), 0)' }}
      >
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 1000 700"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g fill="none" stroke="#c9b79c" strokeWidth="1.4" opacity="0.65">
            {contours.map((c, i) => (
              <path key={i} d={c} />
            ))}
          </g>
          <path
            d="M1010 380 C 930 360, 900 430, 820 420 C 740 410, 720 470, 650 500 C 600 520, 560 600, 600 720"
            stroke="#b9cfd0"
            strokeWidth="38"
            fill="none"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M1010 380 C 930 360, 900 430, 820 420 C 740 410, 720 470, 650 500 C 600 520, 560 600, 600 720"
            stroke="#9fbcbe"
            strokeWidth="2"
            strokeDasharray="10 10"
            fill="none"
          />
          <g fill="#c9b79c" opacity="0.8">
            {palms.map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <path d="M0 0 L0 -18" stroke="#c9b79c" strokeWidth="2" />
                <path
                  d="M0 -18 q -10 -2 -14 6 M0 -18 q 10 -2 14 6 M0 -18 q -6 -10 -12 -8 M0 -18 q 6 -10 12 -8"
                  stroke="#c9b79c"
                  strokeWidth="2"
                  fill="none"
                />
              </g>
            ))}
            {peaks.map(([x, y], i) => (
              <path key={i} d={`M${x - 12} ${y} L${x} ${y - 20} L${x + 12} ${y} Z`} />
            ))}
          </g>
        </svg>

        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={d}
            fill="none"
            stroke="#c9b79c"
            strokeWidth="5"
            strokeDasharray="10 12"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {done && (
            <path
              d={done}
              fill="none"
              stroke="#bb4d34"
              strokeWidth="5"
              strokeDasharray="10 12"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity="0.7"
            />
          )}
        </svg>

        {children}
      </div>
    </div>
  )
}

const contours = [
  'M-20 120 C 80 60, 200 140, 320 90 S 520 40, 640 110 S 880 60, 1020 130',
  'M-20 170 C 100 110, 210 190, 330 150 S 540 100, 660 170 S 900 120, 1020 190',
  'M120 420 C 160 330, 300 320, 340 400 S 260 520, 180 500 S 90 470, 120 420 Z',
  'M150 425 C 180 360, 280 355, 305 410 S 250 485, 195 475 S 130 455, 150 425 Z',
  'M185 428 C 200 395, 255 392, 268 420 S 240 455, 210 450 S 175 445, 185 428 Z',
  'M520 250 C 560 180, 700 190, 720 260 S 650 350, 580 330 S 490 300, 520 250 Z',
  'M555 255 C 580 215, 670 220, 685 262 S 640 315, 595 305 S 535 290, 555 255 Z',
  'M-20 620 C 120 560, 260 640, 400 600 S 600 560, 720 640',
  'M-20 660 C 140 610, 260 690, 420 650 S 620 620, 760 700',
  'M820 80 C 860 40, 960 50, 980 100 S 930 170, 880 160 S 800 120, 820 80 Z',
]
const palms = [
  [90, 300],
  [110, 320],
  [140, 290],
  [420, 520],
  [450, 545],
  [760, 220],
  [790, 250],
  [880, 560],
  [300, 210],
  [640, 600],
]
const peaks = [
  [880, 110],
  [905, 120],
  [610, 260],
  [230, 425],
]
