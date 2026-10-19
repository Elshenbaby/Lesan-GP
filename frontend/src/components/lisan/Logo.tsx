import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'

/** Pennant logo, a nod to the reference's flag mark. */
export function Logo({
  className,
  to = '/',
  tone = 'tan',
}: {
  className?: string
  to?: string
  tone?: 'tan' | 'cream'
}) {
  const { t, i18n } = useTranslation()
  const ar = i18n.language === 'ar'
  return (
    <Link to={to} className={cn('group inline-flex items-center', className)} aria-label={t('appName')}>
      <svg
        viewBox="0 0 150 56"
        className="h-12 w-auto drop-shadow-[0_2px_0_rgb(33_57_59/0.15)]"
        aria-hidden="true"
      >
        <path
          d="M4 4 L146 28 L4 52 Z"
          fill={tone === 'tan' ? '#D7C4AB' : '#FCF7F1'}
          stroke="#21393B"
          strokeWidth="2"
          strokeLinejoin="round"
          className="origin-left transition-transform duration-500 ease-[var(--ease-out-cubic)] group-hover:[transform:skewY(-3deg)]"
        />
        <path d="M84 24 L128 28 L84 32 L94 28 Z" fill="#BB4D34" />
        <text
          x={ar ? 50 : 12}
          y="35"
          textAnchor={ar ? 'middle' : 'start'}
          fill="#21393B"
          style={{
            font: ar ? '700 22px Alexandria, sans-serif' : '400 21px "Young Serif", serif',
            letterSpacing: ar ? 0 : 1,
          }}
        >
          {ar ? 'لسان' : 'LISAN'}
        </text>
      </svg>
    </Link>
  )
}
