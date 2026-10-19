import i18n from '@/i18n'

const locale = () => (i18n.language === 'ar' ? 'ar-EG' : 'en-GB')

export const formatPercent = (value: number) =>
  new Intl.NumberFormat(locale(), { style: 'percent', maximumFractionDigits: 0 }).format(value / 100)

export const formatNumber = (value: number) => new Intl.NumberFormat(locale()).format(value)

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) =>
  new Intl.DateTimeFormat(locale(), opts).format(new Date(iso))

export function formatRelative(iso: string) {
  const diffMs = new Date(iso).getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' })
  const minutes = Math.round(diffMs / 60_000)
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  return rtf.format(Math.round(hours / 24), 'day')
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
