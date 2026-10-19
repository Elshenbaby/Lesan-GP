import { usePreferences } from '@/stores/preferences'

/**
 * Voice prompts via the browser's speech synthesis.
 * Placeholder until therapist-approved recorded Egyptian-dialect prompts are produced.
 */
export function speak(text: string, lang: 'ar' | 'en') {
  const { muted, voicePrompts } = usePreferences.getState()
  if (muted || !voicePrompts || typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ''))
  utter.lang = lang === 'ar' ? 'ar-EG' : 'en-GB'
  utter.rate = 0.95
  utter.pitch = 1.1
  window.speechSynthesis.speak(utter)
}

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
}
