import type { AppState } from '../appStore';
import type { SkillState } from '../slices/skillStatesSlice';
import type { MisconceptionRecord } from '../slices/misconceptionSlice';
import type { EarnedBadge } from '../slices/achievementSlice';
import type { AllAvatarId, FrameId } from '../constants/avatars';
import type { ThemeId } from '@/theme/colors';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';
import type { ChallengeCompletion } from '@/services/challenge/challengeTypes';

/**
 * Per-child data snapshot — all fields that belong to a single child profile.
 *
 * childName/childAge/childGrade are NON-nullable here because new profiles
 * always have values. The existing slice keeps them nullable for backward compat.
 */
export interface ChildData {
  childName: string;
  childAge: number;
  childGrade: number;
  avatarId: AllAvatarId | null;
  frameId: FrameId | null;
  themeId: ThemeId;
  tutorConsentGranted: boolean;
  skillStates: Record<string, SkillState>;
  xp: number;
  level: number;
  weeklyStreak: number;
  lastSessionDate: string | null;
  exploredManipulatives: ManipulativeType[];
  misconceptions: Record<string, MisconceptionRecord>;
  earnedBadges: Record<string, EarnedBadge>;
  sessionsCompleted: number;
  challengeCompletions: Record<string, ChallengeCompletion>;
  challengesCompleted: number;
}

/**
 * Profile creation input — the minimal info needed to create a new child.
 */
export type NewChildProfile = {
  childName: string;
  childAge: number;
  childGrade: number;
  avatarId: AllAvatarId | null;
};

/**
 * Single source of truth for per-child field names.
 * Used by migration, dehydrate, partialize, and profile switching.
 */
export const CHILD_DATA_KEYS: readonly (keyof ChildData)[] = [
  'childName',
  'childAge',
  'childGrade',
  'avatarId',
  'frameId',
  'themeId',
  'tutorConsentGranted',
  'skillStates',
  'xp',
  'level',
  'weeklyStreak',
  'lastSessionDate',
  'exploredManipulatives',
  'misconceptions',
  'earnedBadges',
  'sessionsCompleted',
  'challengeCompletions',
  'challengesCompleted',
] as const;

/** Default values for a brand-new child profile (before grade initialization). */
export const DEFAULT_CHILD_DATA: ChildData = {
  childName: '',
  childAge: 0,
  childGrade: 0,
  avatarId: null,
  frameId: null,
  themeId: 'dark',
  tutorConsentGranted: false,
  skillStates: {},
  xp: 0,
  level: 1,
  weeklyStreak: 0,
  lastSessionDate: null,
  exploredManipulatives: [],
  misconceptions: {},
  earnedBadges: {},
  sessionsCompleted: 0,
  challengeCompletions: {},
  challengesCompleted: 0,
};

/**
 * Extract all per-child fields from flat AppState into a ChildData snapshot.
 */
export function dehydrateChild(state: AppState): ChildData {
  const result = {} as Record<string, unknown>;
  for (const key of CHILD_DATA_KEYS) {
    result[key] = state[key];
  }
  return result as ChildData;
}

/**
 * Create a partial state update from ChildData that can be spread onto AppState.
 */
export function hydrateChild(data: ChildData): Partial<AppState> {
  const result = {} as Record<string, unknown>;
  for (const key of CHILD_DATA_KEYS) {
    result[key] = data[key];
  }
  return result as Partial<AppState>;
}

/**
 * Create a default ChildData for a new profile, merging profile info with defaults.
 * Pass skillStates to pre-seed grade-appropriate skills (from profileInitService).
 */
export function createDefaultChildData(profile: {
  childName: string;
  childAge: number;
  childGrade: number;
  avatarId: AllAvatarId | null;
  skillStates?: Record<string, SkillState>;
}): ChildData {
  return {
    ...DEFAULT_CHILD_DATA,
    childName: profile.childName,
    childAge: profile.childAge,
    childGrade: profile.childGrade,
    avatarId: profile.avatarId,
    skillStates: profile.skillStates ?? {},
  };
}
