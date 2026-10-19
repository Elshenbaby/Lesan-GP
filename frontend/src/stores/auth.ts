import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthTokens, Role, User } from '@/types/domain'

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  setSession: (user: User, tokens: AuthTokens) => void
  setTokens: (tokens: AuthTokens) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      setSession: (user, tokens) => set({ user, tokens }),
      setTokens: (tokens) => set({ tokens }),
      logout: () => set({ user: null, tokens: null }),
    }),
    { name: 'lisan-auth' },
  ),
)

/** Where each role lands after login. */
export const homeForRole = (role: Role) => (role === 'therapist' ? '/clinic' : '/parent')
