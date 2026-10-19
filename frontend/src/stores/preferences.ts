import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesState {
  muted: boolean
  voicePrompts: boolean
  toggleMuted: () => void
  setVoicePrompts: (on: boolean) => void
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      muted: false,
      voicePrompts: true,
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
      setVoicePrompts: (voicePrompts) => set({ voicePrompts }),
    }),
    { name: 'lisan-preferences' },
  ),
)
