import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';

export interface SandboxSlice {
  exploredManipulatives: ManipulativeType[];
  markExplored: (type: ManipulativeType) => void;
}

export const createSandboxSlice: StateCreator<
  AppState,
  [],
  [],
  SandboxSlice
> = (set) => ({
  exploredManipulatives: [],
  markExplored: (type) =>
    set((state) => {
      if (state.exploredManipulatives.includes(type)) {
        return state;
      }
      return {
        exploredManipulatives: [...state.exploredManipulatives, type],
      };
    }),
});
