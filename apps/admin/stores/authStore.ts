import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";
import { ADMIN_AUTH_CONFIG } from "@what-cse/shared";

interface Admin {
  id: number;
  username: string;
  role: string;
}

interface AuthState {
  admin: Admin | null;
  adminToken: string | null;
  isAuthenticated: boolean;
  /** 最后活动时间戳 */
  lastActivityAt: number | null;
  _hasHydrated: boolean;
  setAdmin: (admin: Admin, token: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
  /** 更新最后活动时间 */
  updateActivity: () => void;
  /** 检查会话是否有效（未超过不活动时间） */
  isSessionValid: () => boolean;
}

// Cookie 操作工具函数
const setCookie = (name: string, value: string, days: number = ADMIN_AUTH_CONFIG.cookieMaxAgeDays) => {
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
    setCookie(name, value, ADMIN_AUTH_CONFIG.cookieMaxAgeDays);
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    deleteCookie(name);
  },
};

// 开发模式：默认已登录状态
const DEV_SKIP_AUTH = false;

// 开发模式下的默认管理员
const DEV_DEFAULT_ADMIN: Admin = {
  id: 1,
  username: "开发管理员",
  role: "super_admin",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: DEV_SKIP_AUTH ? DEV_DEFAULT_ADMIN : null,
      adminToken: DEV_SKIP_AUTH ? "dev-token" : null,
      isAuthenticated: DEV_SKIP_AUTH ? true : false,
      lastActivityAt: DEV_SKIP_AUTH ? Date.now() : null,
      _hasHydrated: false,

      setAdmin: (admin, token) =>
        set({
          admin,
          adminToken: token,
          isAuthenticated: true,
          lastActivityAt: Date.now(),
        }),

      logout: () =>
        set({
          admin: DEV_SKIP_AUTH ? DEV_DEFAULT_ADMIN : null,
          adminToken: DEV_SKIP_AUTH ? "dev-token" : null,
          isAuthenticated: DEV_SKIP_AUTH ? true : false,
          lastActivityAt: DEV_SKIP_AUTH ? Date.now() : null,
        }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      updateActivity: () => set({ lastActivityAt: Date.now() }),

      isSessionValid: () => {
        const state = get();
        if (!state.isAuthenticated || !state.lastActivityAt) return false;

        const now = Date.now();
        const { inactivityTimeout } = ADMIN_AUTH_CONFIG;

        // 检查是否超过不活动时间
        if (now - state.lastActivityAt > inactivityTimeout) {
          return false;
        }

        return true;
      },
    }),
    {
      name: ADMIN_AUTH_CONFIG.cookieName,
      storage: createJSONStorage(() => cookieOnlyStorage),
      // 排除 _hasHydrated，不持久化
      partialize: (state) => ({
        admin: state.admin,
        adminToken: state.adminToken,
        isAuthenticated: state.isAuthenticated,
        lastActivityAt: state.lastActivityAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
