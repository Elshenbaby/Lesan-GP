import { CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { create } from 'zustand'
import { cn } from '@/lib/utils/cn'

type ToastTone = 'success' | 'info' | 'error'
interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

const useToasts = create<{
  items: ToastItem[]
  push: (m: string, t: ToastTone) => void
  dismiss: (id: number) => void
}>((set) => ({
  items: [],
  push: (message, tone) => {
    const id = Date.now() + Math.random()
    set((s) => ({ items: [...s.items, { id, message, tone }] }))
    setTimeout(() => set((s) => ({ items: s.items.filter((i) => i.id !== id) })), 3800)
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}))

export const toast = {
  success: (m: string) => useToasts.getState().push(m, 'success'),
  info: (m: string) => useToasts.getState().push(m, 'info'),
  error: (m: string) => useToasts.getState().push(m, 'error'),
}

const icons = { success: CheckCircle2, info: Info, error: TriangleAlert }

export function Toaster() {
  const { items, dismiss } = useToasts()
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[200] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      {items.map((item) => {
        const Icon = icons[item.tone]
        return (
          <button
            key={item.id}
            onClick={() => dismiss(item.id)}
            className={cn(
              'shadow-card pointer-events-auto flex max-w-md animate-[toast-in_.4s_var(--ease-out-cubic)] items-center gap-3 rounded-sm px-4 py-3 text-start text-sm font-medium',
              item.tone === 'error' ? 'bg-rust text-cream' : 'bg-teal text-cream',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.message}
          </button>
        )
      })}
      <style>{`@keyframes toast-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
