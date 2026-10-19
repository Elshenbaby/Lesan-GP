import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { formatNumber } from '@/lib/utils/format'

type Phase = 'inhale' | 'hold' | 'exhale'

const DURATIONS: Record<Phase, number> = { inhale: 4, hold: 4, exhale: 8 }
const ORDER: Phase[] = ['inhale', 'hold', 'exhale']

/**
 * 4-4-8 breathing circle (from the reference's basecamp), reused as a calm-down /
 * airflow warm-up before sound practice. Exhale is a long "ssss".
 */
export function BreatheExercise({
  labels,
  rounds = 2,
  onCompleted,
  className,
}: {
  labels: Record<Phase, string>
  rounds?: number
  onCompleted?: () => void
  className?: string
}) {
  const [step, setStep] = useState(0)
  const [remaining, setRemaining] = useState(DURATIONS.inhale)
  const phase = ORDER[step % 3]
  const finished = step >= rounds * 3

  useEffect(() => {
    if (finished) {
      onCompleted?.()
      return
    }
    setRemaining(DURATIONS[phase])
    const tick = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    const next = setTimeout(() => setStep((s) => s + 1), DURATIONS[phase] * 1000)
    return () => {
      clearInterval(tick)
      clearTimeout(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const scale = phase === 'exhale' ? 0.55 : 1

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      <div className="relative grid size-56 place-items-center">
        <span className="border-tan absolute inset-0 rounded-full border-2 border-dashed" />
        <span
          className="bg-ok/25 absolute inset-4 rounded-full ease-in-out"
          style={{
            transform: `scale(${phase === 'inhale' || phase === 'hold' ? 1 : scale})`,
            transitionProperty: 'transform',
            transitionDuration: `${DURATIONS[phase]}s`,
          }}
        />
        <span className="font-display text-teal relative text-6xl tabular-nums">
          {finished ? '✓' : formatNumber(remaining)}
        </span>
      </div>
      <p
        className="font-display text-teal min-h-[4rem] text-center text-2xl"
        dangerouslySetInnerHTML={{ __html: labels[phase] }}
      />
    </div>
  )
}
