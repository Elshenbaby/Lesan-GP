import { http, HttpResponse } from 'msw'
import { endpoints as ep } from '@/lib/api/endpoints'
import type { FreeCheckAnswers, FreeCheckResult } from '@/types/domain'
import { synthesizeSibilantWav } from '../audio'
import { api, latency, loc } from './utils'

export const publicHandlers = [
  http.post(api(ep.freeCheck), async ({ request }) => {
    await new Promise((r) => setTimeout(r, 1200))
    const form = await request.formData()
    const answers = JSON.parse(String(form.get('answers'))) as FreeCheckAnswers
    const signals = answers.concerns.length + answers.noticedSounds.length
    const likelihood: FreeCheckResult['likelihood'] =
      signals >= 3 ? 'likely' : signals >= 1 ? 'possible' : 'low'
    const result: FreeCheckResult = {
      likelihood,
      soundsToCheck: answers.noticedSounds.length ? answers.noticedSounds : ['س'],
      message: loc(request, {
        ar: 'ده فحص سريع مش تشخيص. الاختبار الكامل جوه التطبيق بياخد ١٠ دقايق وبيحدد الأصوات بالظبط.',
        en: 'This is a quick check, not a diagnosis. The full screening in the app takes 10 minutes and pinpoints the exact sounds.',
      }),
    }
    return HttpResponse.json(result)
  }),

  http.post(api(ep.partnerRequest), async () => {
    await latency()
    return HttpResponse.json({ ok: true })
  }),

  http.get(api('/media/recordings/:file'), ({ params }) =>
    HttpResponse.arrayBuffer(synthesizeSibilantWav(String(params.file)), {
      headers: { 'Content-Type': 'audio/wav' },
    }),
  ),
]
