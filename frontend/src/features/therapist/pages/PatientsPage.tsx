import { Search, TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TrafficLight } from '@/components/lisan'
import { Avatar, Badge, Card, EmptyState, ErrorState, PageLoader, Tabs } from '@/components/ui'
import { usePatients } from '@/lib/api'
import { cn } from '@/lib/utils/cn'
import { formatNumber, formatPercent, formatRelative } from '@/lib/utils/format'
import type { Patient, PatientStatus } from '@/types/domain'
import { PageHeader } from '@/app/layouts/DashboardShell'
import { statusTone } from '../status'

type Filter = 'all' | PatientStatus
const FILTERS: Filter[] = ['all', 'stuck', 'ready', 'practicing', 'inactive']

export default function PatientsPage() {
  const { t } = useTranslation('clinic')
  const { data: patients = [], isLoading, isError, refetch } = usePatients()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return patients
      .filter((p) => filter === 'all' || p.status === filter)
      .filter((p) => !q || p.child.name.toLowerCase().includes(q) || p.parentName.toLowerCase().includes(q))
  }, [patients, filter, query])

  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <>
      <PageHeader
        eyebrow={t('patients.eyebrow')}
        title={t('patients.title')}
        description={t('patients.description')}
      />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3" data-reveal>
        <Tabs
          value={filter}
          onChange={setFilter}
          items={FILTERS.map((f) => ({
            value: f,
            label: t(`patients.filters.${f}`),
            count: f === 'all' ? patients.length : patients.filter((p) => p.status === f).length,
          }))}
        />
        <label className="relative w-full sm:w-72">
          <Search className="text-sage pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('patients.search')}
            className="border-teal/15 bg-cream focus:border-teal h-11 w-full rounded-sm border-2 ps-9 pe-3 text-sm outline-none"
          />
        </label>
      </div>

      {visible.length ? (
        <Card className="overflow-x-auto p-0" data-reveal>
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-tan/60 text-sage border-b text-start text-xs">
                {(['child', 'level', 'type', 'accuracy', 'last', 'reviews'] as const).map((c) => (
                  <th key={c} className="px-5 py-3 text-start font-semibold">
                    {t(`patients.columns.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <PatientRow key={p.child.id} patient={p} />
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState title={t('patients.empty')} />
      )}
    </>
  )
}

function PatientRow({ patient: p }: { patient: Patient }) {
  const { t } = useTranslation('clinic')
  const { t: tc } = useTranslation()
  const up = p.accuracyDelta >= 0
  return (
    <tr className="border-tan/40 hover:bg-sand/60 border-b transition-colors last:border-0">
      <td className="px-5 py-3.5">
        <Link to={`/clinic/patients/${p.child.id}`} className="flex items-center gap-3">
          <Avatar name={p.child.name} size={38} />
          <div>
            <div className="flex items-center gap-2 font-semibold">
              {p.child.name}
              <Badge tone={statusTone[p.status]}>{t(`patients.filters.${p.status}`)}</Badge>
            </div>
            <div className="text-sage text-xs">{t('patients.parent', { name: p.parentName })}</div>
          </div>
        </Link>
      </td>
      <td className="px-5 py-3.5">
        {p.child.currentLevel && tc(`levels.${p.child.currentLevel}`)}
        {p.planStatus === 'pending_approval' && (
          <div className="text-rust text-xs">{t('patients.pendingPlan')}</div>
        )}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <TrafficLight severity={p.severity} />
          {tc(`lispTypesShort.${p.lispType}`)}
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{formatPercent(p.accuracy)}</span>
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-semibold',
              up ? 'text-ok' : 'text-rust',
            )}
          >
            {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {formatNumber(Math.abs(p.accuracyDelta))}
          </span>
        </div>
      </td>
      <td className="text-sage px-5 py-3.5">
        {p.lastSessionAt ? formatRelative(p.lastSessionAt) : t('patients.never')}
      </td>
      <td className="px-5 py-3.5">
        {p.pendingReviews ? (
          <Badge tone="rust">{formatNumber(p.pendingReviews)}</Badge>
        ) : (
          <span className="text-sage">—</span>
        )}
      </td>
    </tr>
  )
}
