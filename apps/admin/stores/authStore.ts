import { create } from "zustand";
import { persist, StateStorage } from "zustand/middleware";

interface Admin {
  id: number;
  username: string;
  role: string;
}

interface AuthState {
  admin: Admin | null;
  adminToken: string | null;
  isAuthenticated: boolean;
  setAdmin: (admin: Admin, token: string) => void;
  logout: () => void;
}

// Custom storage that syncs to both localStorage and cookies
// This allows middleware (server-side) to read auth state from cookies
const cookieSyncStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    // Store in localStorage for client-side hydration
    localStorage.setItem(name, value);
    // Also store in cookie for middleware access (server-side)
    // Cookie expires in 7 days
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
    // Remove cookie by setting expired date
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
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
    }),
    {
      name: "admin-auth-storage",
      storage: cookieSyncStorage,
    }
  )
);
