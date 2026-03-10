import { formatAsMultipleChoice } from '../../services/mathEngine/answerFormats/multipleChoice';
import { generateProblem } from '../../services/mathEngine/generator';
import { answerNumericValue, numericAnswer, type Problem } from '../../services/mathEngine/types';

// Helper to create a minimal Problem for testing
function makeProblem(overrides: Partial<Problem>): Problem {
  return {
    id: 'test_1',
    templateId: 'test',
    operation: 'addition',
    operands: [5, 3],
    correctAnswer: numericAnswer(8),
    questionText: '5 + 3 = ?',
    skillId: 'addition.single-digit.no-carry',
    standards: ['1.OA.C.6'],
    grade: 1,
    baseElo: 400,
    metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false },
    ...overrides,
  };
}

describe('formatAsMultipleChoice', () => {
  const additionProblem = generateProblem({
    templateId: 'add_two_digit_with_carry',
    seed: 42,
  });

  const subtractionProblem = generateProblem({
    templateId: 'sub_two_digit_with_borrow',
    seed: 42,
  });

  it('returns exactly 4 options', () => {
    const result = formatAsMultipleChoice(additionProblem, 123);
    expect(result.options).toHaveLength(4);
  });

  it('correct answer appears in options', () => {
    const result = formatAsMultipleChoice(additionProblem, 123);
    const values = result.options.map((o) => o.value);
    expect(values).toContain(answerNumericValue(additionProblem.correctAnswer));
  });

  it('correctIndex points to the correct answer', () => {
    const result = formatAsMultipleChoice(additionProblem, 123);
    expect(result.options[result.correctIndex].value).toBe(
      answerNumericValue(additionProblem.correctAnswer),
    );
  });

  it('all option values are unique', () => {
    const result = formatAsMultipleChoice(additionProblem, 123);
    const values = result.options.map((o) => o.value);
    expect(new Set(values).size).toBe(4);
  });

  it('all option values are positive integers', () => {
    const result = formatAsMultipleChoice(additionProblem, 123);
    for (const option of result.options) {
      expect(option.value).toBeGreaterThan(0);
      expect(Number.isInteger(option.value)).toBe(true);
    }
  });

  it('deterministic given same seed', () => {
    const r1 = formatAsMultipleChoice(additionProblem, 999);
    const r2 = formatAsMultipleChoice(additionProblem, 999);
    expect(r1.options).toEqual(r2.options);
    expect(r1.correctIndex).toBe(r2.correctIndex);
  });

  it('different seed produces different option order', () => {
    // Test across many seed pairs to ensure at least one gives different order
    const seeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const indices = seeds.map(
      (s) => formatAsMultipleChoice(additionProblem, s).correctIndex,
    );
    const unique = new Set(indices);
    // With 10 different seeds and 4 positions, we should get at least 2 different indices
    expect(unique.size).toBeGreaterThanOrEqual(2);
  });

  it('works for addition problems', () => {
    const result = formatAsMultipleChoice(additionProblem, 42);
    expect(result.format).toBe('multiple_choice');
    expect(result.problem).toBe(additionProblem);
    expect(result.options).toHaveLength(4);
    expect(result.options[result.correctIndex].value).toBe(
      answerNumericValue(additionProblem.correctAnswer),
    );
  });

  it('works for subtraction problems', () => {
    const result = formatAsMultipleChoice(subtractionProblem, 42);
    expect(result.format).toBe('multiple_choice');
    expect(result.problem).toBe(subtractionProblem);
    expect(result.options).toHaveLength(4);
    expect(result.options[result.correctIndex].value).toBe(
      answerNumericValue(subtractionProblem.correctAnswer),
    );
  });

  it('bugId is present on distractor options from bug library', () => {
    // Use a carry problem -- bug library should generate at least one misconception
    const carryProblem = makeProblem({
      operation: 'addition',
      operands: [27, 18],
      correctAnswer: numericAnswer(45),
      metadata: { digitCount: 2, requiresCarry: true, requiresBorrow: false },
    });
    const result = formatAsMultipleChoice(carryProblem, 42);

    // The correct answer should NOT have a bugId
    const correctOption = result.options[result.correctIndex];
    expect(correctOption.bugId).toBeUndefined();

    // At least one distractor should have a bugId from bug library
    const distractorsWithBugId = result.options.filter(
      (o, i) => i !== result.correctIndex && o.bugId !== undefined,
    );
    expect(distractorsWithBugId.length).toBeGreaterThanOrEqual(1);
  });
});
