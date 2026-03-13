// Wave 0 RED stubs — all tests FAIL until Wave 1 lands
// formatAsMultiSelect does not exist yet; imports will throw

import { formatAsMultiSelect } from '../../services/mathEngine/answerFormats/multiSelect';
import {
  multiSelectAnswer,
  numericAnswer,
} from '../../services/mathEngine/types';
import type { Problem } from '../../services/mathEngine/types';
import { createRng } from '../../services/mathEngine/seededRng';

function makeMockProblem(overrides: Partial<Problem> = {}): Problem {
  return {
    id: 'test-ms-1',
    templateId: 'factoring_monic',
    skillId: 'factoring_monic',
    standards: ['HSA.REI.B.4'],
    grade: 9 as const,
    baseElo: 1000,
    operation: 'quadratic_equations' as Problem['operation'],
    correctAnswer: multiSelectAnswer([3, -5]),
    questionText: 'x\u00B2 + 2x \u2212 15 = 0\nFind both roots.',
    operands: [-3, 5, -2, -15],
    metadata: { digitCount: 2, requiresCarry: false, requiresBorrow: false },
    distractorStrategy: 'domain_specific' as const,
    ...overrides,
  };
}

describe('formatAsMultiSelect', () => {
  it('should produce MultiSelectPresentation with format multi_select', () => {
    const problem = makeMockProblem();
    const rng = createRng(42);
    const result = formatAsMultiSelect(problem, rng);
    expect(result.format).toBe('multi_select');
  });

  it('should include all correct values in options', () => {
    const problem = makeMockProblem();
    const rng = createRng(42);
    const result = formatAsMultiSelect(problem, rng);
    const optionValues = result.options.map((o: { value: number }) => o.value);
    expect(optionValues).toContain(3);
    expect(optionValues).toContain(-5);
  });

  it('should include distractor values from operands', () => {
    const problem = makeMockProblem();
    const rng = createRng(42);
    const result = formatAsMultiSelect(problem, rng);
    const optionValues = result.options.map((o: { value: number }) => o.value);
    // At least one of -3 or 5 (wrong-sign roots) should appear as distractor
    const hasDistractor = optionValues.includes(-3) || optionValues.includes(5);
    expect(hasDistractor).toBe(true);
  });

  it('should produce exactly 4 options', () => {
    const problem = makeMockProblem();
    const rng = createRng(42);
    const result = formatAsMultiSelect(problem, rng);
    // 2 correct + 2 distractors
    expect(result.options).toHaveLength(4);
  });

  it('correctIndices should point to correct values', () => {
    const problem = makeMockProblem();
    const rng = createRng(42);
    const result = formatAsMultiSelect(problem, rng);
    const correctValues = result.correctIndices.map(
      (i: number) => result.options[i].value,
    );
    expect(correctValues).toContain(3);
    expect(correctValues).toContain(-5);
  });

  it('should throw if answer is not multi_select type', () => {
    const problem = makeMockProblem({
      correctAnswer: numericAnswer(42),
    });
    const rng = createRng(42);
    expect(() => formatAsMultiSelect(problem, rng)).toThrow();
  });
});
