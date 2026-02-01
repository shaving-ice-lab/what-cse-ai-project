import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";
import { WEB_AUTH_CONFIG } from "@what-cse/shared";

interface User {
  id: number;
  phone: string;
  email: string;
  nickname: string;
  avatar: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  /** 最后活动时间戳 */
  lastActivityAt: number | null;
  /** Token 过期时间戳 */
  tokenExpiresAt: number | null;
  // Hydration 状态
  _hasHydrated: boolean;
  // Actions
  setUser: (user: User, accessToken: string, refreshToken: string, expiresIn?: number) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setHasHydrated: (state: boolean) => void;
  /** 更新最后活动时间 */
  updateActivity: () => void;
  /** 检查会话是否有效（未超过不活动时间） */
  isSessionValid: () => boolean;
  /** 检查是否需要刷新 token */
  shouldRefreshToken: () => boolean;
  /** 刷新 token 后更新状态 */
  updateTokens: (accessToken: string, refreshToken: string, expiresIn?: number) => void;
}

// Cookie 操作工具函数
const setCookie = (
  name: string,
  value: string,
  days: number = WEB_AUTH_CONFIG.cookieMaxAgeDays
) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

// 只使用 Cookie 存储，不使用 localStorage
// 这样可以确保服务端（middleware）和客户端使用相同的数据源
const cookieOnlyStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    return getCookie(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    setCookie(name, value, WEB_AUTH_CONFIG.cookieMaxAgeDays);
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    deleteCookie(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      lastActivityAt: null,
      tokenExpiresAt: null,
      _hasHydrated: false,

      setUser: (user, accessToken, refreshToken, expiresIn = 3600) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          lastActivityAt: Date.now(),
          tokenExpiresAt: Date.now() + expiresIn * 1000,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          lastActivityAt: null,
          tokenExpiresAt: null,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      updateActivity: () => set({ lastActivityAt: Date.now() }),

      isSessionValid: () => {
        const state = get();
        if (!state.isAuthenticated || !state.lastActivityAt) return false;

        const now = Date.now();
        const { inactivityTimeout } = WEB_AUTH_CONFIG;

        // 检查是否超过不活动时间
        if (now - state.lastActivityAt > inactivityTimeout) {
          return false;
        }

        return true;
      },

      shouldRefreshToken: () => {
        const state = get();
        if (!state.isAuthenticated || !state.tokenExpiresAt || !state.refreshToken) {
          return false;
        }

        const now = Date.now();
        const { tokenRefreshThreshold } = WEB_AUTH_CONFIG;

        // 如果距离过期时间小于阈值，需要刷新
        return state.tokenExpiresAt - now < tokenRefreshThreshold;
      },

      updateTokens: (accessToken, refreshToken, expiresIn = 3600) =>
        set({
          accessToken,
          refreshToken,
          tokenExpiresAt: Date.now() + expiresIn * 1000,
          lastActivityAt: Date.now(),
        }),
    }),
    {
      name: WEB_AUTH_CONFIG.cookieName,
      storage: createJSONStorage(() => cookieOnlyStorage),
      // 排除 _hasHydrated，不持久化
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        lastActivityAt: state.lastActivityAt,
        tokenExpiresAt: state.tokenExpiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
