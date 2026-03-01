import {
  generateProblem,
  generateProblems,
} from '../../services/mathEngine/generator';

describe('generateProblem', () => {
  it('is deterministic -- same seed produces same problem', () => {
    const problem1 = generateProblem({
      templateId: 'add_single_digit_no_carry',
      seed: 42,
    });
    const problem2 = generateProblem({
      templateId: 'add_single_digit_no_carry',
      seed: 42,
    });

    expect(problem1).toEqual(problem2);
  });

  it('returns a valid Problem with all required fields', () => {
    const problem = generateProblem({
      templateId: 'add_single_digit_no_carry',
      seed: 100,
    });

    expect(typeof problem.id).toBe('string');
    expect(typeof problem.templateId).toBe('string');
    expect(typeof problem.operation).toBe('string');
    expect(Array.isArray(problem.operands)).toBe(true);
    expect(problem.operands).toHaveLength(2);
    expect(typeof problem.operands[0]).toBe('number');
    expect(typeof problem.operands[1]).toBe('number');
    expect(typeof problem.correctAnswer).toBe('number');
    expect(typeof problem.questionText).toBe('string');
    expect(typeof problem.skillId).toBe('string');
    expect(Array.isArray(problem.standards)).toBe(true);
    expect(typeof problem.grade).toBe('number');
    expect(typeof problem.baseElo).toBe('number');
    expect(typeof problem.metadata).toBe('object');
    expect(typeof problem.metadata.digitCount).toBe('number');
    expect(typeof problem.metadata.requiresCarry).toBe('boolean');
    expect(typeof problem.metadata.requiresBorrow).toBe('boolean');
  });

  it('Problem ID matches {templateId}_{seed} format', () => {
    const problem = generateProblem({
      templateId: 'add_single_digit_no_carry',
      seed: 42,
    });

    expect(problem.id).toBe('add_single_digit_no_carry_42');
  });

  it('throws for unknown template ID', () => {
    expect(() =>
      generateProblem({ templateId: 'nonexistent', seed: 1 }),
    ).toThrow();
  });

  it('throws for non-integer seed', () => {
    expect(() =>
      generateProblem({
        templateId: 'add_single_digit_no_carry',
        seed: 3.14,
      } as never),
    ).toThrow();
  });

  it('question text contains operands and operator for addition', () => {
    const problem = generateProblem({
      templateId: 'add_single_digit_no_carry',
      seed: 50,
    });

    expect(problem.questionText).toContain('+');
    expect(problem.questionText).toContain('=');
    expect(problem.questionText).toContain(String(problem.operands[0]));
    expect(problem.questionText).toContain(String(problem.operands[1]));
  });

  it('question text contains operands and operator for subtraction', () => {
    const problem = generateProblem({
      templateId: 'sub_single_digit_no_borrow',
      seed: 50,
    });

    expect(problem.questionText).toContain('-');
    expect(problem.questionText).toContain('=');
  });
});

describe('generateProblems', () => {
  it('returns correct number of problems', () => {
    const problems = generateProblems({
      skillId: 'addition.single-digit.no-carry',
      count: 5,
      seed: 1,
    });

    expect(problems).toHaveLength(5);
  });

  it('each problem has a unique ID', () => {
    const problems = generateProblems({
      skillId: 'addition.single-digit.no-carry',
      count: 10,
      seed: 1,
    });

    const ids = new Set(problems.map((p) => p.id));
    expect(ids.size).toBe(10);
  });

  it('throws for unknown skill ID', () => {
    expect(() =>
      generateProblems({ skillId: 'nonexistent', count: 1, seed: 1 }),
    ).toThrow();
  });

  it('all problems share the same skill ID', () => {
    const problems = generateProblems({
      skillId: 'addition.single-digit.no-carry',
      count: 5,
      seed: 1,
    });

    for (const problem of problems) {
      expect(problem.skillId).toBe('addition.single-digit.no-carry');
    }
  });
});
