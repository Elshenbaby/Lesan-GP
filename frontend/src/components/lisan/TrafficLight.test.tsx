import { act, cleanup, render, screen } from '@testing-library/react'
import i18n from '@/i18n'
import { SeverityBadge } from './TrafficLight'

describe('SeverityBadge', () => {
  afterEach(() => {
    cleanup()
    return i18n.changeLanguage('ar')
  })

  it('shows the localized severity label and follows language changes', async () => {
    await i18n.changeLanguage('en')
    render(<SeverityBadge severity="severe" />)
    expect(screen.getByText(i18n.t('severity.severe'))).toBeInTheDocument()

    await act(() => i18n.changeLanguage('ar'))
    expect(screen.getByText(i18n.t('severity.severe', { lng: 'ar' }))).toBeInTheDocument()
  })
})
