import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

export const startMocks = () =>
  worker.start({
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    onUnhandledRequest(request, print) {
      const url = new URL(request.url)
      // Only warn about API calls; ignore Vite assets, fonts, HMR.
      if (url.pathname.includes('/api/')) print.warning()
    },
  })
