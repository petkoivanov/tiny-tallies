import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';
import { DEFAULT_ELO } from '../helpers/skillStateHelpers';

export type SkillState = {
  eloRating: number;
  attempts: number;
  correct: number;
  lastPracticed?: string;
  /** BKT mastery probability P(L). Default 0.1 (prior knowledge). */
  masteryProbability: number;
  /** Count of consecutive wrong answers (for soft mastery lock). Resets on correct. */
  consecutiveWrong: number;
  /** Whether this skill has achieved mastery (P(L) >= 0.95). Soft-locked: requires 3+ consecutive wrong to revert. */
  masteryLocked: boolean;
  /** Leitner box number (1-6). Determines review interval. */
  leitnerBox: 1 | 2 | 3 | 4 | 5 | 6;
  /** ISO date string of when this skill is next due for review. null = immediately due. */
  nextReviewDue: string | null;
  /** Count of consecutive correct answers while in Box 6. Resets on wrong or box change. */
  consecutiveCorrectInBox6: number;
};

export interface SkillStatesSlice {
  skillStates: Record<string, SkillState>;
  updateSkillState: (skillId: string, update: Partial<SkillState>) => void;
  resetSkillStates: () => void;
}

export const createSkillStatesSlice: StateCreator<
  AppState,
  [],
  [],
  SkillStatesSlice
> = (set) => ({
  skillStates: {},
  updateSkillState: (skillId, update) =>
    set((state) => {
      const current = state.skillStates[skillId] ?? {
        eloRating: DEFAULT_ELO,
        attempts: 0,
        correct: 0,
        masteryProbability: 0.1,
        consecutiveWrong: 0,
        masteryLocked: false,
        leitnerBox: 1 as const,
        nextReviewDue: null,
        consecutiveCorrectInBox6: 0,
      };
      return {
        skillStates: {
          ...state.skillStates,
          [skillId]: {
            ...current,
            ...update,
          },
        },
      };
    }),
  resetSkillStates: () => set({ skillStates: {} }),
});
