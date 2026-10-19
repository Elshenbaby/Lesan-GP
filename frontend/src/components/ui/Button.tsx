import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/utils/cn'
import { Spinner } from './Spinner'

export type ButtonVariant = 'outline' | 'primary' | 'rust' | 'ghost' | 'cream'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'hover-wash inline-flex items-center justify-center gap-2 rounded-sm border-2 font-medium whitespace-nowrap select-none transition-[background-color,color,opacity,transform] duration-300 ease-[var(--ease-out-cubic)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  outline: 'border-current bg-transparent text-teal',
  primary: 'border-teal bg-teal text-cream',
  rust: 'border-rust bg-rust text-cream',
  cream: 'border-cream bg-cream text-teal',
  ghost: 'border-transparent bg-transparent text-teal',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-14 min-w-[16rem] px-7 text-lg',
}

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  iconStart?: ReactNode
  iconEnd?: ReactNode
  full?: boolean
}

export type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>

export const buttonClass = ({ variant = 'outline', size = 'md', full }: Omit<CommonProps, 'loading'> = {}) =>
  cn(base, variants[variant], sizes[size], full && 'w-full')

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    loading,
    iconStart,
    iconEnd,
    full,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(buttonClass({ variant, size, full }), className)}
      {...rest}
    >
      {loading ? <Spinner className="size-4" /> : iconStart}
      {children}
      {iconEnd}
    </button>
  )
})

export function ButtonLink({
  variant,
  size,
  full,
  iconStart,
  iconEnd,
  className,
  children,
  ...rest
}: Omit<CommonProps, 'loading'> & LinkProps) {
  return (
    <Link className={cn(buttonClass({ variant, size, full }), className)} {...rest}>
      {iconStart}
      {children}
      {iconEnd}
    </Link>
  )
}
