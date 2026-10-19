import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import arAuth from './ar/auth.json'
import arChild from './ar/child.json'
import arClinic from './ar/clinic.json'
import arCommon from './ar/common.json'
import arMarketing from './ar/marketing.json'
import arParent from './ar/parent.json'
import enAuth from './en/auth.json'
import enChild from './en/child.json'
import enClinic from './en/clinic.json'
import enCommon from './en/common.json'
import enMarketing from './en/marketing.json'
import enParent from './en/parent.json'

export const resources = {
  ar: {
    common: arCommon,
    marketing: arMarketing,
    auth: arAuth,
    child: arChild,
    parent: arParent,
    clinic: arClinic,
  },
  en: {
    common: enCommon,
    marketing: enMarketing,
    auth: enAuth,
    child: enChild,
    parent: enParent,
    clinic: enClinic,
  },
} as const

export const SUPPORTED_LANGUAGES = ['ar', 'en'] as const

function applyDocumentDirection(lng: string) {
  const lang = lng.startsWith('en') ? 'en' : 'ar'
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    defaultNS: 'common',
    ns: ['common', 'marketing', 'auth', 'child', 'parent', 'clinic'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'htmlTag'],
      lookupLocalStorage: 'lisan-lang',
      caches: ['localStorage'],
    },
    returnNull: false,
  })

applyDocumentDirection(i18n.language ?? 'ar')
i18n.on('languageChanged', applyDocumentDirection)

export default i18n
