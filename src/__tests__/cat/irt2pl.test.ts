import { icc, fisherInformation, logLikelihood } from '@/services/cat/irt2pl';
import type { IrtItem } from '@/services/cat/types';

function makeItem(a: number, b: number): IrtItem {
  return {
    id: 'test',
    discrimination: a,
    difficulty: b,
    grade: 3,
    skillId: 'test-skill',
    operation: 'addition',
  };
}

describe('IRT 2PL Model', () => {
  describe('icc (Item Characteristic Curve)', () => {
    it('returns 0.5 when theta equals difficulty', () => {
      const item = makeItem(1.0, 0);
      expect(icc(0, item)).toBeCloseTo(0.5, 5);
    });

    it('returns higher probability when theta > difficulty', () => {
      const item = makeItem(1.0, 0);
      expect(icc(2, item)).toBeGreaterThan(0.5);
    });

    it('returns lower probability when theta < difficulty', () => {
      const item = makeItem(1.0, 0);
      expect(icc(-2, item)).toBeLessThan(0.5);
    });

    it('higher discrimination makes steeper curve', () => {
      const lowA = makeItem(0.5, 0);
      const highA = makeItem(2.0, 0);
      // At theta = 1, higher discrimination should give higher P
      expect(icc(1, highA)).toBeGreaterThan(icc(1, lowA));
      // At theta = -1, higher discrimination should give lower P
      expect(icc(-1, highA)).toBeLessThan(icc(-1, lowA));
    });

    it('probability is between 0 and 1', () => {
      const item = makeItem(1.5, 0);
      for (let theta = -4; theta <= 4; theta += 0.5) {
        const p = icc(theta, item);
        expect(p).toBeGreaterThan(0);
        expect(p).toBeLessThan(1);
      }
    });

    it('approaches 1 as theta increases', () => {
      const item = makeItem(1.0, 0);
      expect(icc(10, item)).toBeGreaterThan(0.999);
    });

    it('approaches 0 as theta decreases', () => {
      const item = makeItem(1.0, 0);
      expect(icc(-10, item)).toBeLessThan(0.001);
    });
  });

  describe('fisherInformation', () => {
    it('is maximized when theta equals difficulty', () => {
      const item = makeItem(1.0, 0);
      const infoAtDifficulty = fisherInformation(0, item);
      const infoAway = fisherInformation(2, item);
      expect(infoAtDifficulty).toBeGreaterThan(infoAway);
    });

    it('maximum info = a²/4 (at theta = b)', () => {
      const a = 1.5;
      const item = makeItem(a, 0);
      const info = fisherInformation(0, item);
      expect(info).toBeCloseTo(a * a * 0.25, 5);
    });

    it('scales with discrimination squared', () => {
      const item1 = makeItem(1.0, 0);
      const item2 = makeItem(2.0, 0);
      const info1 = fisherInformation(0, item1);
      const info2 = fisherInformation(0, item2);
      expect(info2 / info1).toBeCloseTo(4, 1);
    });

    it('is always non-negative', () => {
      const item = makeItem(1.0, 0);
      for (let theta = -4; theta <= 4; theta += 0.5) {
        expect(fisherInformation(theta, item)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('logLikelihood', () => {
    it('is negative for correct responses', () => {
      const item = makeItem(1.0, 0);
      expect(logLikelihood(0, item, true)).toBeLessThan(0);
    });

    it('is negative for incorrect responses', () => {
      const item = makeItem(1.0, 0);
      expect(logLikelihood(0, item, false)).toBeLessThan(0);
    });

    it('correct response LL increases with theta', () => {
      const item = makeItem(1.0, 0);
      const ll1 = logLikelihood(-1, item, true);
      const ll2 = logLikelihood(1, item, true);
      expect(ll2).toBeGreaterThan(ll1);
    });

    it('incorrect response LL decreases with theta', () => {
      const item = makeItem(1.0, 0);
      const ll1 = logLikelihood(-1, item, false);
      const ll2 = logLikelihood(1, item, false);
      expect(ll2).toBeLessThan(ll1);
    });
  });
});
