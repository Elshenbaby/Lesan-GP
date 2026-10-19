import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Child mode is a locked, full-screen state. Leaving it requires the parental gate,
 * so a child can't wander into the parent app.
 */
interface ChildModeState {
  activeChildId: string | null
  locked: boolean
  enter: (childId: string) => void
  exit: () => void
  setActiveChild: (childId: string) => void
}

export const useChildMode = create<ChildModeState>()(
  persist(
    (set) => ({
      activeChildId: null,
      locked: false,
      enter: (childId) => set({ activeChildId: childId, locked: true }),
      exit: () => set({ locked: false }),
      setActiveChild: (childId) => set({ activeChildId: childId }),
    }),
    { name: 'lisan-child-mode' },
  ),
)
