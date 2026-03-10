import {
  thetaToElo,
  computePlacementElos,
  computeUnlockedSkills,
} from '@/services/cat/placementMapper';
import {
  createCatSession,
  recordResponse,
} from '@/services/cat/catEngine';
import type { IrtItem } from '@/services/cat/types';

function makeItem(
  id: string, b: number, grade: number, operation: string,
): IrtItem {
  return {
    id, discrimination: 1.0, difficulty: b,
    grade, skillId: `skill-${id}`, operation,
  };
}

const SAMPLE_SKILLS = [
  { id: 'add-g1', grade: 1, operation: 'addition' },
  { id: 'add-g2', grade: 2, operation: 'addition' },
  { id: 'sub-g2', grade: 2, operation: 'subtraction' },
  { id: 'mul-g3', grade: 3, operation: 'multiplication' },
  { id: 'div-g4', grade: 4, operation: 'division' },
  { id: 'frac-g5', grade: 5, operation: 'fractions' },
  { id: 'rat-g6', grade: 6, operation: 'ratios' },
  { id: 'exp-g7', grade: 7, operation: 'exponents' },
  { id: 'scat-g8', grade: 8, operation: 'data_analysis' },
];

describe('Placement Mapper', () => {
  describe('thetaToElo', () => {
    it('maps theta 0 to Elo 1000', () => {
      expect(thetaToElo(0)).toBe(1000);
    });

    it('maps positive theta to higher Elo', () => {
      expect(thetaToElo(1)).toBeGreaterThan(1000);
    });

    it('maps negative theta to lower Elo', () => {
      expect(thetaToElo(-1)).toBeLessThan(1000);
    });

    it('clamps at ELO_MIN (600)', () => {
      expect(thetaToElo(-10)).toBe(600);
    });

    it('clamps at ELO_MAX (1400)', () => {
      expect(thetaToElo(10)).toBe(1400);
    });

    it('theta 3 → approximately 1400', () => {
      expect(thetaToElo(3)).toBe(1400);
    });

    it('theta -3 → approximately 600', () => {
      expect(thetaToElo(-3)).toBe(600);
    });
  });

  describe('computePlacementElos', () => {
    it('assigns higher Elo to below-grade skills', () => {
      const state = createCatSession();
      // Simulate a moderate student (grade 3 level)
      recordResponse(state, makeItem('i1', -2, 1, 'addition'), true);
      recordResponse(state, makeItem('i2', -1, 2, 'addition'), true);
      recordResponse(state, makeItem('i3', 0, 3, 'multiplication'), true);
      recordResponse(state, makeItem('i4', 1, 4, 'division'), false);
      recordResponse(state, makeItem('i5', 2, 5, 'fractions'), false);

      const eloMap = computePlacementElos(state, SAMPLE_SKILLS);

      // Grade 1 skill should have higher Elo than grade 4 skill
      expect(eloMap.get('add-g1')!).toBeGreaterThan(eloMap.get('div-g4')!);
    });

    it('assigns Elo to all skills', () => {
      const state = createCatSession();
      recordResponse(state, makeItem('i1', 0, 3, 'addition'), true);

      const eloMap = computePlacementElos(state, SAMPLE_SKILLS);
      expect(eloMap.size).toBe(SAMPLE_SKILLS.length);
    });

    it('all Elo values are within valid range', () => {
      const state = createCatSession();
      recordResponse(state, makeItem('i1', 0, 3, 'addition'), true);
      recordResponse(state, makeItem('i2', 1, 5, 'fractions'), false);

      const eloMap = computePlacementElos(state, SAMPLE_SKILLS);
      for (const elo of eloMap.values()) {
        expect(elo).toBeGreaterThanOrEqual(600);
        expect(elo).toBeLessThanOrEqual(1400);
      }
    });
  });

  describe('computeUnlockedSkills', () => {
    it('unlocks skills at or below estimated grade', () => {
      const unlocked = computeUnlockedSkills(3, 0.8, SAMPLE_SKILLS);
      expect(unlocked.has('add-g1')).toBe(true);
      expect(unlocked.has('add-g2')).toBe(true);
      expect(unlocked.has('mul-g3')).toBe(true);
    });

    it('unlocks one grade above when accuracy >= 70%', () => {
      const unlocked = computeUnlockedSkills(3, 0.8, SAMPLE_SKILLS);
      expect(unlocked.has('div-g4')).toBe(true);
    });

    it('does not unlock above grade when accuracy < 70%', () => {
      const unlocked = computeUnlockedSkills(3, 0.5, SAMPLE_SKILLS);
      expect(unlocked.has('div-g4')).toBe(false);
    });

    it('does not unlock skills 2+ grades above', () => {
      const unlocked = computeUnlockedSkills(3, 0.8, SAMPLE_SKILLS);
      expect(unlocked.has('frac-g5')).toBe(false);
      expect(unlocked.has('rat-g6')).toBe(false);
    });
  });
});
