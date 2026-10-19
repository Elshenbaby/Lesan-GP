import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button, Input } from '@/components/ui'
import { useLogin } from '@/lib/api'
import { USE_MOCKS } from '@/lib/env'
import { homeForRole } from '@/stores/auth'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })
type Form = z.infer<typeof schema>

export default function LoginPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from
  const login = useLogin()
  const { register, handleSubmit, setValue, formState } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (values) => {
    const { user } = await login.mutateAsync(values)
    navigate(from ?? homeForRole(user.role), { replace: true })
  })

  const fillDemo = (email: string) => {
    setValue('email', email)
    setValue('password', 'lisan-demo-123')
  }

  return (
    <div className="flex flex-col gap-8">
      <div data-reveal>
        <h1 className="text-4xl">{t('login.title')}</h1>
        <p className="text-sage mt-2">{t('login.subtitle')}</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" data-reveal>
        <Input
          type="email"
          autoComplete="email"
          label={t('login.email')}
          error={formState.errors.email && ' '}
          {...register('email')}
        />
        <Input
          type="password"
          autoComplete="current-password"
          label={t('login.password')}
          error={formState.errors.password && ' '}
          {...register('password')}
        />
        <Link
          to="/forgot-password"
          className="text-sage self-end text-sm font-semibold underline-offset-4 hover:underline"
        >
          {t('login.forgot')}
        </Link>
        {login.isError && <p className="text-rust text-sm">{t('login.error')}</p>}
        <Button type="submit" variant="primary" size="lg" loading={login.isPending} full>
          {t('login.submit')}
        </Button>
      </form>

      {(USE_MOCKS || import.meta.env.DEV) && (
        <div className="border-tan rounded-md border-2 border-dashed p-4" data-reveal>
          <div className="eyebrow mb-3">{t('login.demo')}</div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => fillDemo('parent@lisan.app')}>
              {t('login.demoParent')}
            </Button>
            <Button size="sm" onClick={() => fillDemo('therapist@lisan.app')}>
              {t('login.demoTherapist')}
            </Button>
          </div>
        </div>
      )}

      <p className="text-sage text-center text-sm" data-reveal>
        {t('login.noAccount')}{' '}
        <Link to="/signup" className="text-teal font-semibold underline underline-offset-4">
          {t('login.createOne')}
        </Link>
      </p>
    </div>
  )
}
