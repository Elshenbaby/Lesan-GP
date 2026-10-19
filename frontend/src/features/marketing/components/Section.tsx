import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export function Section({
  children,
  className,
  tone = 'sand',
  id,
}: {
  children: ReactNode
  className?: string
  tone?: 'sand' | 'cream' | 'teal' | 'rust'
  id?: string
}) {
  return (
    <section
      id={id}
      className={cn(
        'py-20 sm:py-28',
        {
          sand: 'bg-sand text-teal',
          cream: 'bg-cream text-teal',
          teal: 'bg-teal text-tan',
          rust: 'bg-rust text-cream',
        }[tone],
        className,
      )}
    >
      <div className="container-page">{children}</div>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = 'start',
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  body?: ReactNode
  align?: 'start' | 'center'
  className?: string
}) {
  return (
    <div
      className={cn('mb-12 max-w-3xl', align === 'center' && 'mx-auto text-center', className)}
      data-reveal
    >
      {eyebrow && <div className="eyebrow mb-4 !text-current opacity-70">{eyebrow}</div>}
      <h2 className="text-4xl text-balance sm:text-5xl">{title}</h2>
      {body && <p className="mt-5 text-lg opacity-80">{body}</p>}
    </div>
  )
}
