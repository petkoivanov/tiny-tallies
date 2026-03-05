import type { Problem } from '../mathEngine/types';
import type { MultipleChoicePresentation } from '../mathEngine/answerFormats/types';
import type { CpaStage } from '../cpa/cpaTypes';

/** Phase of a session, derived from problem index */
export type SessionPhase = 'warmup' | 'practice' | 'cooldown' | 'complete';

/** Configuration for session problem counts per phase */
export interface SessionConfig {
  readonly warmupCount: number;
  readonly practiceCount: number;
  readonly cooldownCount: number;
}

/** Default session: 3 warmup + 9 practice + 3 cooldown = 15 total */
export const DEFAULT_SESSION_CONFIG: Readonly<SessionConfig> = {
  warmupCount: 3,
  practiceCount: 9,
  cooldownCount: 3,
};

/** Session mode: standard practice or focused remediation */
export type SessionMode = 'standard' | 'remediation';

/** Remediation session: 5 practice problems only, no warmup/cooldown */
export const REMEDIATION_SESSION_CONFIG: Readonly<SessionConfig> = {
  warmupCount: 0,
  practiceCount: 5,
  cooldownCount: 0,
};

/** A single problem in the session queue with phase and presentation metadata */
export interface SessionProblem {
  readonly problem: Problem;
  readonly presentation: MultipleChoicePresentation;
  readonly phase: SessionPhase;
  readonly skillId: string;
  readonly templateBaseElo: number;
}

/** Accumulated Elo update for a single skill during a session */
export interface PendingSkillUpdate {
  skillId: string;
  newElo: number;
  attempts: number;
  correct: number;
  /** BKT mastery probability after soft lock logic */
  newMasteryPL: number;
  /** Consecutive wrong answer count (for soft mastery lock) */
  newConsecutiveWrong: number;
  /** Whether mastery lock is active */
  newMasteryLocked: boolean;
  /** New Leitner box after session transitions */
  newLeitnerBox: 1 | 2 | 3 | 4 | 5 | 6;
  /** ISO date of next scheduled review */
  newNextReviewDue: string | null;
  /** Consecutive correct count in Box 6 */
  newConsecutiveCorrectInBox6: number;
  /** CPA stage after one-way advance logic */
  newCpaLevel: CpaStage;
}

/** Structured feedback returned from commitSessionResults for UI consumption */
export interface SessionFeedback {
  xpEarned: number;
  newLevel: number;
  previousLevel: number;
  leveledUp: boolean;
  levelsGained: number;
  streakCount: number;
  practicedThisWeek: boolean;
  /** CPA stage advances detected during the session (computed by useSession, not commitSessionResults) */
  cpaAdvances?: Array<{ skillId: string; from: CpaStage; to: CpaStage }>;
}

/** Category tag for practice problems in the 60/30/10 mix */
export type PracticeProblemCategory = 'review' | 'new' | 'challenge' | 'remediation';

/** Slot allocation for the practice portion of a session */
export interface PracticeSlotCounts {
  readonly review: number;
  readonly new: number;
  readonly challenge: number;
}

/** Final result of a completed session */
export interface SessionResult {
  score: number;
  total: number;
  xpEarned: number;
  durationMs: number;
  pendingUpdates: Map<string, PendingSkillUpdate>;
  feedback: SessionFeedback | null;
  newBadges: string[];
}
