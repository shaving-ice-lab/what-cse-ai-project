import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'

interface User {
  id: number
  nickname: string
  avatar: string
  phone: string
}

interface AuthState {
  token: string | null
  user: User | null
  isLoggedIn: boolean
  setToken: (token: string) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      setToken: (token) => set({ token, isLoggedIn: true }),
      setUser: (user) => set({ user }),
      logout: () => {
        set({ token: null, user: null, isLoggedIn: false })
        Taro.removeStorageSync('auth-storage')
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => Taro.getStorageSync(name),
        setItem: (name, value) => Taro.setStorageSync(name, value),
        removeItem: (name) => Taro.removeStorageSync(name),
      })),
    }
  )
)
