export const RATE_LIMITS = {
  perProblem: 3,
  perSession: 20,
  perDay: 50,
} as const;

export interface RateState {
  problemCallCount: number;
  sessionCallCount: number;
  dailyCallCount: number;
}

export type RateLimitKind = 'problem' | 'session' | 'daily' | null;

/**
 * Checks rate limits in priority order: problem > session > daily.
 * Returns the most specific limit that is exceeded, or null if within limits.
 */
export function checkRateLimit(state: RateState): RateLimitKind {
  if (state.problemCallCount >= RATE_LIMITS.perProblem) return 'problem';
  if (state.sessionCallCount >= RATE_LIMITS.perSession) return 'session';
  if (state.dailyCallCount >= RATE_LIMITS.perDay) return 'daily';
  return null;
}

/**
 * Returns a child-friendly encouraging message for the given rate limit kind.
 */
export function getRateLimitMessage(kind: RateLimitKind): string {
  switch (kind) {
    case 'problem':
      return "You've had great hints on this one! Try your best -- you can do it!";
    case 'session':
      return "You've been working really hard today! Try solving the next few on your own -- I believe in you!";
    case 'daily':
      return "You've used all your hints for today. Come back tomorrow for more help!";
    default:
      return '';
  }
}
