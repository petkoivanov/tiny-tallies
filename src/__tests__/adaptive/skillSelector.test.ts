import { createRng } from '@/services/mathEngine/seededRng';
import type { SkillState } from '@/store/slices/skillStatesSlice';
import {
  weightSkillsByWeakness,
  selectSkill,
  WEAKNESS_BASELINE,
} from '@/services/adaptive/skillSelector';

/** BKT + Leitner default fields for SkillState test objects */
const bkt = { masteryProbability: 0.1, consecutiveWrong: 0, masteryLocked: false, leitnerBox: 1 as const, nextReviewDue: null, consecutiveCorrectInBox6: 0, cpaLevel: 'concrete' as const } as const;

describe('skillSelector', () => {
  const skillIds = [
    'addition.single-digit.no-carry',
    'addition.within-20.no-carry',
    'subtraction.single-digit.no-borrow',
  ];

  describe('weightSkillsByWeakness', () => {
    it('weakest skill gets highest weight', () => {
      const skillStates: Record<string, SkillState> = {
        'addition.single-digit.no-carry': {
          eloRating: 800,
          attempts: 10,
          correct: 5,
          ...bkt,
        },
        'addition.within-20.no-carry': {
          eloRating: 1100,
          attempts: 10,
          correct: 8,
          ...bkt,
        },
        'subtraction.single-digit.no-borrow': {
          eloRating: 950,
          attempts: 10,
          correct: 7,
          ...bkt,
        },
      };

      const weights = weightSkillsByWeakness(skillIds, skillStates);

      const weight800 = weights.find(
        (w) => w.skillId === 'addition.single-digit.no-carry',
      )!.weight;
      const weight1100 = weights.find(
        (w) => w.skillId === 'addition.within-20.no-carry',
      )!.weight;

      expect(weight800).toBeGreaterThan(weight1100);
    });

    it('all skills get non-zero weight', () => {
      const skillStates: Record<string, SkillState> = {
        'addition.single-digit.no-carry': {
          eloRating: 800,
          attempts: 10,
          correct: 5,
          ...bkt,
        },
        'addition.within-20.no-carry': {
          eloRating: 1100,
          attempts: 10,
          correct: 8,
          ...bkt,
        },
        'subtraction.single-digit.no-borrow': {
          eloRating: 1100,
          attempts: 10,
          correct: 9,
          ...bkt,
        },
      };

      const weights = weightSkillsByWeakness(skillIds, skillStates);

      for (const w of weights) {
        expect(w.weight).toBeGreaterThan(0);
      }
    });

    it('equal Elo gives equal weight', () => {
      const skillStates: Record<string, SkillState> = {
        'addition.single-digit.no-carry': {
          eloRating: 1000,
          attempts: 10,
          correct: 8,
          ...bkt,
        },
        'addition.within-20.no-carry': {
          eloRating: 1000,
          attempts: 10,
          correct: 8,
          ...bkt,
        },
        'subtraction.single-digit.no-borrow': {
          eloRating: 1000,
          attempts: 10,
          correct: 8,
          ...bkt,
        },
      };

      const weights = weightSkillsByWeakness(skillIds, skillStates);

      const uniqueWeights = new Set(weights.map((w) => w.weight));
      expect(uniqueWeights.size).toBe(1);
    });
  });

  describe('selectSkill', () => {
    it('returns one of the input skill IDs', () => {
      const skillStates: Record<string, SkillState> = {};
      const rng = createRng(42);
      const result = selectSkill(skillIds, skillStates, rng);

      expect(skillIds).toContain(result);
    });

    it('is deterministic with same seed', () => {
      const skillStates: Record<string, SkillState> = {
        'addition.single-digit.no-carry': {
          eloRating: 900,
          attempts: 5,
          correct: 3,
          ...bkt,
        },
        'addition.within-20.no-carry': {
          eloRating: 1050,
          attempts: 5,
          correct: 4,
          ...bkt,
        },
      };

      const rng1 = createRng(42);
      const result1 = selectSkill(skillIds, skillStates, rng1);

      const rng2 = createRng(42);
      const result2 = selectSkill(skillIds, skillStates, rng2);

      expect(result1).toBe(result2);
    });

    it('statistical distribution favors weaker skills', () => {
      const skillStates: Record<string, SkillState> = {
        'addition.single-digit.no-carry': {
          eloRating: 800,
          attempts: 20,
          correct: 10,
          ...bkt,
        },
        'addition.within-20.no-carry': {
          eloRating: 1100,
          attempts: 20,
          correct: 16,
          ...bkt,
        },
        'subtraction.single-digit.no-borrow': {
          eloRating: 1000,
          attempts: 20,
          correct: 14,
          ...bkt,
        },
      };

      const counts: Record<string, number> = {};
      const rng = createRng(12345);

      for (let i = 0; i < 1000; i++) {
        const result = selectSkill(skillIds, skillStates, rng);
        counts[result] = (counts[result] ?? 0) + 1;
      }

      // Weakest skill (Elo 800) should be selected most often
      expect(counts['addition.single-digit.no-carry']).toBeGreaterThan(
        counts['addition.within-20.no-carry'],
      );
    });
  });
});
