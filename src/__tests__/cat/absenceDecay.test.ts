import {
  calculateAbsenceDecay,
  daysSince,
  shouldSuggestReassessment,
} from '@/services/cat/absenceDecay';
import type { DecayInput, DecayResult } from '@/services/cat/absenceDecay';

function makeInput(overrides: Partial<DecayInput> = {}): DecayInput {
  return {
    eloRating: 1000,
    masteryProbability: 0.95,
    leitnerBox: 3,
    masteryLocked: true,
    daysSinceLastPractice: 14,
    ...overrides,
  };
}

describe('Absence Decay', () => {
  describe('calculateAbsenceDecay', () => {
    it('no decay within 3-day grace period', () => {
      const result = calculateAbsenceDecay(makeInput({
        daysSinceLastPractice: 3,
      }));
      expect(result.eloDecay).toBe(0);
      expect(result.newElo).toBe(1000);
      expect(result.newMasteryProbability).toBe(0.95);
      expect(result.breakMasteryLock).toBe(false);
    });

    it('no decay at 0 days', () => {
      const result = calculateAbsenceDecay(makeInput({
        daysSinceLastPractice: 0,
      }));
      expect(result.eloDecay).toBe(0);
    });

    it('applies decay after grace period', () => {
      const result = calculateAbsenceDecay(makeInput({
        daysSinceLastPractice: 14,
      }));
      expect(result.eloDecay).toBeGreaterThan(0);
      expect(result.newElo).toBeLessThan(1000);
    });

    it('more days = more decay', () => {
      const short = calculateAbsenceDecay(makeInput({
        daysSinceLastPractice: 7,
      }));
      const long = calculateAbsenceDecay(makeInput({
        daysSinceLastPractice: 30,
      }));
      expect(long.eloDecay).toBeGreaterThan(short.eloDecay);
    });

    it('higher Leitner box = less decay', () => {
      const box1 = calculateAbsenceDecay(makeInput({
        leitnerBox: 1,
        daysSinceLastPractice: 14,
      }));
      const box6 = calculateAbsenceDecay(makeInput({
        leitnerBox: 6,
        daysSinceLastPractice: 14,
      }));
      expect(box6.eloDecay).toBeLessThan(box1.eloDecay);
    });

    it('Elo never drops below 600', () => {
      const result = calculateAbsenceDecay(makeInput({
        eloRating: 650,
        leitnerBox: 1,
        daysSinceLastPractice: 365,
      }));
      expect(result.newElo).toBeGreaterThanOrEqual(600);
    });

    it('decay is capped at MAX_ELO_DECAY (150)', () => {
      const result = calculateAbsenceDecay(makeInput({
        leitnerBox: 1,
        daysSinceLastPractice: 365,
      }));
      expect(result.eloDecay).toBeLessThanOrEqual(150);
    });

    it('mastery probability decreases with absence', () => {
      const result = calculateAbsenceDecay(makeInput({
        daysSinceLastPractice: 30,
      }));
      expect(result.newMasteryProbability).toBeLessThan(0.95);
    });

    it('mastery probability never goes below 0', () => {
      const result = calculateAbsenceDecay(makeInput({
        masteryProbability: 0.05,
        leitnerBox: 1,
        daysSinceLastPractice: 365,
      }));
      expect(result.newMasteryProbability).toBeGreaterThanOrEqual(0);
    });

    it('breaks mastery lock when mastery drops below 0.80', () => {
      const result = calculateAbsenceDecay(makeInput({
        masteryProbability: 0.85,
        masteryLocked: true,
        leitnerBox: 1,
        daysSinceLastPractice: 60,
      }));
      expect(result.breakMasteryLock).toBe(true);
    });

    it('does not break lock when mastery stays above 0.80', () => {
      const result = calculateAbsenceDecay(makeInput({
        masteryProbability: 0.95,
        masteryLocked: true,
        leitnerBox: 6,
        daysSinceLastPractice: 7,
      }));
      expect(result.breakMasteryLock).toBe(false);
    });

    it('suggests reassessment for large decay', () => {
      const result = calculateAbsenceDecay(makeInput({
        leitnerBox: 1,
        daysSinceLastPractice: 90,
      }));
      expect(result.suggestReassessment).toBe(true);
    });

    it('does not suggest reassessment for small decay', () => {
      const result = calculateAbsenceDecay(makeInput({
        leitnerBox: 6,
        daysSinceLastPractice: 7,
      }));
      expect(result.suggestReassessment).toBe(false);
    });
  });

  describe('daysSince', () => {
    it('returns 0 for today', () => {
      const today = new Date().toISOString();
      expect(daysSince(today)).toBe(0);
    });

    it('returns positive number for past date', () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      expect(daysSince(pastDate)).toBe(7);
    });

    it('returns 0 for future dates', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      expect(daysSince(futureDate)).toBe(0);
    });
  });

  describe('shouldSuggestReassessment', () => {
    it('returns true when 3+ skills have significant decay', () => {
      const results: DecayResult[] = [
        { newElo: 900, eloDecay: 100, newMasteryProbability: 0.7, breakMasteryLock: true, suggestReassessment: true },
        { newElo: 850, eloDecay: 100, newMasteryProbability: 0.6, breakMasteryLock: true, suggestReassessment: true },
        { newElo: 880, eloDecay: 80, newMasteryProbability: 0.75, breakMasteryLock: true, suggestReassessment: true },
      ];
      expect(shouldSuggestReassessment(results)).toBe(true);
    });

    it('returns false when fewer than 3 skills decayed significantly', () => {
      const results: DecayResult[] = [
        { newElo: 980, eloDecay: 20, newMasteryProbability: 0.9, breakMasteryLock: false, suggestReassessment: false },
        { newElo: 900, eloDecay: 100, newMasteryProbability: 0.7, breakMasteryLock: true, suggestReassessment: true },
      ];
      expect(shouldSuggestReassessment(results)).toBe(false);
    });
  });
});
