import { cn } from '@/lib/utils/cn'
import { initials } from '@/lib/utils/format'

const palette = ['#bb4d34', '#21393b', '#58635d', '#b9a183', '#5f8a63', '#d49a3a']

export function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name: string
  src?: string
  size?: number
  className?: string
}) {
  const color = palette[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length]
  return src ? (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        'text-cream inline-grid shrink-0 place-items-center rounded-full font-semibold',
        className,
      )}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </span>
  )
}
