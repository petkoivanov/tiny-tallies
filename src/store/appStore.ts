import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
import {
  type SandboxSlice,
  createSandboxSlice,
} from './slices/sandboxSlice';
import {
  type TutorSlice,
  createTutorSlice,
} from './slices/tutorSlice';
import {
  type MisconceptionSlice,
  createMisconceptionSlice,
} from './slices/misconceptionSlice';
import {
  type AchievementSlice,
  createAchievementSlice,
} from './slices/achievementSlice';
import {
  type ChallengeSlice,
  createChallengeSlice,
} from './slices/challengeSlice';
import { migrateStore } from './migrations';

export type AppState = ChildProfileSlice &
  SkillStatesSlice &
  SessionStateSlice &
  GamificationSlice &
  SandboxSlice &
  TutorSlice &
  MisconceptionSlice &
  AchievementSlice &
  ChallengeSlice;

/**
 * Increment + add migration function when changing schema shape.
 * See CLAUDE.md guardrail: never bump version without a corresponding migration.
 */
export const STORE_VERSION = 12;

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createChildProfileSlice(...a),
      ...createSkillStatesSlice(...a),
      ...createSessionStateSlice(...a),
      ...createGamificationSlice(...a),
      ...createSandboxSlice(...a),
      ...createTutorSlice(...a),
      ...createMisconceptionSlice(...a),
      ...createAchievementSlice(...a),
      ...createChallengeSlice(...a),
    }),
    {
      name: 'tiny-tallies-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: STORE_VERSION,
      migrate: migrateStore,
      partialize: (state) => ({
        childName: state.childName,
        childAge: state.childAge,
        childGrade: state.childGrade,
        avatarId: state.avatarId,
        frameId: state.frameId,
        themeId: state.themeId,
        tutorConsentGranted: state.tutorConsentGranted,
        skillStates: state.skillStates,
        xp: state.xp,
        level: state.level,
        weeklyStreak: state.weeklyStreak,
        lastSessionDate: state.lastSessionDate,
        exploredManipulatives: state.exploredManipulatives,
        misconceptions: state.misconceptions,
        earnedBadges: state.earnedBadges,
        sessionsCompleted: state.sessionsCompleted,
        challengeCompletions: state.challengeCompletions,
        challengesCompleted: state.challengesCompleted,
      }),
    },
  ),
);
