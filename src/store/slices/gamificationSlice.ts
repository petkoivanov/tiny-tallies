import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';

export interface GamificationSlice {
  xp: number;
  level: number;
  weeklyStreak: number;
  lastSessionDate: string | null;
  addXp: (amount: number) => void;
  setLevel: (level: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

export const createGamificationSlice: StateCreator<
  AppState,
  [],
  [],
  GamificationSlice
> = (set) => ({
  xp: 0,
  level: 1,
  weeklyStreak: 0,
  lastSessionDate: null,
  addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
  setLevel: (level) => set({ level }),
  incrementStreak: () =>
    set((state) => ({ weeklyStreak: state.weeklyStreak + 1 })),
  resetStreak: () => set({ weeklyStreak: 0 }),
});
