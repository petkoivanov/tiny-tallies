import {
  RATE_LIMITS,
  checkRateLimit,
  getRateLimitMessage,
} from '../rateLimiter';
import type { RateState } from '../rateLimiter';

function makeState(overrides: Partial<RateState> = {}): RateState {
  return {
    problemCallCount: 0,
    sessionCallCount: 0,
    dailyCallCount: 0,
    ...overrides,
  };
}

describe('RATE_LIMITS', () => {
  it('has expected limit values', () => {
    expect(RATE_LIMITS.perProblem).toBe(3);
    expect(RATE_LIMITS.perSession).toBe(20);
    expect(RATE_LIMITS.perDay).toBe(50);
  });
});

describe('checkRateLimit', () => {
  it('returns null when all counts below limits', () => {
    expect(checkRateLimit(makeState())).toBeNull();
  });

  it('returns "problem" when problemCallCount >= 3', () => {
    expect(checkRateLimit(makeState({ problemCallCount: 3 }))).toBe('problem');
    expect(checkRateLimit(makeState({ problemCallCount: 5 }))).toBe('problem');
  });

  it('returns "session" when sessionCallCount >= 20', () => {
    expect(checkRateLimit(makeState({ sessionCallCount: 20 }))).toBe(
      'session',
    );
    expect(checkRateLimit(makeState({ sessionCallCount: 25 }))).toBe(
      'session',
    );
  });

  it('returns "daily" when dailyCallCount >= 50', () => {
    expect(checkRateLimit(makeState({ dailyCallCount: 50 }))).toBe('daily');
    expect(checkRateLimit(makeState({ dailyCallCount: 100 }))).toBe('daily');
  });

  it('prioritizes problem > session > daily', () => {
    // All limits exceeded — problem should win
    expect(
      checkRateLimit(
        makeState({
          problemCallCount: 3,
          sessionCallCount: 20,
          dailyCallCount: 50,
        }),
      ),
    ).toBe('problem');

    // session and daily exceeded — session should win
    expect(
      checkRateLimit(
        makeState({
          problemCallCount: 1,
          sessionCallCount: 20,
          dailyCallCount: 50,
        }),
      ),
    ).toBe('session');
  });
});

describe('getRateLimitMessage', () => {
  it('returns non-empty encouraging string for "problem"', () => {
    const msg = getRateLimitMessage('problem');
    expect(msg.length).toBeGreaterThan(0);
    expect(typeof msg).toBe('string');
  });

  it('returns non-empty encouraging string for "session"', () => {
    const msg = getRateLimitMessage('session');
    expect(msg.length).toBeGreaterThan(0);
    expect(typeof msg).toBe('string');
  });

  it('returns non-empty encouraging string for "daily"', () => {
    const msg = getRateLimitMessage('daily');
    expect(msg.length).toBeGreaterThan(0);
    expect(typeof msg).toBe('string');
  });

  it('returns empty string for null', () => {
    expect(getRateLimitMessage(null)).toBe('');
  });
});
