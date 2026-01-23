import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserProfile {
  real_name: string;
  gender: string;
  education: string;
  degree: string;
  major: string;
  school: string;
  graduation_year: number;
  political_status: string;
  work_years: number;
  current_location: string;
  preferred_regions: string[];
  preferred_exam_types: string[];
}

interface UserState {
  profile: UserProfile | null;
  isProfileComplete: boolean;

  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
  checkProfileComplete: () => boolean;
}

const initialProfile: UserProfile = {
  real_name: "",
  gender: "",
  education: "",
  degree: "",
  major: "",
  school: "",
  graduation_year: 0,
  political_status: "",
  work_years: 0,
  current_location: "",
  preferred_regions: [],
  preferred_exam_types: [],
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isProfileComplete: false,

      setProfile: (profile) => {
        set({ profile, isProfileComplete: get().checkProfileComplete() });
      },

      updateProfile: (updates) => {
        const currentProfile = get().profile || initialProfile;
        const newProfile = { ...currentProfile, ...updates };
        set({ profile: newProfile, isProfileComplete: get().checkProfileComplete() });
      },

      clearProfile: () => {
        set({ profile: null, isProfileComplete: false });
      },

      checkProfileComplete: () => {
        const profile = get().profile;
        if (!profile) return false;
        return !!(profile.education && profile.major && profile.political_status);
      },
    }),
    {
      name: "user-profile-storage",
    }
  )
);
