import { MULTIPLICATION_BUGS } from '../../services/mathEngine/bugLibrary/multiplicationBugs';
import { DIVISION_BUGS } from '../../services/mathEngine/bugLibrary/divisionBugs';
import { FRACTIONS_BUGS } from '../../services/mathEngine/bugLibrary/fractionsBugs';
import { PLACE_VALUE_BUGS } from '../../services/mathEngine/bugLibrary/placeValueBugs';
import { TIME_BUGS } from '../../services/mathEngine/bugLibrary/timeBugs';
import { MONEY_BUGS } from '../../services/mathEngine/bugLibrary/moneyBugs';
import { PATTERNS_BUGS } from '../../services/mathEngine/bugLibrary/patternsBugs';
import type { BugPattern } from '../../services/mathEngine/bugLibrary';

function testBugPatterns(
  domainName: string,
  bugs: readonly BugPattern[],
  testCases: { a: number; b: number; bugId: string; expected: number | null }[],
) {
  describe(`${domainName} bug patterns`, () => {
    it('has unique bug IDs', () => {
      const ids = bugs.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all bugs have valid operations array', () => {
      for (const bug of bugs) {
        expect(bug.operations.length).toBeGreaterThan(0);
      }
    });

    for (const tc of testCases) {
      it(`${tc.bugId}: compute(${tc.a}, ${tc.b}) → ${tc.expected}`, () => {
        const bug = bugs.find((b) => b.id === tc.bugId);
        expect(bug).toBeDefined();
        const result = bug!.compute(tc.a, tc.b, bug!.operations[0]);
        if (tc.expected === null) {
          expect(result).toBeNull();
        } else {
          expect(result).toBe(tc.expected);
        }
      });
    }
  });
}

testBugPatterns('Multiplication', MULTIPLICATION_BUGS, [
  { a: 3, b: 4, bugId: 'mul_add_instead', expected: 7 },
  { a: 3, b: 4, bugId: 'mul_off_by_one_group', expected: 16 },
  { a: 3, b: 4, bugId: 'mul_adjacent_fact', expected: 15 },
  { a: 5, b: 0, bugId: 'mul_zero_any', expected: 5 },
  { a: 5, b: 1, bugId: 'mul_one_add', expected: 6 },
  { a: 3, b: 20, bugId: 'mul_place_value_shift', expected: 6 },
  { a: 3, b: 4, bugId: 'mul_off_by_one_plus', expected: 13 },
]);

testBugPatterns('Division', DIVISION_BUGS, [
  { a: 12, b: 3, bugId: 'div_subtract_instead', expected: 9 },
  { a: 12, b: 3, bugId: 'div_off_by_one', expected: 5 },
  { a: 12, b: 3, bugId: 'div_multiply_instead', expected: 36 },
  { a: 12, b: 3, bugId: 'div_add_instead', expected: 15 },
  { a: 7, b: 3, bugId: 'div_remainder_ignore', expected: 2 },
  { a: 12, b: 3, bugId: 'div_remainder_ignore', expected: null },
]);

testBugPatterns('Fractions', FRACTIONS_BUGS, [
  { a: 1, b: 4, bugId: 'frac_larger_denom_larger', expected: 4 },
  { a: 1, b: 3, bugId: 'frac_add_across', expected: 4 },
  { a: 3, b: 8, bugId: 'frac_whole_number_compare', expected: 8 },
  { a: 2, b: 3, bugId: 'frac_off_by_one_plus', expected: 6 },
]);

testBugPatterns('Place Value', PLACE_VALUE_BUGS, [
  { a: 34, b: 1, bugId: 'pv_place_value_swap', expected: 30 },
  { a: 345, b: 2, bugId: 'pv_adjacent_place', expected: 4 },
  { a: 23, b: 0, bugId: 'pv_reverse_write', expected: 32 },
  { a: 305, b: 0, bugId: 'pv_zero_placeholder', expected: 35 },
  { a: 347, b: 100, bugId: 'pv_rounding_direction', expected: 200 },
  { a: 20, b: 10, bugId: 'pv_skip_wrong_step', expected: 29 },
  { a: 34, b: 0, bugId: 'pv_off_by_one', expected: 3 },
  { a: 345, b: 0, bugId: 'pv_expanded_addition', expected: 12 },
]);

testBugPatterns('Time', TIME_BUGS, [
  { a: 3, b: 6, bugId: 'time_hand_swap', expected: 3 },
  { a: 3, b: 30, bugId: 'time_hour_round_up', expected: 4 },
  { a: 3, b: 15, bugId: 'time_minute_as_number', expected: 3 },
  { a: 3, b: 30, bugId: 'time_off_by_five', expected: 35 },
  { a: 30, b: 45, bugId: 'time_elapsed_off_by_hour', expected: 15 },
  { a: 9, b: 3, bugId: 'time_am_pm_confusion', expected: 15 },
]);

testBugPatterns('Money', MONEY_BUGS, [
  { a: 10, b: 5, bugId: 'money_size_value_confusion', expected: 5 },
  { a: 25, b: 3, bugId: 'money_count_coins_not_value', expected: 3 },
  { a: 25, b: 4, bugId: 'money_quarter_addition', expected: 80 },
  { a: 10, b: 5, bugId: 'money_off_by_coin', expected: 16 },
]);

testBugPatterns('Patterns', PATTERNS_BUGS, [
  { a: 3, b: 4, bugId: 'pattern_linear_only', expected: 7 },
  { a: 3, b: 4, bugId: 'missing_reverse_operation', expected: 8 },
  { a: 5, b: 3, bugId: 'io_table_constant', expected: 5 },
]);
