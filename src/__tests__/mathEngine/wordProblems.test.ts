import { createRng } from '../../services/mathEngine/seededRng';
import {
  generateWordProblem,
  shouldGenerateWordProblem,
  WORD_PROBLEM_TEMPLATES,
  NAMES,
} from '../../services/mathEngine/wordProblems';

describe('Word Problem System', () => {
  describe('shouldGenerateWordProblem', () => {
    it('never generates at Elo < 850', () => {
      let count = 0;
      for (let i = 0; i < 100; i++) {
        const rng = createRng(i);
        if (shouldGenerateWordProblem(800, rng)) count++;
      }
      expect(count).toBe(0);
    });

    it('generates ~10% at Elo 900', () => {
      let count = 0;
      const trials = 1000;
      for (let i = 0; i < trials; i++) {
        const rng = createRng(i);
        if (shouldGenerateWordProblem(900, rng)) count++;
      }
      expect(count).toBeGreaterThan(50);
      expect(count).toBeLessThan(200);
    });

    it('generates ~40% at Elo 1300', () => {
      let count = 0;
      const trials = 1000;
      for (let i = 0; i < trials; i++) {
        const rng = createRng(i);
        if (shouldGenerateWordProblem(1300, rng)) count++;
      }
      expect(count).toBeGreaterThan(300);
      expect(count).toBeLessThan(550);
    });
  });

  describe('generateWordProblem', () => {
    it('generates addition word problems', () => {
      const rng = createRng(42);
      const result = generateWordProblem('addition', 5, 3, 1, rng);
      expect(result).not.toBeNull();
      expect(result!.text).toBeTruthy();
      expect(result!.question).toBeTruthy();
    });

    it('generates subtraction word problems', () => {
      const rng = createRng(42);
      const result = generateWordProblem('subtraction', 10, 3, 1, rng);
      expect(result).not.toBeNull();
    });

    it('generates multiplication word problems', () => {
      const rng = createRng(42);
      const result = generateWordProblem('multiplication', 4, 3, 3, rng);
      expect(result).not.toBeNull();
    });

    it('generates division word problems', () => {
      const rng = createRng(42);
      const result = generateWordProblem('division', 12, 3, 3, rng);
      expect(result).not.toBeNull();
    });

    it('generates money word problems', () => {
      const rng = createRng(42);
      const result = generateWordProblem('money', 50, 25, 2, rng);
      expect(result).not.toBeNull();
    });

    it('returns null for place_value (no word problem templates)', () => {
      const rng = createRng(42);
      const result = generateWordProblem('place_value', 3, 4, 2, rng);
      expect(result).toBeNull();
    });

    it('includes operands in word problem text', () => {
      const rng = createRng(42);
      const result = generateWordProblem('addition', 7, 5, 1, rng);
      expect(result).not.toBeNull();
      expect(result!.text).toContain('7');
      expect(result!.text).toContain('5');
    });

    it('uses names from the name pool', () => {
      const rng = createRng(42);
      const result = generateWordProblem('addition', 3, 4, 1, rng);
      expect(result).not.toBeNull();
      const hasName = NAMES.some(
        (name) =>
          result!.text.includes(name) || result!.question.includes(name),
      );
      expect(hasName).toBe(true);
    });

    it('respects grade-level filtering', () => {
      // Grade 1 should not get grade-3 only templates
      const rng = createRng(42);
      const result = generateWordProblem('division', 12, 3, 1, rng);
      // Division templates require minGrade 3
      expect(result).toBeNull();
    });

    it('generates deterministic results with same seed', () => {
      const rng1 = createRng(123);
      const rng2 = createRng(123);
      const result1 = generateWordProblem('addition', 5, 3, 2, rng1);
      const result2 = generateWordProblem('addition', 5, 3, 2, rng2);
      expect(result1).toEqual(result2);
    });
  });

  describe('WORD_PROBLEM_TEMPLATES', () => {
    it('has templates for applicable domains', () => {
      const ops = new Set(WORD_PROBLEM_TEMPLATES.flatMap((t) => t.operations));
      expect(ops.has('addition')).toBe(true);
      expect(ops.has('subtraction')).toBe(true);
      expect(ops.has('multiplication')).toBe(true);
      expect(ops.has('division')).toBe(true);
      expect(ops.has('money')).toBe(true);
    });

    it('all templates have unique IDs', () => {
      const ids = WORD_PROBLEM_TEMPLATES.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all templates have valid template strings with placeholders', () => {
      for (const t of WORD_PROBLEM_TEMPLATES) {
        expect(t.template.length).toBeGreaterThan(10);
        expect(t.question.length).toBeGreaterThan(5);
      }
    });
  });
});
