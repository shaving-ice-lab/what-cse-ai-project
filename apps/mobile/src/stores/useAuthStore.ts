import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Taro from "@tarojs/taro";
import { authService } from "../services/auth";

interface User {
  id: number;
  nickname: string;
  avatar: string;
  phone: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (phone: string, password: string) => Promise<void>;
  wxLogin: (code: string) => Promise<void>;
  register: (phone: string, code: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  checkAndRefreshToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      isInitialized: false,
      isLoading: false,

      setToken: (token) => set({ token, isLoggedIn: true }),

      setUser: (user) => set({ user }),

      login: async (phone, password) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(phone, password);
          set({
            token: response.token,
            user: response.user,
            isLoggedIn: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      wxLogin: async (code) => {
        set({ isLoading: true });
        try {
          const response = await authService.wxLogin(code);
          set({
            token: response.token,
            user: response.user,
            isLoggedIn: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (phone, code, password) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(phone, code, password);
          set({
            token: response.token,
            user: response.user,
            isLoggedIn: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authService.clearTokens();
        set({
          token: null,
          user: null,
          isLoggedIn: false,
        });
        Taro.removeStorageSync("auth-storage");
        Taro.reLaunch({ url: "/pages/index/index" });
      },

      initialize: async () => {
        const storedToken = authService.getStoredToken();
        if (storedToken && authService.isTokenValid()) {
          const validToken = await authService.getValidToken();
          if (validToken) {
            set({
              token: validToken,
              isLoggedIn: true,
              isInitialized: true,
            });
            return;
          }
        }
        set({ isInitialized: true });
      },

      checkAndRefreshToken: async () => {
        try {
          const validToken = await authService.getValidToken();
          if (validToken) {
            set({ token: validToken });
            return true;
          }
          get().logout();
          return false;
        } catch {
          get().logout();
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => Taro.getStorageSync(name),
        setItem: (name, value) => Taro.setStorageSync(name, value),
        removeItem: (name) => Taro.removeStorageSync(name),
      })),
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
