import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Plan {
  id: string;
  title: string;
  startDate: string;
  active: boolean;
  type: 'diagnosis' | 'pain';
  details: string;
  painLevel: number;
}

export interface UserProfile {
  name: string;
  age: string;
  weight: string;
  height: string;
}

interface AppState {
  profile: UserProfile | null;
  plans: Plan[];
  setProfile: (profile: UserProfile) => void;
  addPlan: (plan: Plan) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      plans: [],
      setProfile: (profile) => set({ profile }),
      addPlan: (plan) => set((state) => ({ 
        plans: [...state.plans, plan] 
      })),
    }),
    {
      name: 'myphyspal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
