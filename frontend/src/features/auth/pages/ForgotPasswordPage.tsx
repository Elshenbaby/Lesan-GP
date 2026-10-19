import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '@/components/ui'
import { useForgotPassword } from '@/lib/api'

export default function ForgotPasswordPage() {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')
  const forgot = useForgotPassword()

  return (
    <div className="flex flex-col gap-8">
      <div data-reveal>
        <h1 className="text-4xl">{t('forgot.title')}</h1>
        <p className="text-sage mt-2">{t('forgot.subtitle')}</p>
      </div>
      {forgot.isSuccess ? (
        <div className="bg-ok-soft text-ok flex items-start gap-3 rounded-md p-4">
          <MailCheck className="size-5 shrink-0" />
          <p className="font-semibold">{t('forgot.sent')}</p>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            forgot.mutate(email)
          }}
        >
          <Input
            type="email"
            required
            label={t('login.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="primary" size="lg" loading={forgot.isPending} full>
            {t('forgot.submit')}
          </Button>
        </form>
      )}
      <Link to="/login" className="text-center text-sm font-semibold underline underline-offset-4">
        {t('forgot.back')}
      </Link>
    </div>
  )
}
