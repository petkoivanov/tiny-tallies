import type {
  LeitnerBox,
  LeitnerTransitionResult,
  LeitnerReviewStatus,
} from './leitnerTypes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

/**
 * Age-adjusted review intervals (in milliseconds) per Leitner box.
 *
 * Index 0 = Box 1, index 5 = Box 6.
 * "default" maps to the "7-8" bracket (research defaults).
 * Ages 10-18 use longer intervals based on spacing-effect research.
 */
export const LEITNER_INTERVALS: Record<string, readonly number[]> = {
  '6-7': [
    0,                  // Box 1: same session
    2 * ONE_HOUR_MS,    // Box 2: 2 hours
    1 * ONE_DAY_MS,     // Box 3: 1 day
    3 * ONE_DAY_MS,     // Box 4: 3 days
    7 * ONE_DAY_MS,     // Box 5: 7 days
    14 * ONE_DAY_MS,    // Box 6: 14 days
  ],
  '7-8': [
    0,                  // Box 1: same session
    1 * ONE_DAY_MS,     // Box 2: next day
    2 * ONE_DAY_MS,     // Box 3: 2 days
    5 * ONE_DAY_MS,     // Box 4: 5 days
    10 * ONE_DAY_MS,    // Box 5: 10 days
    21 * ONE_DAY_MS,    // Box 6: 21 days
  ],
  '8-9': [
    0,                  // Box 1: same session
    1 * ONE_DAY_MS,     // Box 2: next day
    3 * ONE_DAY_MS,     // Box 3: 3 days
    7 * ONE_DAY_MS,     // Box 4: 7 days
    14 * ONE_DAY_MS,    // Box 5: 14 days
    30 * ONE_DAY_MS,    // Box 6: 30 days
  ],
  // Ages 10-11: ~20% longer than 8-9 bracket (spacing effect research)
  '10-11': [
    0,                  // Box 1: same session
    1 * ONE_DAY_MS,     // Box 2: next day
    4 * ONE_DAY_MS,     // Box 3: 4 days
    8 * ONE_DAY_MS,     // Box 4: 8 days
    17 * ONE_DAY_MS,    // Box 5: 17 days
    36 * ONE_DAY_MS,    // Box 6: 36 days
  ],
  // Ages 12-13: ~35% longer than 8-9 bracket
  '12-13': [
    0,                  // Box 1: same session
    1 * ONE_DAY_MS,     // Box 2: next day
    4 * ONE_DAY_MS,     // Box 3: 4 days
    9 * ONE_DAY_MS,     // Box 4: 9 days
    19 * ONE_DAY_MS,    // Box 5: 19 days
    41 * ONE_DAY_MS,    // Box 6: 41 days
  ],
  // Ages 14-18: longest retention window, Box 6 = 45 days
  '14-18': [
    0,                  // Box 1: same session
    1 * ONE_DAY_MS,     // Box 2: next day
    5 * ONE_DAY_MS,     // Box 3: 5 days
    10 * ONE_DAY_MS,    // Box 4: 10 days
    21 * ONE_DAY_MS,    // Box 5: 21 days
    45 * ONE_DAY_MS,    // Box 6: 45 days
  ],
  default: [
    0,                  // Box 1: same session
    1 * ONE_DAY_MS,     // Box 2: next day
    2 * ONE_DAY_MS,     // Box 3: 2 days
    5 * ONE_DAY_MS,     // Box 4: 5 days
    10 * ONE_DAY_MS,    // Box 5: 10 days
    21 * ONE_DAY_MS,    // Box 6: 21 days
  ],
};

/** Review interval for graduated skills (Box 6 with 3+ consecutive correct): 30 days. */
export const GRADUATED_REVIEW_INTERVAL_MS = 30 * ONE_DAY_MS;

// ---------------------------------------------------------------------------
// Age bracket mapping
// ---------------------------------------------------------------------------

/**
 * Maps a child's age to the interval bracket key.
 *
 * @param childAge - Integer age (6-18), or null for default bracket
 * @returns Bracket key for LEITNER_INTERVALS lookup
 */
export function getAgeIntervalBracket(childAge: number | null): string {
  if (childAge === null) return 'default';
  if (childAge <= 7) return '6-7';
  if (childAge === 8) return '7-8';
  if (childAge === 9) return '8-9';
  if (childAge >= 14) return '14-18';
  if (childAge >= 12) return '12-13';
  if (childAge >= 10) return '10-11';
  return '8-9';
}

// ---------------------------------------------------------------------------
// Interval calculation
// ---------------------------------------------------------------------------

/**
 * Returns the review interval in milliseconds for a given box and age.
 *
 * @param box - Current Leitner box (1-6)
 * @param childAge - Integer age (6-9), or null for default
 */
export function getIntervalMs(box: LeitnerBox, childAge: number | null): number {
  const bracket = getAgeIntervalBracket(childAge);
  return LEITNER_INTERVALS[bracket][box - 1];
}

/**
 * Computes the ISO date string for when a skill's next review is due.
 *
 * @param box - Target Leitner box after transition
 * @param childAge - Integer age (6-9), or null for default
 * @param now - Current timestamp (defaults to new Date())
 * @returns ISO 8601 date string
 */
export function computeNextReviewDue(
  box: LeitnerBox,
  childAge: number | null,
  now: Date = new Date(),
): string {
  const intervalMs = getIntervalMs(box, childAge);
  return new Date(now.getTime() + intervalMs).toISOString();
}

// ---------------------------------------------------------------------------
// Box transition
// ---------------------------------------------------------------------------

/**
 * Core Leitner box transition logic.
 *
 * - Correct: move up 1 box (max Box 6)
 * - Wrong: drop 2 boxes (min Box 1)
 * - Box 6 graduation: 3 consecutive correct in Box 6 -> graduated with monthly review
 *
 * @param currentBox - Current Leitner box (1-6)
 * @param isCorrect - Whether the answer was correct
 * @param consecutiveCorrectInBox6 - Current count of consecutive correct in Box 6
 * @param childAge - Integer age (6-9), or null for default
 * @param now - Current timestamp (defaults to new Date())
 */
export function transitionBox(
  currentBox: LeitnerBox,
  isCorrect: boolean,
  consecutiveCorrectInBox6: number,
  childAge: number | null,
  now: Date = new Date(),
): LeitnerTransitionResult {
  let newBox: LeitnerBox;
  let newConsecutiveCorrectInBox6: number;

  if (isCorrect) {
    newBox = Math.min(currentBox + 1, 6) as LeitnerBox;

    // Track consecutive correct in Box 6: only increment when ALREADY in Box 6
    if (currentBox === 6) {
      newConsecutiveCorrectInBox6 = consecutiveCorrectInBox6 + 1;
    } else {
      newConsecutiveCorrectInBox6 = 0;
    }
  } else {
    newBox = Math.max(currentBox - 2, 1) as LeitnerBox;
    newConsecutiveCorrectInBox6 = 0;
  }

  const graduated = newBox === 6 && newConsecutiveCorrectInBox6 >= 3;

  const nextReviewDue = graduated
    ? new Date(now.getTime() + GRADUATED_REVIEW_INTERVAL_MS).toISOString()
    : computeNextReviewDue(newBox, childAge, now);

  return {
    newBox,
    nextReviewDue,
    consecutiveCorrectInBox6: newConsecutiveCorrectInBox6,
    graduated,
  };
}

// ---------------------------------------------------------------------------
// Review status
// ---------------------------------------------------------------------------

/**
 * Determines whether a skill is due for review and how overdue it is.
 *
 * @param nextReviewDue - ISO date string of next review, or null (immediately due)
 * @param now - Current timestamp (defaults to new Date())
 */
export function getReviewStatus(
  nextReviewDue: string | null,
  now: Date = new Date(),
): LeitnerReviewStatus {
  if (nextReviewDue === null) {
    return { isDue: true, overdueByMs: 0 };
  }

  const dueDate = new Date(nextReviewDue);
  const diff = now.getTime() - dueDate.getTime();

  return {
    isDue: diff >= 0,
    overdueByMs: Math.max(0, diff),
  };
}

// ---------------------------------------------------------------------------
// BKT-informed initial placement
// ---------------------------------------------------------------------------

/**
 * Maps a BKT mastery probability P(L) to an initial Leitner box for migration.
 *
 * Higher mastery -> higher box, so existing users don't start over at Box 1.
 *
 * @param masteryProbability - Current P(L) from BKT (0-1)
 * @returns Initial LeitnerBox (1-6)
 */
export function mapPLToInitialBox(masteryProbability: number): LeitnerBox {
  if (masteryProbability < 0.20) return 1;
  if (masteryProbability < 0.40) return 2;
  if (masteryProbability < 0.60) return 3;
  if (masteryProbability < 0.80) return 4;
  if (masteryProbability < 0.95) return 5;
  return 6;
}
