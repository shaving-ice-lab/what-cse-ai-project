import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";

interface Admin {
  id: number;
  username: string;
  role: string;
}

interface AuthState {
  admin: Admin | null;
  adminToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAdmin: (admin: Admin, token: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

// Cookie 操作工具函数
const setCookie = (name: string, value: string, days: number = 7) => {
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
    setCookie(name, value, 7); // 7 天有效期
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
    (set) => ({
      admin: DEV_SKIP_AUTH ? DEV_DEFAULT_ADMIN : null,
      adminToken: DEV_SKIP_AUTH ? "dev-token" : null,
      isAuthenticated: DEV_SKIP_AUTH ? true : false,
      _hasHydrated: false,

      setAdmin: (admin, token) =>
        set({
          admin,
          adminToken: token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          admin: DEV_SKIP_AUTH ? DEV_DEFAULT_ADMIN : null,
          adminToken: DEV_SKIP_AUTH ? "dev-token" : null,
          isAuthenticated: DEV_SKIP_AUTH ? true : false,
        }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "admin-auth-storage",
      storage: createJSONStorage(() => cookieOnlyStorage),
      // 排除 _hasHydrated，不持久化
      partialize: (state) => ({
        admin: state.admin,
        adminToken: state.adminToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
