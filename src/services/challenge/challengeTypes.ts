import type { Grade, Operation } from '../mathEngine/types';

export interface ChallengeTheme {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly skillFilter: {
    readonly operations?: readonly Operation[];
    readonly grades?: readonly Grade[];
  };
  readonly goals: {
    readonly accuracyTarget: number;
    readonly streakTarget: number;
  };
}

export interface ChallengeCompletion {
  readonly themeId: string;
  readonly score: number;
  readonly total: number;
  readonly accuracyGoalMet: boolean;
  readonly streakGoalMet: boolean;
  readonly bonusXpAwarded: number;
  readonly completedAt: string; // ISO timestamp
}

export const CHALLENGE_BONUS_XP = 50;
