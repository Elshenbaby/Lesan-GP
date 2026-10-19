import { ArrowLeft, ArrowRight } from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { speak } from '@/lib/audio/speak'
import { useDirection } from '@/lib/hooks/useDirection'
import { cn } from '@/lib/utils/cn'

export interface GuideDialogHandle {
  /** Reveal the whole line at once. Returns true if it was still typing. */
  complete: () => boolean
}

interface Props {
  message: string
  /** Show the "next" arrow once typed (the reference's "click to continue" cue). */
  showNext?: boolean
  onCompleted?: () => void
  speed?: number
  delay?: number
  voice?: boolean
  className?: string
}

/** Typewriter line spoken by the guide. Reads aloud with the browser voice when sound is on. */
export const GuideDialog = forwardRef<GuideDialogHandle, Props>(function GuideDialog(
  { message, showNext, onCompleted, speed = 28, delay = 150, voice = true, className },
  ref,
) {
  const { lang } = useDirection()
  const chars = Array.from(message)
  const [count, setCount] = useState(0)
  const done = count >= chars.length
  const completedRef = useRef(onCompleted)
  completedRef.current = onCompleted

  useEffect(() => {
    setCount(0)
    if (voice) speak(message, lang)
    let interval = 0
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        setCount((c) => {
          if (c + 1 >= chars.length) clearInterval(interval)
          return c + 1
        })
      }, speed)
    }, delay)
    return () => {
      clearTimeout(start)
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message])

  useEffect(() => {
    if (done) completedRef.current?.()
  }, [done])

  useImperativeHandle(ref, () => ({
    complete: () => {
      if (done) return false
      setCount(chars.length)
      return true
    },
  }))

  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  return (
    <p
      className={cn(
        'font-display text-teal text-[1.5rem] leading-snug text-balance sm:text-[1.65rem]',
        className,
      )}
      aria-live="polite"
    >
      <span className="sr-only">{message}</span>
      <span aria-hidden="true">
        {chars.slice(0, count).join('')}
        <span className="opacity-0">{chars.slice(count).join('')}</span>
      </span>
      {showNext && (
        <Arrow
          aria-hidden="true"
          className={cn(
            'ms-2 inline size-5 align-middle transition-all duration-500',
            done ? 'translate-x-0 opacity-100' : 'opacity-0',
          )}
        />
      )}
    </p>
  )
})
