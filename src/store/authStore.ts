import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthToken } from '@/types'

interface AuthState {
    token: string | null
    user: {
        id: string;
        email: string;
        role: string;
        name?: string
    } | null
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

            // Função chamada após o sucesso do authApi.login
            login: (auth: AuthToken) => {
                set({
                    token: auth.accessToken,
                    user: {
                        id: auth.userId,
                        email: auth.email,
                        role: auth.role,
                        name: auth.name
                    },
                    isAuthenticated: true,
                })
            },

            // Limpa o estado e consequentemente o localStorage
            logout: () => {
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false
                })
                // Opcional: recarregar a página para limpar estados de cache (React Query)
                // window.location.href = '/login'
            },

            // Útil para atualizar o nome do perfil sem precisar de novo login
            setName: (name: string) =>
                set((s) => ({
                    user: s.user ? { ...s.user, name } : null
                })),
        }),
        {
            name: 'uptask_auth', // Nome da chave no LocalStorage
            storage: createJSONStorage(() => localStorage), // Garante o uso do localStorage
            // Filtra o que deve ser salvo (evita salvar funções, apenas dados)
            partialize: (s) => ({
                token: s.token,
                user: s.user,
                isAuthenticated: s.isAuthenticated
            })
        }
    )
)