import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

describe('Number Theory Handler', () => {
  describe('Grade 6: GCF', () => {
    it('answer is the greatest common factor of the two operands', () => {
      for (let seed = 1; seed <= 30; seed++) {
        const p = gen('nt_gcf', seed);
        expect(p.operation).toBe('number_theory');
        const answer = answerNumericValue(p.correctAnswer);
        const [num1, num2] = p.operands;
        expect(answer).toBe(gcd(num1, num2));
      }
    });

    it('GCF is at least 2', () => {
      for (let seed = 1; seed <= 30; seed++) {
        const p = gen('nt_gcf', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThanOrEqual(2);
      }
    });

    it('both operands are positive', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('nt_gcf', seed);
        expect(p.operands[0]).toBeGreaterThan(0);
        expect(p.operands[1]).toBeGreaterThan(0);
      }
    });
  });

  describe('Grade 6: LCM', () => {
    it('answer is the least common multiple of the two operands', () => {
      for (let seed = 1; seed <= 30; seed++) {
        const p = gen('nt_lcm', seed);
        const answer = answerNumericValue(p.correctAnswer);
        const [a, b] = p.operands;
        expect(answer).toBe((a * b) / gcd(a, b));
      }
    });

    it('answer is divisible by both operands', () => {
      for (let seed = 1; seed <= 30; seed++) {
        const p = gen('nt_lcm', seed);
        const answer = answerNumericValue(p.correctAnswer);
        const [a, b] = p.operands;
        expect(answer % a).toBe(0);
        expect(answer % b).toBe(0);
      }
    });

    it('operands are between 2 and 12', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('nt_lcm', seed);
        const [a, b] = p.operands;
        expect(a).toBeGreaterThanOrEqual(2);
        expect(a).toBeLessThanOrEqual(12);
        expect(b).toBeGreaterThanOrEqual(2);
        expect(b).toBeLessThanOrEqual(12);
      }
    });
  });

  describe('Grade 6: absolute value', () => {
    it('answer = |n|', () => {
      for (let seed = 1; seed <= 30; seed++) {
        const p = gen('nt_absolute_value', seed);
        const answer = answerNumericValue(p.correctAnswer);
        const n = p.operands[0];
        expect(answer).toBe(Math.abs(n));
      }
    });

    it('answer is always positive', () => {
      for (let seed = 1; seed <= 30; seed++) {
        const p = gen('nt_absolute_value', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
      }
    });

    it('operand is never zero', () => {
      for (let seed = 1; seed <= 30; seed++) {
        const p = gen('nt_absolute_value', seed);
        expect(p.operands[0]).not.toBe(0);
      }
    });

    it('operand range is -20 to 20', () => {
      for (let seed = 1; seed <= 30; seed++) {
        const p = gen('nt_absolute_value', seed);
        expect(p.operands[0]).toBeGreaterThanOrEqual(-20);
        expect(p.operands[0]).toBeLessThanOrEqual(20);
      }
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = ['nt_gcf', 'nt_lcm', 'nt_absolute_value'];
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
    it('all number theory problems return NumericAnswer', () => {
      const templates = ['nt_gcf', 'nt_lcm', 'nt_absolute_value'];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.correctAnswer.type).toBe('numeric');
      }
    });
  });
});
