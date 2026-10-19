import { useTranslation } from 'react-i18next'

export function useDirection() {
  const { i18n } = useTranslation()
  const lang = (i18n.language?.startsWith('en') ? 'en' : 'ar') as 'ar' | 'en'
  return { lang, dir: lang === 'ar' ? ('rtl' as const) : ('ltr' as const), isRtl: lang === 'ar' }
}
