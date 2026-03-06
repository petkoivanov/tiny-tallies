/**
 * Navigation type definitions for Tiny Tallies.
 *
 * RootStackParamList is a type alias (required by React Navigation for param lists).
 * Global augmentation enables automatic typing for useNavigation/useRoute.
 */

import type { CpaStage, ManipulativeType } from '@/services/cpa/cpaTypes';
import type { SessionMode } from '@/services/session/sessionTypes';

export type RootStackParamList = {
  Home: undefined;
  Session: {
    sessionId: string;
    mode?: SessionMode;
    remediationSkillIds?: string[];
    challengeThemeId?: string;
  };
  Results: {
    sessionId: string;
    score: number;
    total: number;
    xpEarned: number;
    durationMs: number;
    leveledUp: boolean;
    newLevel: number;
    streakCount: number;
    cpaAdvances: Array<{ skillId: string; from: CpaStage; to: CpaStage }>;
    isRemediation?: boolean;
    newBadges?: string[];
    isChallenge?: boolean;
    challengeBonusXp?: number;
    accuracyGoalMet?: boolean;
    streakGoalMet?: boolean;
  };
  Sandbox: { manipulativeType: ManipulativeType };
  BadgeCollection: undefined;
  SkillMap: undefined;
  AvatarPicker: undefined;
  ThemePicker: undefined;
  Consent: { returnTo?: 'Session' } | undefined;
  ProfileSetup: undefined;
  ProfileManagement: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
