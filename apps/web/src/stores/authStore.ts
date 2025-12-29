import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  phone: string
  email: string
  nickname: string
  avatar: string
}

interface Admin {
  id: number
  username: string
  role: string
}

interface AuthState {
  user: User | null
  admin: Admin | null
  accessToken: string | null
  refreshToken: string | null
  adminToken: string | null
  isAuthenticated: boolean
  isAdminAuthenticated: boolean
  setUser: (user: User, accessToken: string, refreshToken: string) => void
  setAdmin: (admin: Admin, token: string) => void
  logout: () => void
  adminLogout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      admin: null,
      accessToken: null,
      refreshToken: null,
      adminToken: null,
      isAuthenticated: false,
      isAdminAuthenticated: false,

      setUser: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setAdmin: (admin, token) =>
        set({
          admin,
          adminToken: token,
          isAdminAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      adminLogout: () =>
        set({
          admin: null,
          adminToken: null,
          isAdminAuthenticated: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
)
