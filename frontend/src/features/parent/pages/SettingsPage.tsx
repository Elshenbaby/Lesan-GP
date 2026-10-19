import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '@/components/lisan'
import { Button, Card, CardHeader, ChoiceCard, Modal, PageLoader, toast } from '@/components/ui'
import { useChildRecordings, useDeleteRecordings, useUpdateChild } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { usePreferences } from '@/stores/preferences'
import type { Child } from '@/types/domain'
import { PageHeader } from '@/app/layouts/DashboardShell'
import { useActiveChild } from '../useActiveChild'

export default function SettingsPage() {
  const { t } = useTranslation('parent')
  const { child, isLoading } = useActiveChild()
  const user = useAuthStore((s) => s.user)
  const { voicePrompts, setVoicePrompts } = usePreferences()

  if (isLoading) return <PageLoader />

  return (
    <>
      <PageHeader eyebrow={t('settings.eyebrow')} title={t('settings.title')} />
      <div className="grid gap-5 lg:grid-cols-2">
        {child && <ConsentCard child={child} />}
        {child && <RecordingsCard child={child} />}
        <Card data-reveal>
          <CardHeader title={t('settings.voiceTitle')} />
          <ChoiceCard
            label={t('settings.voicePrompts')}
            checked={voicePrompts}
            onChange={(e) => setVoicePrompts(e.target.checked)}
          />
        </Card>
        <Card data-reveal>
          <CardHeader title={t('settings.accountTitle')} />
          {user && (
            <dl className="mb-4 text-sm">
              <dt className="font-semibold">{user.fullName}</dt>
              <dd className="text-sage">{user.email}</dd>
            </dl>
          )}
          <div className="bg-sand/60 flex items-center justify-between rounded-md p-4">
            <span className="font-semibold">{t('settings.language')}</span>
            <LanguageToggle />
          </div>
        </Card>
      </div>
    </>
  )
}

function ConsentCard({ child }: { child: Child }) {
  const { t } = useTranslation('parent')
  const update = useUpdateChild(child.id)
  const set = (patch: Partial<Child>) =>
    update.mutate(patch, { onSuccess: () => toast.success(t('child.saved')) })

  return (
    <Card data-reveal>
      <CardHeader title={t('settings.consentTitle')} eyebrow={child.name} />
      <div className="flex flex-col gap-3">
        <ChoiceCard
          label={t('settings.consentRecording')}
          checked={child.consentRecording}
          onChange={(e) => set({ consentRecording: e.target.checked })}
        />
        <ChoiceCard
          label={t('settings.consentResearch')}
          checked={child.consentResearch}
          onChange={(e) => set({ consentResearch: e.target.checked })}
        />
      </div>
    </Card>
  )
}

function RecordingsCard({ child }: { child: Child }) {
  const { t } = useTranslation('parent')
  const { t: tc } = useTranslation()
  const { data: recordings = [] } = useChildRecordings(child.id)
  const remove = useDeleteRecordings(child.id)
  const [confirm, setConfirm] = useState(false)

  return (
    <Card data-reveal>
      <CardHeader title={t('settings.recordingsTitle')} />
      <p className="text-sage mb-5">
        {t('settings.recordingsBody', { count: recordings.length, child: child.name })}
      </p>
      <Button
        variant="outline"
        className="border-rust text-rust"
        iconStart={<Trash2 className="size-4" />}
        disabled={!recordings.length}
        onClick={() => setConfirm(true)}
      >
        {t('settings.deleteAll')}
      </Button>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t('settings.deleteConfirmTitle')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              {tc('actions.cancel')}
            </Button>
            <Button
              variant="rust"
              loading={remove.isPending}
              onClick={async () => {
                await remove.mutateAsync()
                toast.success(t('settings.deleted'))
                setConfirm(false)
              }}
            >
              {tc('actions.delete')}
            </Button>
          </>
        }
      >
        <p className="text-sage">{t('settings.deleteConfirmBody', { child: child.name })}</p>
      </Modal>
    </Card>
  )
}
