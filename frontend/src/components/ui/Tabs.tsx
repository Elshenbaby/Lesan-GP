import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export interface TabItem<T extends string> {
  value: T
  label: ReactNode
  count?: number
}

/** Segmented tabs (joined outline buttons like the reference's .c-button-group). */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={cn('border-teal/20 bg-cream inline-flex rounded-sm border-2 p-1', className)}
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'flex items-center gap-2 rounded-xs px-3.5 py-1.5 text-sm font-semibold transition-colors duration-300',
              active ? 'bg-teal text-cream' : 'text-sage hover:text-teal',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={cn('rounded-full px-1.5 text-xs', active ? 'bg-cream/20' : 'bg-sand')}>
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
