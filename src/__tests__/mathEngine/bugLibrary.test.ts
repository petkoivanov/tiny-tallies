import { ADDITION_BUGS } from '../../services/mathEngine/bugLibrary/additionBugs';
import { SUBTRACTION_BUGS } from '../../services/mathEngine/bugLibrary/subtractionBugs';
import {
  isValidDistractor,
  shuffleArray,
} from '../../services/mathEngine/bugLibrary/validation';
import type { BugPattern } from '../../services/mathEngine/bugLibrary/types';
import { createRng } from '../../services/mathEngine/seededRng';

// Helper to find a bug by id
function findBug(bugs: readonly BugPattern[], id: string): BugPattern {
  const bug = bugs.find((b) => b.id === id);
  if (!bug) throw new Error(`Bug pattern "${id}" not found`);
  return bug;
}

describe('Addition Bug Patterns', () => {
  describe('add_no_carry', () => {
    it('returns wrong answer ignoring carry (27+18 -> 35)', () => {
      const bug = findBug(ADDITION_BUGS, 'add_no_carry');
      expect(bug.compute(27, 18, 'addition')).toBe(35);
    });

    it('returns null when no carry required (12+13)', () => {
      const bug = findBug(ADDITION_BUGS, 'add_no_carry');
      expect(bug.compute(12, 13, 'addition')).toBeNull();
    });

    it('returns null for single-digit operands (3+4)', () => {
      const bug = findBug(ADDITION_BUGS, 'add_no_carry');
      // 3+4=7, no carry possible for single digits that sum < 10
      expect(bug.compute(3, 4, 'addition')).toBeNull();
    });
  });

  describe('add_carry_wrong_column', () => {
    it('writes full column sum instead of carrying (27+18 -> 315)', () => {
      const bug = findBug(ADDITION_BUGS, 'add_carry_wrong_column');
      expect(bug.compute(27, 18, 'addition')).toBe(315);
    });

    it('returns null when no carry occurs (12+13)', () => {
      const bug = findBug(ADDITION_BUGS, 'add_carry_wrong_column');
      expect(bug.compute(12, 13, 'addition')).toBeNull();
    });
  });

  describe('add_off_by_one_plus', () => {
    it('returns correct+1 (5+3 -> 9)', () => {
      const bug = findBug(ADDITION_BUGS, 'add_off_by_one_plus');
      expect(bug.compute(5, 3, 'addition')).toBe(9);
    });

    it('works for larger numbers (27+18 -> 46)', () => {
      const bug = findBug(ADDITION_BUGS, 'add_off_by_one_plus');
      expect(bug.compute(27, 18, 'addition')).toBe(46);
    });
  });

  describe('add_off_by_one_minus', () => {
    it('returns correct-1 (5+3 -> 7)', () => {
      const bug = findBug(ADDITION_BUGS, 'add_off_by_one_minus');
      expect(bug.compute(5, 3, 'addition')).toBe(7);
    });

    it('returns null when correct answer <= 1 (0+1 -> null)', () => {
      const bug = findBug(ADDITION_BUGS, 'add_off_by_one_minus');
      expect(bug.compute(0, 1, 'addition')).toBeNull();
    });
  });

  describe('add_concat', () => {
    it('concatenates single-digit operands (3+4 -> 34)', () => {
      const bug = findBug(ADDITION_BUGS, 'add_concat');
      expect(bug.compute(3, 4, 'addition')).toBe(34);
    });

    it('returns null for multi-digit operands (12+3)', () => {
      const bug = findBug(ADDITION_BUGS, 'add_concat');
      expect(bug.compute(12, 3, 'addition')).toBeNull();
    });
  });

  describe('add_reverse_digits', () => {
    it('reverses digits of two-digit answer (9+4=13 -> 31)', () => {
      const bug = findBug(ADDITION_BUGS, 'add_reverse_digits');
      expect(bug.compute(9, 4, 'addition')).toBe(31);
    });

    it('returns null for single-digit correct answer (2+3=5)', () => {
      const bug = findBug(ADDITION_BUGS, 'add_reverse_digits');
      expect(bug.compute(2, 3, 'addition')).toBeNull();
    });

    it('returns null when digits are same (5+6=11 -> 11, swap is identity)', () => {
      const bug = findBug(ADDITION_BUGS, 'add_reverse_digits');
      expect(bug.compute(5, 6, 'addition')).toBeNull();
    });
  });
});

describe('Subtraction Bug Patterns', () => {
  describe('sub_smaller_from_larger', () => {
    it('subtracts smaller from larger per column (42-17 -> 35)', () => {
      const bug = findBug(SUBTRACTION_BUGS, 'sub_smaller_from_larger');
      expect(bug.compute(42, 17, 'subtraction')).toBe(35);
    });

    it('returns null when no borrow needed (45-12)', () => {
      const bug = findBug(SUBTRACTION_BUGS, 'sub_smaller_from_larger');
      expect(bug.compute(45, 12, 'subtraction')).toBeNull();
    });
  });

  describe('sub_zero_confusion', () => {
    it('treats 0-digit as positive (30-7 -> 37)', () => {
      const bug = findBug(SUBTRACTION_BUGS, 'sub_zero_confusion');
      expect(bug.compute(30, 7, 'subtraction')).toBe(37);
    });

    it('returns null when no zero digit in top number (42-17)', () => {
      const bug = findBug(SUBTRACTION_BUGS, 'sub_zero_confusion');
      expect(bug.compute(42, 17, 'subtraction')).toBeNull();
    });
  });

  describe('sub_borrow_forget_reduce', () => {
    it('borrows but forgets to reduce tens (53-28 -> 35)', () => {
      const bug = findBug(SUBTRACTION_BUGS, 'sub_borrow_forget_reduce');
      expect(bug.compute(53, 28, 'subtraction')).toBe(35);
    });

    it('returns null when no borrow needed (45-12)', () => {
      const bug = findBug(SUBTRACTION_BUGS, 'sub_borrow_forget_reduce');
      expect(bug.compute(45, 12, 'subtraction')).toBeNull();
    });
  });

  describe('sub_off_by_one_plus', () => {
    it('returns correct+1 (15-8 -> 8)', () => {
      const bug = findBug(SUBTRACTION_BUGS, 'sub_off_by_one_plus');
      expect(bug.compute(15, 8, 'subtraction')).toBe(8);
    });

    it('returns null when result would equal a (e.g., impossible in normal range)', () => {
      // 5-4=1, result+1=2, which is < a=5, so it should be valid
      // Need a case where correct+1 >= a: e.g., 2-1=1, result+1=2 = a => null
      const bug = findBug(SUBTRACTION_BUGS, 'sub_off_by_one_plus');
      expect(bug.compute(2, 1, 'subtraction')).toBeNull();
    });
  });

  describe('sub_off_by_one_minus', () => {
    it('returns correct-1 (15-8 -> 6)', () => {
      const bug = findBug(SUBTRACTION_BUGS, 'sub_off_by_one_minus');
      expect(bug.compute(15, 8, 'subtraction')).toBe(6);
    });

    it('returns null when correct answer <= 1 (10-9=1 -> null)', () => {
      const bug = findBug(SUBTRACTION_BUGS, 'sub_off_by_one_minus');
      expect(bug.compute(10, 9, 'subtraction')).toBeNull();
    });
  });
});

describe('isValidDistractor', () => {
  it('rejects negative numbers', () => {
    expect(isValidDistractor(-1, 10, 'addition')).toBe(false);
  });

  it('rejects zero for addition', () => {
    expect(isValidDistractor(0, 5, 'addition')).toBe(false);
  });

  it('rejects zero for subtraction', () => {
    expect(isValidDistractor(0, 5, 'subtraction')).toBe(false);
  });

  it('rejects distractor equal to correct answer', () => {
    expect(isValidDistractor(10, 10, 'addition')).toBe(false);
  });

  it('rejects absurdly distant values', () => {
    // correctAnswer=10, max distance = max(10*0.5, 10) = 10, so 21 is >10 away
    expect(isValidDistractor(21, 10, 'addition')).toBe(false);
  });

  it('rejects large distractor when correct answer is small', () => {
    // correctAnswer=3, distractor=11 should be rejected (>10 when correct<=5)
    expect(isValidDistractor(11, 3, 'addition')).toBe(false);
  });

  it('accepts plausible distractor', () => {
    expect(isValidDistractor(8, 10, 'addition')).toBe(true);
  });

  it('accepts distractor near correct answer', () => {
    expect(isValidDistractor(11, 10, 'addition')).toBe(true);
  });
});

describe('shuffleArray', () => {
  it('produces same order with same seed', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    const result1 = shuffleArray(arr, rng1);
    const result2 = shuffleArray(arr, rng2);
    expect(result1).toEqual(result2);
  });

  it('produces different order with different seed', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const rng1 = createRng(42);
    const rng2 = createRng(999);
    const result1 = shuffleArray(arr, rng1);
    const result2 = shuffleArray(arr, rng2);
    // Very unlikely to produce same order with 10 elements
    expect(result1).not.toEqual(result2);
  });

  it('preserves all elements (no loss or duplication)', () => {
    const arr = [1, 2, 3, 4, 5];
    const rng = createRng(42);
    const result = shuffleArray(arr, rng);
    expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    const rng = createRng(42);
    shuffleArray(arr, rng);
    expect(arr).toEqual(original);
  });
});
