import type { AppState } from '../appStore';
import type { SkillState } from '../slices/skillStatesSlice';
import type { MisconceptionRecord } from '../slices/misconceptionSlice';
import type { EarnedBadge } from '../slices/achievementSlice';
import type { AllAvatarId, FrameId } from '../constants/avatars';
import type { ThemeId } from '@/theme/colors';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';
import type { ChallengeCompletion } from '@/services/challenge/challengeTypes';
import type { SessionHistoryEntry } from '../slices/sessionHistorySlice';
import type { AgeRange, BedtimeWindow, StateCode } from '../slices/childProfileSlice';

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
  soundEnabled: boolean;
  dailyLimitMinutes: number;
  bedtimeWindow: BedtimeWindow | null;
  breakReminderMinutes: number;
  ageRange: AgeRange;
  stateCode: StateCode;
  benchmarkOptIn: boolean;
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
  sessionHistory: SessionHistoryEntry[];
  placementComplete: boolean;
  placementGrade: number | null;
  placementTheta: number | null;
  lastPlacementDate: string | null;
  lastPracticeDate: string | null;
}

/**
 * Profile creation input — the minimal info needed to create a new child.
 */
export type NewChildProfile = {
  childName: string;
  childAge: number;
  childGrade: number;
  avatarId: AllAvatarId | null;
  stateCode?: StateCode;
};

/** Derive anonymous age range bucket from exact age (for peer benchmarking). */
export function ageToAgeRange(age: number): AgeRange {
  if (age <= 6) return '6-7';
  if (age <= 7) return '7-8';
  if (age <= 8) return '8-9';
  return '8-9';
}

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
  'soundEnabled',
  'dailyLimitMinutes',
  'bedtimeWindow',
  'breakReminderMinutes',
  'ageRange',
  'stateCode',
  'benchmarkOptIn',
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
  'sessionHistory',
  'placementComplete',
  'placementGrade',
  'placementTheta',
  'lastPlacementDate',
  'lastPracticeDate',
] as const;

/** Default values for a brand-new child profile (before grade initialization). */
export const DEFAULT_CHILD_DATA: ChildData = {
  childName: '',
  childAge: 0,
  childGrade: 0,
  avatarId: null,
  frameId: null,
  themeId: 'dark',
  tutorConsentGranted: true,
  soundEnabled: true,
  dailyLimitMinutes: 0,
  bedtimeWindow: null,
  breakReminderMinutes: 0,
  ageRange: null,
  stateCode: null,
  benchmarkOptIn: true,
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
  sessionHistory: [],
  placementComplete: false,
  placementGrade: null,
  placementTheta: null,
  lastPlacementDate: null,
  lastPracticeDate: null,
};

/**
 * Extract all per-child fields from flat AppState into a ChildData snapshot.
 */
export function dehydrateChild(state: AppState): ChildData {
  const result: Partial<ChildData> = {};
  for (const key of CHILD_DATA_KEYS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result as any)[key] = state[key];
  }
  return result as ChildData;
}

/**
 * Create a partial state update from ChildData that can be spread onto AppState.
 */
export function hydrateChild(data: ChildData): Partial<AppState> {
  const result: Partial<AppState> = {};
  for (const key of CHILD_DATA_KEYS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result as any)[key] = data[key];
  }
  return result;
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
  stateCode?: StateCode;
  skillStates?: Record<string, SkillState>;
}): ChildData {
  return {
    ...DEFAULT_CHILD_DATA,
    childName: profile.childName,
    childAge: profile.childAge,
    childGrade: profile.childGrade,
    avatarId: profile.avatarId,
    ageRange: ageToAgeRange(profile.childAge),
    stateCode: profile.stateCode ?? null,
    skillStates: profile.skillStates ?? {},
  };
}
