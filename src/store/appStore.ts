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
import {
  type ProfilesSlice,
  createProfilesSlice,
} from './slices/profilesSlice';
import {
  type AuthSlice,
  createAuthSlice,
} from './slices/authSlice';
import {
  type SessionHistorySlice,
  createSessionHistorySlice,
} from './slices/sessionHistorySlice';
import {
  type OnboardingSlice,
  createOnboardingSlice,
} from './slices/onboardingSlice';
import {
  type WrongAnswerHistorySlice,
  createWrongAnswerHistorySlice,
} from './slices/wrongAnswerHistorySlice';
import {
  type ReminderSlice,
  createReminderSlice,
} from './slices/reminderSlice';
import { migrateStore } from './migrations';
import { dehydrateChild, hydrateChild } from './helpers/childDataHelpers';

export type AppState = ChildProfileSlice &
  SkillStatesSlice &
  SessionStateSlice &
  GamificationSlice &
  SandboxSlice &
  TutorSlice &
  MisconceptionSlice &
  AchievementSlice &
  ChallengeSlice &
  ProfilesSlice &
  AuthSlice &
  SessionHistorySlice &
  OnboardingSlice &
  WrongAnswerHistorySlice &
  ReminderSlice;

/**
 * Increment + add migration function when changing schema shape.
 * See CLAUDE.md guardrail: never bump version without a corresponding migration.
 */
export const STORE_VERSION = 24;

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
      ...createProfilesSlice(...a),
      ...createAuthSlice(...a),
      ...createSessionHistorySlice(...a),
      ...createOnboardingSlice(...a),
      ...createWrongAnswerHistorySlice(...a),
      ...createReminderSlice(...a),
    }),
    {
      name: 'tiny-tallies-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: STORE_VERSION,
      migrate: migrateStore,
      partialize: (state) => ({
        children: state.activeChildId
          ? {
              ...state.children,
              [state.activeChildId]: dehydrateChild(state),
            }
          : state.children,
        activeChildId: state.activeChildId,
        _needsMigrationPrompt: state._needsMigrationPrompt,
        userId: state.userId,
        authProvider: state.authProvider,
        userEmail: state.userEmail,
        userDisplayName: state.userDisplayName,
        isSignedIn: state.isSignedIn,
        reminderEnabled: state.reminderEnabled,
        reminderTime: state.reminderTime,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.activeChildId && state.children[state.activeChildId]) {
          const childData = state.children[state.activeChildId];
          useAppStore.setState(hydrateChild(childData));
        }
      },
    },
  ),
);
