import { Mic, Square } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Spinner } from '@/components/ui/Spinner'

export type MicState = 'idle' | 'recording' | 'processing' | 'disabled'

/** Big child-sized microphone. The ring breathes with the live input level. */
export function MicButton({
  state,
  level = 0,
  onPress,
  label,
  className,
}: {
  state: MicState
  level?: number
  onPress: () => void
  label: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={state === 'processing' || state === 'disabled'}
      aria-label={label}
      className={cn(
        'text-cream shadow-card relative grid size-28 place-items-center rounded-full transition-transform duration-300 ease-[var(--ease-out-cubic)] hover:scale-105 active:scale-95 disabled:opacity-80 sm:size-32',
        state === 'recording' ? 'bg-teal' : 'bg-rust',
        className,
      )}
    >
      {state === 'idle' && (
        <span className="animate-pulse-ring bg-rust absolute inset-0 rounded-full" aria-hidden="true" />
      )}
      {state === 'recording' && (
        <span
          className="bg-teal/30 absolute inset-0 rounded-full transition-transform duration-75"
          style={{ transform: `scale(${1 + level * 0.7})` }}
          aria-hidden="true"
        />
      )}
      <span className="relative">
        {state === 'processing' ? (
          <Spinner className="size-10" />
        ) : state === 'recording' ? (
          <Square className="size-9 fill-current" />
        ) : (
          <Mic className="size-12" strokeWidth={1.8} />
        )}
      </span>
    </button>
  )
}
