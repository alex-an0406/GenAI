import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, PlanData } from '../lib/api';

interface Plan extends PlanData {
  id: string;
  title: string;
  startDate: string;
  active: boolean;
}

interface AppState {
  profile: UserProfile | null;
  activePlan: Plan | null;
  plans: Plan[];
  setProfile: (profile: UserProfile) => void;
  setActivePlan: (plan: PlanData) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      activePlan: null,
      plans: [],
      setProfile: (profile) => set({ profile }),
      setActivePlan: (planData) => {
        const state = get();
        const newPlan: Plan = {
          ...planData,
          id: Math.random().toString(36).substring(7),
          title: (planData.exercises && planData.exercises[0]?.name) ? (planData.exercises[0].name + " Recovery") : "New Plan",
          startDate: new Date().toLocaleDateString(),
          active: true,
        };
        
        // Deactivate old plans
        const updatedPlans = state.plans.map(p => ({ ...p, active: false }));
        
        set({
          activePlan: newPlan,
          plans: [newPlan, ...updatedPlans],
        });
      },
    }),
    {
      name: 'myphyspal-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: (state) => {
        return (state, error) => {
          if (state && state.activePlan && state.plans.length === 0) {
            state.plans = [state.activePlan];
          }
        };
      }
    }
  )
);
