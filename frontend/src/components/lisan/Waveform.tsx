import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { cn } from '@/lib/utils/cn'

/** Waveform + play control for therapist review. */
export function Waveform({
  src,
  className,
  height = 72,
}: {
  src: string
  className?: string
  height?: number
}) {
  const container = useRef<HTMLDivElement>(null)
  const ws = useRef<WaveSurfer | null>(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!container.current) return
    const instance = WaveSurfer.create({
      container: container.current,
      height,
      waveColor: '#d7c4ab',
      progressColor: '#bb4d34',
      cursorColor: '#21393b',
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      normalize: true,
    })
    ws.current = instance
    setReady(false)
    instance.on('ready', () => setReady(true))
    instance.on('play', () => setPlaying(true))
    instance.on('pause', () => setPlaying(false))
    instance.on('finish', () => setPlaying(false))
    instance.load(src).catch(() => undefined)
    return () => instance.destroy()
  }, [src, height])

  const Icon = playing ? Pause : Play
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <button
        type="button"
        onClick={() => ws.current?.playPause()}
        disabled={!ready}
        className="bg-teal text-cream grid size-12 shrink-0 place-items-center rounded-full transition hover:scale-105 disabled:opacity-40"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        <Icon className="size-5 fill-current" />
      </button>
      <div ref={container} className="min-w-0 flex-1" dir="ltr" />
    </div>
  )
}
