import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';

export interface GamificationSlice {
  xp: number;
  level: number;
  weeklyStreak: number;
  lastSessionDate: string | null;
  sessionsCompleted: number;
  addXp: (amount: number) => void;
  setLevel: (level: number) => void;
  setLastSessionDate: (date: string) => void;
  setWeeklyStreak: (streak: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  incrementSessionsCompleted: () => void;
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
  sessionsCompleted: 0,
  addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
  setLevel: (level) => set({ level }),
  setLastSessionDate: (date) => set({ lastSessionDate: date }),
  setWeeklyStreak: (streak) => set({ weeklyStreak: streak }),
  incrementStreak: () =>
    set((state) => ({ weeklyStreak: state.weeklyStreak + 1 })),
  resetStreak: () => set({ weeklyStreak: 0 }),
  incrementSessionsCompleted: () =>
    set((state) => ({ sessionsCompleted: state.sessionsCompleted + 1 })),
});
