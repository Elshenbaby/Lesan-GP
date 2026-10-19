import i18n from '@/i18n'
import { cn } from './cn'
import { formatPercent, initials } from './format'

describe('format', () => {
  afterEach(() => i18n.changeLanguage('ar'))

  it('formats percentages per language', async () => {
    await i18n.changeLanguage('en')
    expect(formatPercent(82)).toBe('82%')
    await i18n.changeLanguage('ar')
    expect(formatPercent(82)).toContain('٨٢')
  })

  it('takes up to two initials', () => {
    expect(initials('Mona  Adel Hassan')).toBe('MA')
    expect(initials('يوسف')).toBe('ي')
  })

  it('lets later Tailwind classes win', () => {
    expect(cn('px-2 text-sage', false, 'px-4')).toBe('text-sage px-4')
  })
})
