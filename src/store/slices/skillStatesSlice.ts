import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';

export type SkillState = {
  eloRating: number;
  attempts: number;
  correct: number;
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
    set((state) => ({
      skillStates: {
        ...state.skillStates,
        [skillId]: {
          ...state.skillStates[skillId],
          ...update,
        },
      },
    })),
  resetSkillStates: () => set({ skillStates: {} }),
});
