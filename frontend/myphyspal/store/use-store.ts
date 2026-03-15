import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, PlanData } from '../lib/api';

interface AppState {
  profile: UserProfile | null;
  activePlan: PlanData | null;
  planId: string | null;
  setProfile: (profile: UserProfile) => void;
  setActivePlan: (plan: PlanData) => void;
  setPlanId: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      activePlan: null,
      planId: null,
      setProfile: (profile) => set({ profile }),
      setActivePlan: (plan) => set({ activePlan: plan }),
      setPlanId: (id) => set({ planId: id }),
    }),
    {
      name: 'myphyspal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
