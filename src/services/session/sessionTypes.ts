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

/** Default session: 2 warmup + 8 practice + 2 cooldown = 12 total */
export const DEFAULT_SESSION_CONFIG: Readonly<SessionConfig> = {
  warmupCount: 2,
  practiceCount: 8,
  cooldownCount: 2,
};

/**
 * Compute session config scaled by average Elo.
 *
 * Beginners (Elo ~1000) get shorter sessions (10 problems).
 * Advancing students (Elo ~1200+) get the full 15.
 *
 * warmup/cooldown: 1-3
 * practice: 6-9
 * total: 8-15
 */
export function getAdaptiveSessionConfig(
  skillStates: Record<string, { eloRating: number }>,
): SessionConfig {
  const elos = Object.values(skillStates).map((s) => s.eloRating);
  const avgElo = elos.length > 0
    ? elos.reduce((sum, e) => sum + e, 0) / elos.length
    : 1000;

  // Map Elo 900-1300 to a 0-1 progress scale, clamped
  const progress = Math.min(1, Math.max(0, (avgElo - 900) / 400));

  // warmup/cooldown: 1 at low Elo, 3 at high Elo
  const bookend = Math.round(1 + progress * 2) as 1 | 2 | 3;
  // practice: 6 at low Elo, 9 at high Elo
  const practice = Math.round(6 + progress * 3);

  return { warmupCount: bookend, practiceCount: practice, cooldownCount: bookend };
}

/** Session mode: standard practice, focused remediation, or daily challenge */
export type SessionMode = 'standard' | 'remediation' | 'challenge';

/** Remediation session: 5 practice problems only, no warmup/cooldown */
export const REMEDIATION_SESSION_CONFIG: Readonly<SessionConfig> = {
  warmupCount: 0,
  practiceCount: 5,
  cooldownCount: 0,
};

/** Challenge session: 10 practice problems, no warmup/cooldown */
export const CHALLENGE_SESSION_CONFIG: Readonly<SessionConfig> = {
  warmupCount: 0,
  practiceCount: 10,
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
  /** Total badges earned this session (newBadges may be capped for display) */
  totalNewBadges: number;
  /** Challenge-specific result fields */
  isChallenge?: boolean;
  challengeBonusXp?: number;
  accuracyGoalMet?: boolean;
  streakGoalMet?: boolean;
}
