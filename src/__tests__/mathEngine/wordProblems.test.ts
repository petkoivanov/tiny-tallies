import { createRng } from '../../services/mathEngine/seededRng';
import {
  generateWordProblem,
  shouldGenerateWordProblem,
  WORD_PROBLEM_TEMPLATES,
  NAMES,
} from '../../services/mathEngine/wordProblems';
import type { Operation } from '../../services/mathEngine/types';

const ALL_OPERATIONS: Operation[] = [
  'addition', 'subtraction', 'multiplication', 'division',
  'fractions', 'place_value', 'time', 'money', 'patterns',
  'measurement', 'ratios', 'exponents', 'expressions',
  'geometry', 'probability', 'number_theory',
];

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

  describe('generateWordProblem — replace mode (arithmetic)', () => {
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
      const rng = createRng(42);
      const result = generateWordProblem('division', 12, 3, 1, rng);
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

  describe('generateWordProblem — prefix mode (new domains)', () => {
    it('place_value: prepends scene-setting to original question', () => {
      const rng = createRng(42);
      const originalQ = 'How many tens are in 345?';
      const result = generateWordProblem('place_value', 345, 1, 2, rng, originalQ);
      expect(result).not.toBeNull();
      expect(result!.question).toBe(originalQ);
      const hasName = NAMES.some((n) => result!.text.includes(n));
      expect(hasName).toBe(true);
    });

    it('patterns: generates in prefix mode', () => {
      const rng = createRng(42);
      const originalQ = 'What comes next? 2, 4, 6, ?';
      const result = generateWordProblem('patterns', 6, 2, 2, rng, originalQ);
      expect(result).not.toBeNull();
      expect(result!.question).toBe(originalQ);
    });

    it('measurement: generates in prefix mode', () => {
      const rng = createRng(42);
      const originalQ = '3 feet = ? inches';
      const result = generateWordProblem('measurement', 3, 12, 4, rng, originalQ);
      expect(result).not.toBeNull();
      expect(result!.question).toBe(originalQ);
    });

    it('ratios: generates in prefix mode', () => {
      const rng = createRng(42);
      const originalQ = '5 packs cost $15. How much does 1 pack cost?';
      const result = generateWordProblem('ratios', 15, 5, 6, rng, originalQ);
      expect(result).not.toBeNull();
      expect(result!.question).toBe(originalQ);
    });

    it('exponents: generates in prefix mode', () => {
      const rng = createRng(42);
      const originalQ = 'What is 5\u00B2?';
      const result = generateWordProblem('exponents', 5, 2, 5, rng, originalQ);
      expect(result).not.toBeNull();
      expect(result!.question).toBe(originalQ);
    });

    it('expressions: generates in prefix mode', () => {
      const rng = createRng(42);
      const originalQ = '2 + 3 \u00D7 4 = ?';
      const result = generateWordProblem('expressions', 14, 14, 5, rng, originalQ);
      expect(result).not.toBeNull();
      expect(result!.question).toBe(originalQ);
    });

    it('geometry: generates in prefix mode', () => {
      const rng = createRng(42);
      const originalQ = 'A circle has radius 5. What is the area?';
      const result = generateWordProblem('geometry', 5, 78.5, 7, rng, originalQ);
      expect(result).not.toBeNull();
      expect(result!.question).toBe(originalQ);
    });

    it('probability: generates in prefix mode', () => {
      const rng = createRng(42);
      const originalQ = 'A bag has 3 red and 7 blue marbles. P(red)?';
      const result = generateWordProblem('probability', 3, 10, 7, rng, originalQ);
      expect(result).not.toBeNull();
      expect(result!.question).toBe(originalQ);
    });

    it('number_theory: generates in prefix mode', () => {
      const rng = createRng(42);
      const originalQ = 'What is the GCF of 12 and 18?';
      const result = generateWordProblem('number_theory', 12, 18, 6, rng, originalQ);
      expect(result).not.toBeNull();
      expect(result!.question).toBe(originalQ);
    });
  });

  describe('reading level calibration (maxGrade)', () => {
    it('grade 1 gets simple templates only', () => {
      const rng = createRng(42);
      const result = generateWordProblem('addition', 3, 2, 1, rng);
      expect(result).not.toBeNull();
      // Short sentences for young readers
      expect(result!.text.length).toBeLessThan(100);
    });

    it('grade 4+ gets the "field trip" template', () => {
      let gotTrip = false;
      for (let seed = 0; seed < 100; seed++) {
        const rng = createRng(seed);
        const result = generateWordProblem('addition', 50, 30, 4, rng);
        if (result && result.text.includes('field trip')) {
          gotTrip = true;
          break;
        }
      }
      expect(gotTrip).toBe(true);
    });

    it('grade 1 never gets grade 3+ only templates', () => {
      for (let seed = 0; seed < 100; seed++) {
        const rng = createRng(seed);
        const result = generateWordProblem('addition', 5, 3, 1, rng);
        if (result) {
          expect(result.text).not.toContain('field trip');
        }
      }
    });

    it('maxGrade caps simple templates away from advanced students', () => {
      // wp_add_combine has maxGrade 2
      const combineT = WORD_PROBLEM_TEMPLATES.find((t) => t.id === 'wp_add_combine');
      expect(combineT!.maxGrade).toBe(2);

      // At grade 5, the applicable addition templates should NOT include wp_add_combine
      const applicableAtG5 = WORD_PROBLEM_TEMPLATES.filter(
        (t) =>
          t.operations.includes('addition') &&
          t.minGrade <= 5 &&
          (t.maxGrade === undefined || t.maxGrade >= 5),
      );
      const ids = applicableAtG5.map((t) => t.id);
      expect(ids).not.toContain('wp_add_combine');
    });
  });

  describe('full domain coverage', () => {
    it('every operation has at least one template', () => {
      for (const op of ALL_OPERATIONS) {
        const templates = WORD_PROBLEM_TEMPLATES.filter((t) =>
          t.operations.includes(op),
        );
        expect(templates.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('every operation generates a word problem at appropriate grade', () => {
      const gradeMap: Record<Operation, number> = {
        addition: 2,
        subtraction: 2,
        multiplication: 3,
        division: 3,
        fractions: 2,
        place_value: 2,
        time: 3,
        money: 2,
        patterns: 2,
        measurement: 4,
        ratios: 6,
        exponents: 5,
        expressions: 5,
        geometry: 7,
        probability: 7,
        number_theory: 6,
      };

      for (const op of ALL_OPERATIONS) {
        const grade = gradeMap[op];
        const rng = createRng(42);
        const result = generateWordProblem(op, 10, 5, grade, rng, 'Original Q?');
        expect(result).not.toBeNull();
      }
    });
  });

  describe('WORD_PROBLEM_TEMPLATES', () => {
    it('has templates for all 16 domains', () => {
      const ops = new Set(WORD_PROBLEM_TEMPLATES.flatMap((t) => t.operations));
      for (const op of ALL_OPERATIONS) {
        expect(ops.has(op)).toBe(true);
      }
    });

    it('all templates have unique IDs', () => {
      const ids = WORD_PROBLEM_TEMPLATES.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all replace-mode templates have valid question strings', () => {
      for (const t of WORD_PROBLEM_TEMPLATES) {
        expect(t.template.length).toBeGreaterThan(10);
        if (t.mode !== 'prefix') {
          expect(t.question.length).toBeGreaterThan(5);
        }
      }
    });

    it('prefix-mode templates have empty question field', () => {
      const prefixTemplates = WORD_PROBLEM_TEMPLATES.filter(
        (t) => t.mode === 'prefix',
      );
      expect(prefixTemplates.length).toBeGreaterThan(0);
      for (const t of prefixTemplates) {
        expect(t.question).toBe('');
      }
    });

    it('maxGrade is always >= minGrade when set', () => {
      for (const t of WORD_PROBLEM_TEMPLATES) {
        if (t.maxGrade !== undefined) {
          expect(t.maxGrade).toBeGreaterThanOrEqual(t.minGrade);
        }
      }
    });

    it('has at least 36 templates total', () => {
      expect(WORD_PROBLEM_TEMPLATES.length).toBeGreaterThanOrEqual(36);
    });
  });
});
