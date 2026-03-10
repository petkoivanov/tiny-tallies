import {
  eloToLevel,
  levelToEloRange,
  levelProgress,
} from '../../services/adaptive/levelMapping';

describe('Level Mapping', () => {
  describe('eloToLevel', () => {
    it('returns level 1 for lowest Elo', () => {
      expect(eloToLevel(600)).toBe(1);
      expect(eloToLevel(650)).toBe(1);
      expect(eloToLevel(699)).toBe(1);
    });

    it('returns level 5 for mid Elo', () => {
      expect(eloToLevel(940)).toBe(5);
      expect(eloToLevel(1000)).toBe(5);
    });

    it('returns level 10 for high Elo', () => {
      expect(eloToLevel(1320)).toBe(10);
      expect(eloToLevel(1400)).toBe(10);
    });

    it('monotonically increases with Elo', () => {
      let prevLevel = 0;
      for (let elo = 600; elo <= 1400; elo += 10) {
        const level = eloToLevel(elo);
        expect(level).toBeGreaterThanOrEqual(prevLevel);
        prevLevel = level;
      }
    });

    it('covers all 10 levels across the Elo range', () => {
      const levels = new Set<number>();
      for (let elo = 600; elo <= 1400; elo += 5) {
        levels.add(eloToLevel(elo));
      }
      expect(levels.size).toBe(10);
    });

    it('returns level 1 for Elo below 600', () => {
      expect(eloToLevel(500)).toBe(1);
    });
  });

  describe('levelToEloRange', () => {
    it('returns correct range for level 1', () => {
      const range = levelToEloRange(1);
      expect(range.min).toBe(600);
      expect(range.max).toBe(699);
    });

    it('returns correct range for level 10', () => {
      const range = levelToEloRange(10);
      expect(range.min).toBe(1320);
      expect(range.max).toBe(1400);
    });

    it('clamps to valid range', () => {
      expect(levelToEloRange(0)).toEqual(levelToEloRange(1));
      expect(levelToEloRange(11)).toEqual(levelToEloRange(10));
    });
  });

  describe('levelProgress', () => {
    it('returns 0 at start of level', () => {
      const progress = levelProgress(600);
      expect(progress).toBeCloseTo(0, 1);
    });

    it('returns ~0.5 at midpoint of level', () => {
      const { min, max } = levelToEloRange(5);
      const mid = Math.floor((min + max) / 2);
      const progress = levelProgress(mid);
      expect(progress).toBeGreaterThan(0.3);
      expect(progress).toBeLessThan(0.7);
    });

    it('returns value between 0 and 1', () => {
      for (let elo = 600; elo <= 1400; elo += 50) {
        const progress = levelProgress(elo);
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(1);
      }
    });
  });
});
