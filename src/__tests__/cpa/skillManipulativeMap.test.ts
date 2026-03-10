import { SKILLS } from '@/services/mathEngine/skills';
import {
  SKILL_MANIPULATIVE_MAP,
  getManipulativesForSkill,
  getPrimaryManipulative,
} from '@/services/cpa/skillManipulativeMap';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';

describe('Skill Manipulative Map', () => {
  describe('SKILL_MANIPULATIVE_MAP coverage', () => {
    it('has one entry per skill', () => {
      expect(SKILL_MANIPULATIVE_MAP).toHaveLength(SKILLS.length);
    });

    it('covers every skill ID in SKILLS array', () => {
      const mappedIds = SKILL_MANIPULATIVE_MAP.map((m) => m.skillId);
      for (const skill of SKILLS) {
        expect(mappedIds).toContain(skill.id);
      }
    });

    it('every mapping has at least one manipulative', () => {
      for (const mapping of SKILL_MANIPULATIVE_MAP) {
        expect(mapping.manipulatives.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('every mapping includes bar_model as last entry', () => {
      for (const mapping of SKILL_MANIPULATIVE_MAP) {
        const lastItem = mapping.manipulatives[mapping.manipulatives.length - 1];
        expect(lastItem).toBe('bar_model');
      }
    });
  });

  describe('mapping categories', () => {
    it('single-digit skills map to counters, bar_model', () => {
      const expected: ManipulativeType[] = ['counters', 'bar_model'];
      expect(getManipulativesForSkill('addition.single-digit.no-carry')).toEqual(expected);
      expect(getManipulativesForSkill('subtraction.single-digit.no-borrow')).toEqual(expected);
    });

    it('within-20 skills map to number_line, bar_model', () => {
      const expected: ManipulativeType[] = ['number_line', 'bar_model'];
      expect(getManipulativesForSkill('addition.within-20.no-carry')).toEqual(expected);
      expect(getManipulativesForSkill('addition.within-20.with-carry')).toEqual(expected);
      expect(getManipulativesForSkill('subtraction.within-20.no-borrow')).toEqual(expected);
      expect(getManipulativesForSkill('subtraction.within-20.with-borrow')).toEqual(expected);
    });

    it('two-digit skills map to base_ten_blocks, number_line, bar_model', () => {
      const expected: ManipulativeType[] = ['base_ten_blocks', 'number_line', 'bar_model'];
      expect(getManipulativesForSkill('addition.two-digit.no-carry')).toEqual(expected);
      expect(getManipulativesForSkill('addition.two-digit.with-carry')).toEqual(expected);
      expect(getManipulativesForSkill('subtraction.two-digit.no-borrow')).toEqual(expected);
      expect(getManipulativesForSkill('subtraction.two-digit.with-borrow')).toEqual(expected);
    });

    it('three-digit skills map to base_ten_blocks, bar_model', () => {
      const expected: ManipulativeType[] = ['base_ten_blocks', 'bar_model'];
      expect(getManipulativesForSkill('addition.three-digit.no-carry')).toEqual(expected);
      expect(getManipulativesForSkill('addition.three-digit.with-carry')).toEqual(expected);
      expect(getManipulativesForSkill('subtraction.three-digit.no-borrow')).toEqual(expected);
      expect(getManipulativesForSkill('subtraction.three-digit.with-borrow')).toEqual(expected);
    });

    it('fraction skills map to fraction_strips, bar_model', () => {
      const expected: ManipulativeType[] = ['fraction_strips', 'bar_model'];
      expect(getManipulativesForSkill('fractions.equal-parts')).toEqual(expected);
      expect(getManipulativesForSkill('fractions.unit-fractions')).toEqual(expected);
    });

    it('place value skills map to base_ten_blocks, bar_model', () => {
      const expected: ManipulativeType[] = ['base_ten_blocks', 'bar_model'];
      expect(getManipulativesForSkill('place-value.ones-tens')).toEqual(expected);
      expect(getManipulativesForSkill('place-value.hundreds')).toEqual(expected);
    });

    it('simple multiplication skills map to counters, bar_model', () => {
      const expected: ManipulativeType[] = ['counters', 'bar_model'];
      expect(getManipulativesForSkill('multiplication.equal-groups')).toEqual(expected);
      expect(getManipulativesForSkill('multiplication.arrays')).toEqual(expected);
    });
  });

  describe('subtraction mirrors addition', () => {
    it('subtraction mappings match corresponding addition mappings', () => {
      const pairs: [string, string][] = [
        ['addition.single-digit.no-carry', 'subtraction.single-digit.no-borrow'],
        ['addition.within-20.no-carry', 'subtraction.within-20.no-borrow'],
        ['addition.within-20.with-carry', 'subtraction.within-20.with-borrow'],
        ['addition.two-digit.no-carry', 'subtraction.two-digit.no-borrow'],
        ['addition.two-digit.with-carry', 'subtraction.two-digit.with-borrow'],
        ['addition.three-digit.no-carry', 'subtraction.three-digit.no-borrow'],
        ['addition.three-digit.with-carry', 'subtraction.three-digit.with-borrow'],
      ];
      for (const [addId, subId] of pairs) {
        expect(getManipulativesForSkill(subId)).toEqual(
          getManipulativesForSkill(addId),
        );
      }
    });
  });

  describe('getManipulativesForSkill', () => {
    it('returns manipulatives for a valid skill', () => {
      const result = getManipulativesForSkill('addition.single-digit.no-carry');
      expect(result).toEqual(['counters', 'bar_model']);
    });

    it('returns empty array for nonexistent skill', () => {
      expect(getManipulativesForSkill('nonexistent.skill')).toEqual([]);
    });
  });

  describe('getPrimaryManipulative', () => {
    it('returns first manipulative for a valid skill', () => {
      expect(getPrimaryManipulative('addition.single-digit.no-carry')).toBe('counters');
    });

    it('returns null for nonexistent skill', () => {
      expect(getPrimaryManipulative('nonexistent.skill')).toBeNull();
    });
  });
});
