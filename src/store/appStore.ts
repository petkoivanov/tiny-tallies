import { create } from 'zustand';

import {
  type ChildProfileSlice,
  createChildProfileSlice,
} from './slices/childProfileSlice';
import {
  type SkillStatesSlice,
  createSkillStatesSlice,
} from './slices/skillStatesSlice';
import {
  type SessionStateSlice,
  createSessionStateSlice,
} from './slices/sessionStateSlice';
import {
  type GamificationSlice,
  createGamificationSlice,
} from './slices/gamificationSlice';

export type AppState = ChildProfileSlice &
  SkillStatesSlice &
  SessionStateSlice &
  GamificationSlice;

/**
 * Increment + add migration function when changing schema shape.
 * See CLAUDE.md guardrail: never bump version without a corresponding migration.
 */
export const STORE_VERSION = 1;

export const useAppStore = create<AppState>()((...a) => ({
  ...createChildProfileSlice(...a),
  ...createSkillStatesSlice(...a),
  ...createSessionStateSlice(...a),
  ...createGamificationSlice(...a),
}));
