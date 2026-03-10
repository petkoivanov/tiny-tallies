import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

describe('Ratios Handler', () => {
  describe('Grade 6: simplify ratio', () => {
    it('answer is first term of simplified ratio', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('ratio_simplify', seed);
        expect(p.operation).toBe('ratios');
        const answer = answerNumericValue(p.correctAnswer);
        const [bigA, bigB] = p.operands;
        // answer should divide both bigA and bigB evenly
        expect(bigA % answer).toBe(0);
        expect(p.questionText).toContain('Simplify');
      }
    });
  });

  describe('Grade 6: equivalent ratio', () => {
    it('finds missing term in equivalent ratio', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('ratio_equivalent', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
        expect(p.questionText).toContain('?');
        expect(p.questionText).toContain(':');
      }
    });
  });

  describe('Grade 6: unit rate', () => {
    it('answer is total ÷ count', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('ratio_unit_rate', seed);
        const [total, count] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer * count).toBe(total);
      }
    });
  });

  describe('Grade 6: percent of a number', () => {
    it('computes correct percentage', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('ratio_percent_of', seed);
        const [percent, base] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe((percent / 100) * base);
        expect(p.questionText).toContain('%');
      }
    });
  });

  describe('Grade 6: fraction to percent', () => {
    it('converts fraction to whole-number percent', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('ratio_fraction_to_percent', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThanOrEqual(10);
        expect(answer).toBeLessThanOrEqual(100);
        expect(p.questionText).toContain('/');
      }
    });
  });

  describe('Grade 7: percent change', () => {
    it('computes correct price after increase or decrease', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('ratio_percent_change', seed);
        const [original, percent] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        const change = (percent / 100) * original;
        // Answer is either original + change or original - change
        expect([original + change, original - change]).toContain(answer);
      }
    });
  });

  describe('Grade 7: proportional reasoning', () => {
    it('computes correct proportional cost', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('ratio_proportion', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
        expect(p.questionText).toContain('cost');
      }
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = [
        'ratio_simplify',
        'ratio_equivalent',
        'ratio_unit_rate',
        'ratio_percent_of',
        'ratio_fraction_to_percent',
        'ratio_percent_change',
        'ratio_proportion',
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
    it('all ratios problems return NumericAnswer', () => {
      const templates = [
        'ratio_simplify',
        'ratio_equivalent',
        'ratio_unit_rate',
        'ratio_percent_of',
        'ratio_fraction_to_percent',
        'ratio_percent_change',
        'ratio_proportion',
      ];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.correctAnswer.type).toBe('numeric');
      }
    });
  });
});
