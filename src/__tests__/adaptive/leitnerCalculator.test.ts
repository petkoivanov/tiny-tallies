import {
  LEITNER_INTERVALS,
  GRADUATED_REVIEW_INTERVAL_MS,
  getAgeIntervalBracket,
  getIntervalMs,
  computeNextReviewDue,
  transitionBox,
  getReviewStatus,
  mapPLToInitialBox,
} from '@/services/adaptive/leitnerCalculator';
import type { LeitnerBox } from '@/services/adaptive/leitnerTypes';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

describe('LEITNER_INTERVALS constant', () => {
  it('has entries for all age brackets and default', () => {
    expect(LEITNER_INTERVALS).toHaveProperty('6-7');
    expect(LEITNER_INTERVALS).toHaveProperty('7-8');
    expect(LEITNER_INTERVALS).toHaveProperty('8-9');
    expect(LEITNER_INTERVALS).toHaveProperty('default');
  });

  it('has entries for HS extension brackets', () => {
    expect(LEITNER_INTERVALS).toHaveProperty('10-11');
    expect(LEITNER_INTERVALS).toHaveProperty('12-13');
    expect(LEITNER_INTERVALS).toHaveProperty('14-18');
  });

  it('each bracket has exactly 6 entries (one per box)', () => {
    for (const key of ['6-7', '7-8', '8-9', 'default', '10-11', '12-13', '14-18']) {
      expect(LEITNER_INTERVALS[key]).toHaveLength(6);
    }
  });

  it('Box 1 is always 0ms (same session) for all brackets', () => {
    for (const key of ['6-7', '7-8', '8-9', 'default', '10-11', '12-13', '14-18']) {
      expect(LEITNER_INTERVALS[key][0]).toBe(0);
    }
  });

  it('default bracket matches 7-8 bracket', () => {
    expect(LEITNER_INTERVALS['default']).toEqual(LEITNER_INTERVALS['7-8']);
  });

  it('14-18 bracket Box 6 is 45 days', () => {
    const fortyFiveDays = 45 * 24 * 60 * 60 * 1000;
    expect(LEITNER_INTERVALS['14-18'][5]).toBe(fortyFiveDays);
  });
});

describe('getAgeIntervalBracket - HS extension ages 10-18', () => {
  it('maps age 10 to "10-11"', () => {
    expect(getAgeIntervalBracket(10)).toBe('10-11');
  });

  it('maps age 11 to "10-11"', () => {
    expect(getAgeIntervalBracket(11)).toBe('10-11');
  });

  it('maps age 12 to "12-13"', () => {
    expect(getAgeIntervalBracket(12)).toBe('12-13');
  });

  it('maps age 13 to "12-13"', () => {
    expect(getAgeIntervalBracket(13)).toBe('12-13');
  });

  it('maps age 14 to "14-18"', () => {
    expect(getAgeIntervalBracket(14)).toBe('14-18');
  });

  it('maps age 18 to "14-18"', () => {
    expect(getAgeIntervalBracket(18)).toBe('14-18');
  });

  it('age 9 still returns "8-9" (no regression)', () => {
    expect(getAgeIntervalBracket(9)).toBe('8-9');
  });
});

describe('GRADUATED_REVIEW_INTERVAL_MS', () => {
  it('equals 30 days in milliseconds', () => {
    expect(GRADUATED_REVIEW_INTERVAL_MS).toBe(30 * ONE_DAY_MS);
  });
});

describe('getAgeIntervalBracket', () => {
  it('maps age 6 to "6-7"', () => {
    expect(getAgeIntervalBracket(6)).toBe('6-7');
  });

  it('maps age 7 to "6-7"', () => {
    expect(getAgeIntervalBracket(7)).toBe('6-7');
  });

  it('maps age 8 to "7-8"', () => {
    expect(getAgeIntervalBracket(8)).toBe('7-8');
  });

  it('maps age 9 to "8-9"', () => {
    expect(getAgeIntervalBracket(9)).toBe('8-9');
  });

  it('maps null to "default"', () => {
    expect(getAgeIntervalBracket(null)).toBe('default');
  });
});

describe('getIntervalMs', () => {
  it('returns 0 for Box 1 (all ages)', () => {
    expect(getIntervalMs(1, 6)).toBe(0);
    expect(getIntervalMs(1, 8)).toBe(0);
    expect(getIntervalMs(1, 9)).toBe(0);
    expect(getIntervalMs(1, null)).toBe(0);
  });

  it('returns 2 hours for Box 2 age 6-7', () => {
    expect(getIntervalMs(2, 6)).toBe(2 * ONE_HOUR_MS);
    expect(getIntervalMs(2, 7)).toBe(2 * ONE_HOUR_MS);
  });

  it('returns 1 day for Box 2 age 7-8 and 8-9', () => {
    expect(getIntervalMs(2, 8)).toBe(1 * ONE_DAY_MS);
    expect(getIntervalMs(2, 9)).toBe(1 * ONE_DAY_MS);
  });
});

describe('age-adjusted interval tests (LEIT-04)', () => {
  it('Box 3, age 6 -> 1 day interval', () => {
    expect(getIntervalMs(3, 6)).toBe(1 * ONE_DAY_MS);
  });

  it('Box 3, age 9 -> 3 day interval', () => {
    expect(getIntervalMs(3, 9)).toBe(3 * ONE_DAY_MS);
  });

  it('Box 5, age 7 -> 7 day interval', () => {
    expect(getIntervalMs(5, 7)).toBe(7 * ONE_DAY_MS);
  });

  it('Box 5, age 8 -> 10 day interval', () => {
    expect(getIntervalMs(5, 8)).toBe(10 * ONE_DAY_MS);
  });

  it('null age -> uses default (7-8 bracket)', () => {
    expect(getIntervalMs(3, null)).toBe(2 * ONE_DAY_MS);
    expect(getIntervalMs(5, null)).toBe(10 * ONE_DAY_MS);
  });
});

describe('computeNextReviewDue', () => {
  it('returns ISO string offset by interval', () => {
    const now = new Date('2026-03-01T10:00:00Z');
    const result = computeNextReviewDue(3, 8, now);
    const expected = new Date(now.getTime() + 2 * ONE_DAY_MS).toISOString();
    expect(result).toBe(expected);
  });

  it('returns same time for Box 1 (0ms interval)', () => {
    const now = new Date('2026-03-01T10:00:00Z');
    const result = computeNextReviewDue(1, 8, now);
    expect(result).toBe(now.toISOString());
  });
});

describe('transitionBox', () => {
  const now = new Date('2026-03-01T10:00:00Z');

  describe('correct answer transitions', () => {
    it('Box 1 -> moves to Box 2', () => {
      const result = transitionBox(1, true, 0, 8, now);
      expect(result.newBox).toBe(2);
    });

    it('Box 3 -> moves to Box 4', () => {
      const result = transitionBox(3, true, 0, 8, now);
      expect(result.newBox).toBe(4);
    });

    it('Box 5 -> moves to Box 6', () => {
      const result = transitionBox(5, true, 0, 8, now);
      expect(result.newBox).toBe(6);
    });

    it('Box 6 -> stays in Box 6 (max)', () => {
      const result = transitionBox(6, true, 0, 8, now);
      expect(result.newBox).toBe(6);
    });
  });

  describe('wrong answer transitions', () => {
    it('Box 3 -> drops to Box 1 (3-2=1)', () => {
      const result = transitionBox(3, false, 0, 8, now);
      expect(result.newBox).toBe(1);
    });

    it('Box 4 -> drops to Box 2 (4-2=2)', () => {
      const result = transitionBox(4, false, 0, 8, now);
      expect(result.newBox).toBe(2);
    });

    it('Box 5 -> drops to Box 3 (5-2=3)', () => {
      const result = transitionBox(5, false, 0, 8, now);
      expect(result.newBox).toBe(3);
    });

    it('Box 1 -> stays in Box 1 (min)', () => {
      const result = transitionBox(1, false, 0, 8, now);
      expect(result.newBox).toBe(1);
    });

    it('Box 2 -> drops to Box 1 (min, since 2-2=0 clamped to 1)', () => {
      const result = transitionBox(2, false, 0, 8, now);
      expect(result.newBox).toBe(1);
    });
  });

  describe('LEIT-05 graduation (consecutiveCorrectInBox6)', () => {
    it('first correct in Box 6 -> counter = 1, graduated = false', () => {
      const result = transitionBox(6, true, 0, 8, now);
      expect(result.consecutiveCorrectInBox6).toBe(1);
      expect(result.graduated).toBe(false);
    });

    it('second correct in Box 6 -> counter = 2, graduated = false', () => {
      const result = transitionBox(6, true, 1, 8, now);
      expect(result.consecutiveCorrectInBox6).toBe(2);
      expect(result.graduated).toBe(false);
    });

    it('third correct in Box 6 -> counter = 3, graduated = true', () => {
      const result = transitionBox(6, true, 2, 8, now);
      expect(result.consecutiveCorrectInBox6).toBe(3);
      expect(result.graduated).toBe(true);
    });

    it('wrong in Box 6 -> counter resets to 0, graduated = false', () => {
      const result = transitionBox(6, false, 2, 8, now);
      expect(result.consecutiveCorrectInBox6).toBe(0);
      expect(result.graduated).toBe(false);
    });

    it('correct NOT in Box 6 -> counter resets to 0', () => {
      const result = transitionBox(3, true, 2, 8, now);
      expect(result.consecutiveCorrectInBox6).toBe(0);
    });

    it('graduated uses GRADUATED_REVIEW_INTERVAL_MS for nextReviewDue', () => {
      const result = transitionBox(6, true, 2, 8, now);
      expect(result.graduated).toBe(true);
      const expected = new Date(now.getTime() + GRADUATED_REVIEW_INTERVAL_MS).toISOString();
      expect(result.nextReviewDue).toBe(expected);
    });

    it('non-graduated uses standard interval for nextReviewDue', () => {
      const result = transitionBox(6, true, 0, 8, now);
      expect(result.graduated).toBe(false);
      const expected = new Date(now.getTime() + getIntervalMs(6, 8)).toISOString();
      expect(result.nextReviewDue).toBe(expected);
    });
  });

  describe('nextReviewDue computation', () => {
    it('uses age-adjusted interval for resulting box', () => {
      const resultAge6 = transitionBox(2, true, 0, 6, now);
      const resultAge9 = transitionBox(2, true, 0, 9, now);

      // Box 2 -> Box 3: age 6 = 1 day, age 9 = 3 days
      const expectedAge6 = new Date(now.getTime() + 1 * ONE_DAY_MS).toISOString();
      const expectedAge9 = new Date(now.getTime() + 3 * ONE_DAY_MS).toISOString();

      expect(resultAge6.nextReviewDue).toBe(expectedAge6);
      expect(resultAge9.nextReviewDue).toBe(expectedAge9);
    });
  });
});

describe('getReviewStatus', () => {
  it('skill with nextReviewDue in the past -> isDue = true, overdueByMs > 0', () => {
    const now = new Date('2026-03-05T10:00:00Z');
    const pastDue = '2026-03-03T10:00:00Z';
    const result = getReviewStatus(pastDue, now);
    expect(result.isDue).toBe(true);
    expect(result.overdueByMs).toBe(2 * ONE_DAY_MS);
  });

  it('skill with nextReviewDue in the future -> isDue = false, overdueByMs = 0', () => {
    const now = new Date('2026-03-01T10:00:00Z');
    const futureDue = '2026-03-05T10:00:00Z';
    const result = getReviewStatus(futureDue, now);
    expect(result.isDue).toBe(false);
    expect(result.overdueByMs).toBe(0);
  });

  it('skill with nextReviewDue = null -> isDue = true (new skill)', () => {
    const result = getReviewStatus(null);
    expect(result.isDue).toBe(true);
    expect(result.overdueByMs).toBe(0);
  });

  it('skill exactly at due time -> isDue = true, overdueByMs = 0', () => {
    const now = new Date('2026-03-03T10:00:00Z');
    const result = getReviewStatus(now.toISOString(), now);
    expect(result.isDue).toBe(true);
    expect(result.overdueByMs).toBe(0);
  });
});

describe('mapPLToInitialBox', () => {
  it('P(L) = 0.1 -> Box 1', () => {
    expect(mapPLToInitialBox(0.1)).toBe(1);
  });

  it('P(L) = 0.3 -> Box 2', () => {
    expect(mapPLToInitialBox(0.3)).toBe(2);
  });

  it('P(L) = 0.5 -> Box 3', () => {
    expect(mapPLToInitialBox(0.5)).toBe(3);
  });

  it('P(L) = 0.7 -> Box 4', () => {
    expect(mapPLToInitialBox(0.7)).toBe(4);
  });

  it('P(L) = 0.9 -> Box 5', () => {
    expect(mapPLToInitialBox(0.9)).toBe(5);
  });

  it('P(L) = 0.95 -> Box 6', () => {
    expect(mapPLToInitialBox(0.95)).toBe(6);
  });

  it('P(L) = 0.99 -> Box 6', () => {
    expect(mapPLToInitialBox(0.99)).toBe(6);
  });

  it('P(L) = 0.0 -> Box 1', () => {
    expect(mapPLToInitialBox(0.0)).toBe(1);
  });

  it('boundary: P(L) = 0.20 -> Box 2 (not Box 1)', () => {
    expect(mapPLToInitialBox(0.20)).toBe(2);
  });

  it('boundary: P(L) = 0.40 -> Box 3 (not Box 2)', () => {
    expect(mapPLToInitialBox(0.40)).toBe(3);
  });

  it('boundary: P(L) = 0.60 -> Box 4 (not Box 3)', () => {
    expect(mapPLToInitialBox(0.60)).toBe(4);
  });

  it('boundary: P(L) = 0.80 -> Box 5 (not Box 4)', () => {
    expect(mapPLToInitialBox(0.80)).toBe(5);
  });
});
