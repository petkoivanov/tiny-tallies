import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

describe('Integer Arithmetic (Negative Numbers)', () => {
  describe('Grade 6: add integers', () => {
    it('correctly adds positive and negative numbers', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('add_integers', seed);
        const [a, b] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(a + b);
      }
    });

    it('includes negative operands', () => {
      let hasNegative = false;
      for (let seed = 1; seed <= 50; seed++) {
        const p = gen('add_integers', seed);
        const [a, b] = p.operands;
        if (a < 0 || b < 0) hasNegative = true;
      }
      expect(hasNegative).toBe(true);
    });

    it('question wraps negatives in parentheses', () => {
      let foundParens = false;
      for (let seed = 1; seed <= 50; seed++) {
        const p = gen('add_integers', seed);
        if (p.questionText.includes('(')) {
          foundParens = true;
          break;
        }
      }
      expect(foundParens).toBe(true);
    });
  });

  describe('Grade 6: subtract integers', () => {
    it('correctly subtracts integers', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('sub_integers', seed);
        const [a, b] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(a - b);
      }
    });

    it('can produce negative results', () => {
      let hasNegativeResult = false;
      for (let seed = 1; seed <= 50; seed++) {
        const p = gen('sub_integers', seed);
        const answer = answerNumericValue(p.correctAnswer);
        if (answer < 0) hasNegativeResult = true;
      }
      expect(hasNegativeResult).toBe(true);
    });
  });

  describe('Grade 7: multiply integers', () => {
    it('correctly multiplies integers', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('mul_integers', seed);
        const [a, b] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(a * b);
      }
    });

    it('negative × negative = positive', () => {
      let foundBothNeg = false;
      for (let seed = 1; seed <= 100; seed++) {
        const p = gen('mul_integers', seed);
        const [a, b] = p.operands;
        if (a < 0 && b < 0) {
          const answer = answerNumericValue(p.correctAnswer);
          expect(answer).toBeGreaterThan(0);
          foundBothNeg = true;
          break;
        }
      }
      expect(foundBothNeg).toBe(true);
    });
  });

  describe('Grade 7: divide integers', () => {
    it('correctly divides integers with exact results', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('div_integers', seed);
        const [a, b] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(a / b);
        expect(Number.isInteger(answer)).toBe(true);
      }
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = [
        'add_integers',
        'sub_integers',
        'mul_integers',
        'div_integers',
      ];
      for (const templateId of templates) {
        const a = gen(templateId, 42);
        const b = gen(templateId, 42);
        expect(a.questionText).toBe(b.questionText);
        expect(answerNumericValue(a.correctAnswer)).toBe(
          answerNumericValue(b.correctAnswer),
        );
      }
    });
  });
});
