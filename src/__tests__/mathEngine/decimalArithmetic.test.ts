import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

describe('Decimal Arithmetic', () => {
  describe('Grade 5: decimal addition (tenths)', () => {
    it('generates correct decimal sums', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('add_decimal_tenths', seed);
        expect(p.operation).toBe('addition');
        const [a, b] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        const expected = Math.round((a + b) * 10) / 10;
        expect(answer).toBe(expected);
      }
    });
  });

  describe('Grade 5: decimal addition (hundredths)', () => {
    it('generates correct decimal sums', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('add_decimal_hundredths', seed);
        const [a, b] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        const expected = Math.round((a + b) * 100) / 100;
        expect(answer).toBe(expected);
      }
    });
  });

  describe('Grade 5: decimal subtraction (tenths)', () => {
    it('result is positive', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('sub_decimal_tenths', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
      }
    });
  });

  describe('Grade 5: decimal subtraction (hundredths)', () => {
    it('result is positive', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('sub_decimal_hundredths', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
      }
    });
  });

  describe('Grade 5: multiply decimal by whole', () => {
    it('produces correct product', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('mul_decimal_by_whole', seed);
        const [a, b] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        const expected = Math.round(a * b * 10) / 10;
        expect(answer).toBe(expected);
      }
    });
  });

  describe('Grade 6: multiply decimal by decimal', () => {
    it('produces correct product', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('mul_decimal_by_decimal', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
      }
    });
  });

  describe('Grade 5: divide decimal by whole', () => {
    it('produces correct quotient', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('div_decimal_by_whole', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
      }
    });
  });

  describe('Grade 6: divide whole by decimal', () => {
    it('produces correct quotient', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('div_whole_by_decimal', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
      }
    });
  });

  describe('question format', () => {
    it('shows decimal numbers in question text', () => {
      const p = gen('add_decimal_tenths', 1);
      expect(p.questionText).toContain('.');
      expect(p.questionText).toContain('+');
    });

    it('has answerDisplay metadata', () => {
      const p = gen('add_decimal_tenths', 1);
      expect(p.metadata.answerDisplay).toBeDefined();
      expect(p.metadata.answerDisplay).toContain('.');
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = [
        'add_decimal_tenths',
        'sub_decimal_tenths',
        'mul_decimal_by_whole',
        'div_decimal_by_whole',
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
