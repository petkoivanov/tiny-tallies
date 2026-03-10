import type { Grade, Operation } from '../mathEngine/types';

export type BadgeCategory = 'mastery' | 'behavior';

export type BadgeTier = 'bronze' | 'silver' | 'gold';

export type UnlockCondition =
  | { type: 'skill-mastery'; skillId: string }
  | { type: 'category-mastery'; operation: Operation }
  | { type: 'grade-mastery'; grade: Grade }
  | { type: 'streak-milestone'; weeklyStreakRequired: number }
  | { type: 'sessions-milestone'; sessionsRequired: number }
  | { type: 'remediation-victory'; resolvedCountRequired: number }
  | { type: 'challenges-completed'; challengesRequired: number }
  | { type: 'perfect-challenge' }
  | { type: 'first-session' }
  | { type: 'session-score'; correctRequired: number }
  | { type: 'perfect-session' }
  | { type: 'skills-practiced'; skillCount: number };

export interface BadgeDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: BadgeCategory;
  readonly tier: BadgeTier;
  readonly condition: UnlockCondition;
}

export interface BadgeEvaluationSnapshot {
  skillStates: Record<string, { masteryLocked: boolean }>;
  weeklyStreak: number;
  sessionsCompleted: number;
  misconceptions: Record<string, { status: string }>;
  challengesCompleted: number;
  lastChallengeScore?: { score: number; total: number };
  /** Child's grade level — skills below this grade are pre-mastered and ineligible for badges */
  childGrade: number;
  /** Score from the session that just completed (for early-win badges) */
  lastSessionScore?: { correct: number; total: number; skillsPracticed: number };
}
