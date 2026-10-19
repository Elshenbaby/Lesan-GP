import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'

/** Compact play button for a recording URL (fetched as a blob so auth headers/mocks work). */
export function AudioClip({ src, label, className }: { src?: string; label?: string; className?: string }) {
  const { t } = useTranslation()
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(
    () => () => {
      audio.current?.pause()
      if (audio.current?.src) URL.revokeObjectURL(audio.current.src)
    },
    [],
  )

  async function toggle() {
    if (!src) return
    if (!audio.current) {
      const blob = await fetch(src).then((r) => r.blob())
      audio.current = new Audio(URL.createObjectURL(blob))
      audio.current.onended = () => setPlaying(false)
    }
    if (playing) {
      audio.current.pause()
      setPlaying(false)
    } else {
      audio.current.currentTime = 0
      await audio.current.play()
      setPlaying(true)
    }
  }

  const Icon = playing ? Pause : Play
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!src}
      className={cn(
        'border-teal/20 hover:border-teal inline-flex items-center gap-2 rounded-full border-2 py-1 ps-1 pe-3 text-sm font-semibold transition disabled:opacity-40',
        className,
      )}
    >
      <span className="bg-teal text-cream grid size-7 place-items-center rounded-full">
        <Icon className="size-3.5 fill-current" />
      </span>
      {label ?? (playing ? t('actions.pause') : t('actions.play'))}
    </button>
  )
}
