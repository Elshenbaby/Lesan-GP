import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'

export function LanguageToggle({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const next = i18n.language === 'ar' ? 'en' : 'ar'
  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(next)}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70',
        className,
      )}
      lang={next}
      aria-label={t('language.label')}
    >
      <Languages className="size-4" />
      {t('language.switchTo')}
    </button>
  )
}
