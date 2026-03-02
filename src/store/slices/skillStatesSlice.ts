import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';
import { DEFAULT_ELO } from '../helpers/skillStateHelpers';

export type SkillState = {
  eloRating: number;
  attempts: number;
  correct: number;
  lastPracticed?: string;
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
