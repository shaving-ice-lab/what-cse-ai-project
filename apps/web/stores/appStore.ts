import { create } from "zustand";

interface AppState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark";
  loading: boolean;
  globalError: string | null;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  setLoading: (loading: boolean) => void;
  setGlobalError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  theme: "light",
  loading: false,
  globalError: null,

  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },

  setTheme: (theme) => {
    set({ theme });
    document.documentElement.classList.toggle("dark", theme === "dark");
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setGlobalError: (error) => {
    set({ globalError: error });
  },

  clearError: () => {
    set({ globalError: null });
  },
}));
