import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

describe('Decimal Place Value', () => {
  describe('Grade 5: identify decimal digit', () => {
    it('answer is a single digit (0-9)', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pv_decimal_identify', seed);
        expect(p.operation).toBe('place_value');
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThanOrEqual(0);
        expect(answer).toBeLessThanOrEqual(9);
        expect(Number.isInteger(answer)).toBe(true);
      }
    });

    it('question mentions tenths or hundredths', () => {
      let hasTenths = false;
      let hasHundredths = false;
      for (let seed = 1; seed <= 30; seed++) {
        const p = gen('pv_decimal_identify', seed);
        if (p.questionText.includes('tenths')) hasTenths = true;
        if (p.questionText.includes('hundredths')) hasHundredths = true;
      }
      expect(hasTenths).toBe(true);
      expect(hasHundredths).toBe(true);
    });
  });

  describe('Grade 5: decimal decompose', () => {
    it('answer equals number × divisor', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pv_decimal_decompose', seed);
        const [number, divisor] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(Math.round(number * divisor));
        expect(Number.isInteger(answer)).toBe(true);
      }
    });
  });

  describe('Grade 5: compare decimals', () => {
    it('answer is the larger decimal', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pv_decimal_compare', seed);
        const [a, b] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(Math.max(a, b));
      }
    });
  });

  describe('Grade 5: round decimals', () => {
    it('rounds to nearest tenth correctly', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pv_decimal_rounding', seed);
        const answer = answerNumericValue(p.correctAnswer);
        // Answer should be a number with at most 1 decimal place
        expect(Math.round(answer * 10) / 10).toBe(answer);
        expect(p.questionText).toContain('Round');
      }
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = [
        'pv_decimal_identify',
        'pv_decimal_decompose',
        'pv_decimal_compare',
        'pv_decimal_rounding',
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
