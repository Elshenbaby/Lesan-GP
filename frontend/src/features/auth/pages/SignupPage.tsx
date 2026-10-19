import { zodResolver } from '@hookform/resolvers/zod'
import { Baby, Stethoscope, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button, ChoiceCard, Input } from '@/components/ui'
import { useSignup } from '@/lib/api'
import { cn } from '@/lib/utils/cn'
import type { ApiError, Role } from '@/types/domain'

const schema = z.object({
  role: z.enum(['parent', 'adult', 'therapist']),
  fullName: z.string().min(2, 'name'),
  email: z.string().email('email'),
  password: z.string().min(8, 'password'),
  clinicName: z.string().optional(),
  licenseNumber: z.string().optional(),
  terms: z.literal(true, { errorMap: () => ({ message: 'terms' }) }),
})
type Form = z.infer<typeof schema>

const roleIcons: Record<Role, typeof User> = { parent: Baby, adult: User, therapist: Stethoscope }

export default function SignupPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const signup = useSignup()
  const { register, handleSubmit, watch, formState, setError } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'parent' },
  })
  const role = watch('role')
  const err = (k: keyof Form) => {
    const m = formState.errors[k]?.message
    return m ? t(`signup.errors.${m as 'name'}`) : undefined
  }

  const onSubmit = handleSubmit(async ({ terms: _terms, ...values }) => {
    try {
      const { user } = await signup.mutateAsync(values)
      navigate(user.role === 'therapist' ? '/clinic' : '/onboarding/child', { replace: true })
    } catch (e) {
      if ((e as ApiError).code === 'email_taken') setError('email', { message: 'taken' })
    }
  })

  return (
    <div className="flex flex-col gap-8">
      <div data-reveal>
        <h1 className="text-4xl">{t('signup.title')}</h1>
        <p className="text-sage mt-2">{t('signup.subtitle')}</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5" data-reveal>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{t('signup.roleLabel')}</legend>
          <div className="grid grid-cols-3 gap-2">
            {(['parent', 'adult', 'therapist'] as const).map((r) => {
              const Icon = roleIcons[r]
              return (
                <label
                  key={r}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 p-3 text-center transition-colors',
                    role === r
                      ? 'border-teal bg-teal text-cream'
                      : 'border-teal/15 bg-cream hover:border-teal/40',
                  )}
                >
                  <input type="radio" value={r} className="sr-only" {...register('role')} />
                  <Icon className="size-6" strokeWidth={1.6} />
                  <span className="text-sm leading-tight font-semibold">{t(`signup.roles.${r}.title`)}</span>
                  <span className="hidden text-xs opacity-70 sm:block">{t(`signup.roles.${r}.body`)}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <Input
          label={t('signup.fullName')}
          autoComplete="name"
          error={err('fullName')}
          {...register('fullName')}
        />
        <Input
          type="email"
          label={t('signup.email')}
          autoComplete="email"
          error={err('email')}
          {...register('email')}
        />
        <Input
          type="password"
          label={t('signup.password')}
          hint={t('signup.passwordHint')}
          autoComplete="new-password"
          error={err('password')}
          {...register('password')}
        />
        {role === 'therapist' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t('signup.clinicName')} {...register('clinicName')} />
            <Input label={t('signup.license')} {...register('licenseNumber')} />
          </div>
        )}
        <ChoiceCard label={t('signup.terms')} {...register('terms')} />
        {err('terms') && <p className="text-rust -mt-3 text-sm">{err('terms')}</p>}

        <Button type="submit" variant="primary" size="lg" loading={signup.isPending} full>
          {t('signup.submit')}
        </Button>
      </form>

      <p className="text-sage text-center text-sm">
        {t('signup.haveAccount')}{' '}
        <Link to="/login" className="text-teal font-semibold underline underline-offset-4">
          {t('signup.login')}
        </Link>
      </p>
    </div>
  )
}
