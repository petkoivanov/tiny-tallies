/** Leitner box number (1-6). Determines review interval spacing. */
export type LeitnerBox = 1 | 2 | 3 | 4 | 5 | 6;

/** Result of a Leitner box transition after answering a problem */
export interface LeitnerTransitionResult {
  /** New box after transition */
  newBox: LeitnerBox;
  /** ISO date string for next scheduled review */
  nextReviewDue: string;
  /** Consecutive correct answers while in Box 6 */
  consecutiveCorrectInBox6: number;
  /** Whether the skill has graduated (3 consecutive correct in Box 6) */
  graduated: boolean;
}

/** Review status for queue sorting and scheduling decisions */
export interface LeitnerReviewStatus {
  /** Whether the skill is currently due for review */
  isDue: boolean;
  /** Milliseconds overdue (0 if not yet due) */
  overdueByMs: number;
}
