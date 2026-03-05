import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';

/** Persisted record of a single earned badge */
export interface EarnedBadge {
  readonly earnedAt: string; // ISO timestamp
}

export interface AchievementSlice {
  /** Badge IDs mapped to earn timestamps — persisted via partialize */
  earnedBadges: Record<string, EarnedBadge>;
  /** Adds newly earned badges; skips any already in earnedBadges (idempotent) */
  addEarnedBadges: (badgeIds: string[]) => void;
}

export const createAchievementSlice: StateCreator<
  AppState,
  [],
  [],
  AchievementSlice
> = (set) => ({
  earnedBadges: {},

  addEarnedBadges: (badgeIds) =>
    set((state) => {
      const newIds = badgeIds.filter((id) => !(id in state.earnedBadges));
      if (newIds.length === 0) return state;

      const now = new Date().toISOString();
      const additions: Record<string, EarnedBadge> = {};
      for (const id of newIds) {
        additions[id] = { earnedAt: now };
      }

      return {
        earnedBadges: {
          ...state.earnedBadges,
          ...additions,
        },
      };
    }),
});
