import { create } from "zustand";

interface FilterState {
  examType: string;
  province: string;
  education: string;
  major: string;
  setFilter: (key: string, value: string) => void;
  resetFilters: () => void;
}

const initialFilters = {
  examType: "",
  province: "",
  education: "",
  major: "",
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialFilters,
  setFilter: (key, value) => set({ [key]: value }),
  resetFilters: () => set(initialFilters),
}));
