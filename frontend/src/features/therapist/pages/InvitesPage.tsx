import { ArrowDownLeft, ArrowUpRight, Send } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Input,
  PageLoader,
  toast,
} from '@/components/ui'
import { useInvites, useRespondInvite, useSendInvite } from '@/lib/api'
import { formatRelative } from '@/lib/utils/format'
import type { Invite } from '@/types/domain'
import { PageHeader } from '@/app/layouts/DashboardShell'

const statusTone = { pending: 'warn', accepted: 'ok', declined: 'neutral' } as const

export default function InvitesPage() {
  const { t } = useTranslation('clinic')
  const { data: invites = [], isLoading, isError, refetch } = useInvites()
  const send = useSendInvite()
  const [email, setEmail] = useState('')

  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  const incoming = invites.filter((i) => i.direction === 'incoming')
  const outgoing = invites.filter((i) => i.direction === 'outgoing')

  return (
    <>
      <PageHeader
        eyebrow={t('invites.eyebrow')}
        title={t('invites.title')}
        description={t('invites.description')}
      />
      <Card className="mb-5" data-reveal>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            await send.mutateAsync(email)
            setEmail('')
            toast.success(t('invites.sent'))
          }}
        >
          <Input
            type="email"
            className="min-w-64 flex-1"
            label={t('invites.send')}
            placeholder={t('invites.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            variant="primary"
            iconStart={<Send className="size-4" />}
            loading={send.isPending}
            disabled={!email.includes('@')}
          >
            {t('invites.send')}
          </Button>
        </form>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <InviteList
          title={t('invites.incoming')}
          icon={<ArrowDownLeft className="size-5" />}
          invites={incoming}
        />
        <InviteList
          title={t('invites.outgoing')}
          icon={<ArrowUpRight className="size-5" />}
          invites={outgoing}
        />
      </div>
    </>
  )
}

function InviteList({ title, icon, invites }: { title: string; icon: React.ReactNode; invites: Invite[] }) {
  const { t } = useTranslation('clinic')
  const respond = useRespondInvite()
  return (
    <Card data-reveal>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
        }
      />
      {invites.length ? (
        <ul className="divide-tan/50 divide-y">
          {invites.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <div className="font-semibold">{i.email}</div>
                <div className="text-sage text-xs">
                  {i.childName && `${t('invites.for', { child: i.childName })} · `}
                  {formatRelative(i.createdAt)}
                </div>
              </div>
              {i.direction === 'incoming' && i.status === 'pending' ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => respond.mutate({ id: i.id, accept: true })}
                  >
                    {t('invites.accept')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => respond.mutate({ id: i.id, accept: false })}
                  >
                    {t('invites.decline')}
                  </Button>
                </div>
              ) : (
                <Badge tone={statusTone[i.status]} dot>
                  {t(`invites.status.${i.status}`)}
                </Badge>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={t('invites.empty')} className="p-6" />
      )}
    </Card>
  )
}
