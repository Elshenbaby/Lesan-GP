import { AudioWaveform, Mail, NotebookPen, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useInvites, useReviewQueue } from '@/lib/api'
import { DashboardShell } from './DashboardShell'

export function ClinicLayout() {
  const { t } = useTranslation('clinic')
  const { data: queue } = useReviewQueue()
  const { data: invites } = useInvites()
  const pendingInvites = invites?.filter((i) => i.direction === 'incoming' && i.status === 'pending').length

  return (
    <DashboardShell
      surfaceLabel={t('surface')}
      nav={[
        { to: '/clinic/patients', label: t('nav.patients'), icon: Users },
        { to: '/clinic/review', label: t('nav.review'), icon: AudioWaveform, badge: queue?.length },
        { to: '/clinic/notes', label: t('nav.notes'), icon: NotebookPen },
        { to: '/clinic/invites', label: t('nav.invites'), icon: Mail, badge: pendingInvites },
      ]}
    />
  )
}
