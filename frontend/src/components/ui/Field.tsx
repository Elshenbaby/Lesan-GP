import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/utils/cn'

const control =
  'w-full rounded-sm border-2 border-teal/20 bg-cream px-4 text-teal placeholder:text-sage/60 transition-colors duration-200 hover:border-teal/40 focus:border-teal focus:outline-none aria-[invalid=true]:border-rust'

interface FieldShellProps {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  id: string
  children: ReactNode
  className?: string
}

function FieldShell({ label, hint, error, id, children, className }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-teal text-sm font-semibold">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-rust text-sm">
          {error}
        </p>
      ) : (
        hint && <p className="text-sage text-sm">{hint}</p>
      )}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode
  hint?: ReactNode
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, id, ...rest },
  ref,
) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <FieldShell label={label} hint={hint} error={error} id={fid} className={className}>
      <input
        ref={ref}
        id={fid}
        aria-invalid={!!error}
        aria-describedby={error ? `${fid}-error` : undefined}
        className={cn(control, 'h-12')}
        {...rest}
      />
    </FieldShell>
  )
})

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode
  hint?: ReactNode
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, id, rows = 4, ...rest },
  ref,
) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <FieldShell label={label} hint={hint} error={error} id={fid} className={className}>
      <textarea
        ref={ref}
        id={fid}
        rows={rows}
        aria-invalid={!!error}
        className={cn(control, 'py-3')}
        {...rest}
      />
    </FieldShell>
  )
})

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode
  hint?: ReactNode
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, id, children, ...rest },
  ref,
) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <FieldShell label={label} hint={hint} error={error} id={fid} className={className}>
      <select
        ref={ref}
        id={fid}
        aria-invalid={!!error}
        className={cn(control, 'h-12 cursor-pointer')}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  )
})

type CheckProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode
  description?: ReactNode
  type?: 'checkbox' | 'radio'
}

/** Large tappable checkbox/radio card, used for consent and multiple-choice questions. */
export const ChoiceCard = forwardRef<HTMLInputElement, CheckProps>(function ChoiceCard(
  { label, description, className, type = 'checkbox', ...rest },
  ref,
) {
  return (
    <label
      className={cn(
        'group border-teal/15 bg-cream hover:border-teal/40 has-[:checked]:border-teal has-[:checked]:bg-paper flex cursor-pointer items-start gap-3 rounded-md border-2 p-4 transition-colors',
        className,
      )}
    >
      <input
        ref={ref}
        type={type}
        className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--color-rust)]"
        {...rest}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-teal font-semibold">{label}</span>
        {description && <span className="text-sage text-sm">{description}</span>}
      </span>
    </label>
  )
})
