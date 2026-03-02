import { generateDistractors } from '../../services/mathEngine/bugLibrary/distractorGenerator';
import { createRng } from '../../services/mathEngine/seededRng';
import { generateProblem } from '../../services/mathEngine/generator';
import type { Problem } from '../../services/mathEngine/types';

// Helper to create a minimal Problem for testing
function makeProblem(overrides: Partial<Problem>): Problem {
  return {
    id: 'test_1',
    templateId: 'test',
    operation: 'addition',
    operands: [5, 3] as [number, number],
    correctAnswer: 8,
    questionText: '5 + 3 = ?',
    skillId: 'addition.single-digit.no-carry',
    standards: ['1.OA.C.6'],
    grade: 1,
    baseElo: 400,
    metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false },
    ...overrides,
  };
}

describe('generateDistractors', () => {
  describe('invariants across diverse problems', () => {
    // Generate a set of diverse problems using existing templates
    const templateSeeds: Array<{ templateId: string; seed: number }> = [
      { templateId: 'add-1d-no-carry', seed: 1 },
      { templateId: 'add-1d-no-carry', seed: 42 },
      { templateId: 'add-2d-no-carry', seed: 100 },
      { templateId: 'add-2d-with-carry', seed: 200 },
      { templateId: 'add-3d-no-carry', seed: 300 },
      { templateId: 'add-3d-with-carry', seed: 400 },
      { templateId: 'sub-1d-no-borrow', seed: 500 },
      { templateId: 'sub-1d-no-borrow', seed: 501 },
      { templateId: 'sub-2d-no-borrow', seed: 600 },
      { templateId: 'sub-2d-with-borrow', seed: 700 },
      { templateId: 'sub-3d-no-borrow', seed: 800 },
      { templateId: 'sub-3d-with-borrow', seed: 900 },
      { templateId: 'add-1d-no-carry', seed: 10 },
      { templateId: 'add-1d-no-carry', seed: 20 },
      { templateId: 'add-2d-with-carry', seed: 250 },
      { templateId: 'sub-2d-with-borrow', seed: 750 },
      { templateId: 'add-3d-with-carry', seed: 450 },
      { templateId: 'sub-3d-with-borrow', seed: 950 },
      { templateId: 'add-2d-no-carry', seed: 150 },
      { templateId: 'sub-2d-no-borrow', seed: 650 },
    ];

    const problems = templateSeeds.map((ts) => generateProblem(ts));

    it('always returns exactly 3 distractors', () => {
      for (const problem of problems) {
        const rng = createRng(problem.correctAnswer);
        const distractors = generateDistractors(problem, rng);
        expect(distractors).toHaveLength(3);
      }
    });

    it('no distractor equals correctAnswer', () => {
      for (const problem of problems) {
        const rng = createRng(problem.correctAnswer + 7);
        const distractors = generateDistractors(problem, rng);
        for (const d of distractors) {
          expect(d.value).not.toBe(problem.correctAnswer);
        }
      }
    });

    it('all distractors are unique', () => {
      for (const problem of problems) {
        const rng = createRng(problem.correctAnswer + 13);
        const distractors = generateDistractors(problem, rng);
        const values = distractors.map((d) => d.value);
        expect(new Set(values).size).toBe(3);
      }
    });

    it('all distractors are positive integers', () => {
      for (const problem of problems) {
        const rng = createRng(problem.correctAnswer + 19);
        const distractors = generateDistractors(problem, rng);
        for (const d of distractors) {
          expect(d.value).toBeGreaterThan(0);
          expect(Number.isInteger(d.value)).toBe(true);
        }
      }
    });

    it('deterministic given same seed', () => {
      for (const problem of problems) {
        const rng1 = createRng(42);
        const rng2 = createRng(42);
        const d1 = generateDistractors(problem, rng1);
        const d2 = generateDistractors(problem, rng2);
        expect(d1).toEqual(d2);
      }
    });
  });

  describe('bug pattern integration', () => {
    it('addition with carry produces at least one bug_library distractor', () => {
      // 27+18=45, carry required -- bugs like no_carry should produce distractors
      const problem = makeProblem({
        operation: 'addition',
        operands: [27, 18],
        correctAnswer: 45,
        metadata: { digitCount: 2, requiresCarry: true, requiresBorrow: false },
      });
      const rng = createRng(42);
      const distractors = generateDistractors(problem, rng);
      const bugLibrary = distractors.filter((d) => d.source === 'bug_library');
      expect(bugLibrary.length).toBeGreaterThanOrEqual(1);
    });

    it('subtraction with borrow produces at least one bug_library distractor', () => {
      // 42-17=25, borrow required
      const problem = makeProblem({
        operation: 'subtraction',
        operands: [42, 17],
        correctAnswer: 25,
        metadata: { digitCount: 2, requiresCarry: false, requiresBorrow: true },
      });
      const rng = createRng(42);
      const distractors = generateDistractors(problem, rng);
      const bugLibrary = distractors.filter((d) => d.source === 'bug_library');
      expect(bugLibrary.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('edge cases', () => {
    it('smallest problem (1+1=2) produces 3 valid distractors', () => {
      const problem = makeProblem({
        operation: 'addition',
        operands: [1, 1],
        correctAnswer: 2,
        metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false },
      });
      const rng = createRng(42);
      const distractors = generateDistractors(problem, rng);
      expect(distractors).toHaveLength(3);
      for (const d of distractors) {
        expect(d.value).not.toBe(2);
        expect(d.value).toBeGreaterThan(0);
      }
    });

    it('large no-carry addition (100+200=300) produces 3 valid distractors', () => {
      const problem = makeProblem({
        operation: 'addition',
        operands: [100, 200],
        correctAnswer: 300,
        metadata: { digitCount: 3, requiresCarry: false, requiresBorrow: false },
      });
      const rng = createRng(42);
      const distractors = generateDistractors(problem, rng);
      expect(distractors).toHaveLength(3);
      for (const d of distractors) {
        expect(d.value).not.toBe(300);
        expect(d.value).toBeGreaterThan(0);
      }
    });

    it('subtraction giving 1 (10-9=1) produces 3 positive distractors', () => {
      const problem = makeProblem({
        operation: 'subtraction',
        operands: [10, 9],
        correctAnswer: 1,
        metadata: { digitCount: 2, requiresCarry: false, requiresBorrow: true },
      });
      const rng = createRng(42);
      const distractors = generateDistractors(problem, rng);
      expect(distractors).toHaveLength(3);
      for (const d of distractors) {
        expect(d.value).not.toBe(1);
        expect(d.value).toBeGreaterThan(0);
      }
    });
  });
});
