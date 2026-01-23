import { create } from "zustand";
import { persist } from "zustand/middleware";

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      adminToken: null,
      isAuthenticated: false,

      setAdmin: (admin, token) =>
        set({
          admin,
          adminToken: token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          admin: null,
          adminToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "admin-auth-storage",
    }
  )
);
