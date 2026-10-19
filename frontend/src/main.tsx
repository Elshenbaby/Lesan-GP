import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/design/global.css'
import '@/i18n'
import { App } from '@/app/App'
import { USE_MOCKS } from '@/lib/env'

async function bootstrap() {
  if (USE_MOCKS) {
    const { startMocks } = await import('@/mocks/browser')
    await startMocks()
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
