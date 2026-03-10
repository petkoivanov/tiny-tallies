import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

describe('Exponents Handler', () => {
  describe('Grade 5: squares', () => {
    it('answer is base²', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('exp_square', seed);
        expect(p.operation).toBe('exponents');
        const [base] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(base * base);
        expect(p.questionText).toContain('\u00B2');
      }
    });
  });

  describe('Grade 5: cubes', () => {
    it('answer is base³', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('exp_cube', seed);
        const [base] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(base * base * base);
        expect(p.questionText).toContain('\u00B3');
      }
    });
  });

  describe('Grade 5: powers of 10', () => {
    it('answer is 10^exp', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('exp_power_of_10', seed);
        const [, exp] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(Math.pow(10, exp));
        expect(p.questionText).toContain('10');
      }
    });
  });

  describe('Grade 6: evaluate exponents', () => {
    it('answer is base^exp', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('exp_evaluate', seed);
        const [base, exp] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(Math.pow(base, exp));
      }
    });

    it('exponent is between 2 and 4', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('exp_evaluate', seed);
        const [, exp] = p.operands;
        expect(exp).toBeGreaterThanOrEqual(2);
        expect(exp).toBeLessThanOrEqual(4);
      }
    });
  });

  describe('Grade 6: square roots', () => {
    it('answer is √(perfect square)', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('exp_square_root', seed);
        const [square, root] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(root);
        expect(root * root).toBe(square);
        expect(p.questionText).toContain('\u221A');
      }
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = [
        'exp_square',
        'exp_cube',
        'exp_power_of_10',
        'exp_evaluate',
        'exp_square_root',
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

  describe('answer type', () => {
    it('all exponents problems return NumericAnswer', () => {
      const templates = [
        'exp_square',
        'exp_cube',
        'exp_power_of_10',
        'exp_evaluate',
        'exp_square_root',
      ];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.correctAnswer.type).toBe('numeric');
      }
    });
  });
});
