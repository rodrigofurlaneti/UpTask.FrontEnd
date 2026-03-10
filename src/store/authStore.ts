import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthToken } from '@/types'

interface AuthState {
  token: string | null
  user: { id: string; email: string; role: string; name?: string } | null
  isAuthenticated: boolean
  login: (auth: AuthToken) => void
  logout: () => void
  setName: (name: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (auth) => {
        localStorage.setItem('uptask_token', auth.accessToken)
        set({
          token: auth.accessToken,
          user: { id: auth.userId, email: auth.email, role: auth.role, name: auth.name },
          isAuthenticated: true,
        })
      },
      logout: () => {
        localStorage.removeItem('uptask_token')
        set({ token: null, user: null, isAuthenticated: false })
      },
      setName: (name) =>
        set((s) => ({ user: s.user ? { ...s.user, name } : null })),
    }),
    { name: 'uptask_auth', partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
)
