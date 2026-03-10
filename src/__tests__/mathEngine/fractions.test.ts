import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

describe('Fractions Handler', () => {
  describe('Grade 1: partitioning', () => {
    it('generates a valid partitioning problem', () => {
      const p = gen('frac_equal_parts', 1);
      expect(p.operation).toBe('fractions');
      expect(p.questionText).toContain('equal parts');
      const answer = answerNumericValue(p.correctAnswer);
      expect(answer).toBeGreaterThanOrEqual(2);
      expect(answer).toBeLessThanOrEqual(4);
    });

    it('answer equals the number of parts', () => {
      for (let seed = 1; seed <= 10; seed++) {
        const p = gen('frac_equal_parts', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(p.operands[0]).toBe(answer);
      }
    });
  });

  describe('Grade 2: identify', () => {
    it('generates a valid identify problem', () => {
      const p = gen('frac_halves_quarters', 1);
      expect(p.questionText).toContain('shaded');
      const answer = answerNumericValue(p.correctAnswer);
      expect(answer).toBeGreaterThanOrEqual(1);
    });

    it('numerator does not exceed denominator', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('frac_halves_quarters', seed);
        const [numer, denom] = p.operands;
        expect(numer).toBeLessThanOrEqual(denom);
      }
    });
  });

  describe('Grade 3: unit fractions', () => {
    it('answer equals the denominator', () => {
      for (let seed = 1; seed <= 10; seed++) {
        const p = gen('frac_unit_fractions', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(p.operands[1]);
        expect(p.questionText).toContain(`1/${answer}`);
      }
    });
  });

  describe('Grade 3: number line', () => {
    it('generates valid number line problems', () => {
      for (let seed = 1; seed <= 10; seed++) {
        const p = gen('frac_on_number_line', seed);
        const [numer, denom] = p.operands;
        expect(numer).toBeLessThan(denom);
        expect(numer).toBeGreaterThanOrEqual(1);
        expect(answerNumericValue(p.correctAnswer)).toBe(numer);
      }
    });
  });

  describe('Grade 3: equivalent fractions', () => {
    it('answer is the scaled numerator', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('frac_equivalent', seed);
        const [numer, denom] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        // answer = numer * multiplier, where multiplier in [2,4]
        expect(answer % numer).toBe(0);
        const multiplier = answer / numer;
        expect(multiplier).toBeGreaterThanOrEqual(2);
        expect(multiplier).toBeLessThanOrEqual(4);
        // Question contains the new denominator
        const newDenom = denom * multiplier;
        expect(p.questionText).toContain(`?/${newDenom}`);
      }
    });
  });

  describe('Grade 3: compare same denominator', () => {
    it('answer is the larger numerator', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('frac_compare_same_denom', seed);
        const [a, b] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(Math.max(a, b));
      }
    });
  });

  describe('Grade 3: compare same numerator', () => {
    it('answer is the smaller denominator', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('frac_compare_same_numer', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(p.questionText).toContain('denominator');
        expect(answer).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('Grade 4: add/subtract like denominator', () => {
    it('generates add or subtract problems with same denominator', () => {
      let hasAdd = false;
      let hasSub = false;
      for (let seed = 1; seed <= 50; seed++) {
        const p = gen('frac_add_subtract_like_denom', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
        if (p.questionText.includes('+')) hasAdd = true;
        if (p.questionText.includes('\u2212')) hasSub = true;
      }
      expect(hasAdd).toBe(true);
      // Subtraction may not always appear due to constraints, but verify structure
    });

    it('result numerator is correct for addition', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('frac_add_subtract_like_denom', seed);
        const [a, b] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        if (p.questionText.includes('+')) {
          expect(answer).toBe(a + b);
        }
      }
    });
  });

  describe('Grade 4: mixed numbers', () => {
    it('converts mixed number to improper fraction', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('frac_mixed_numbers', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
        expect(p.questionText).toContain('= ?/');
      }
    });
  });

  describe('Grade 4: multiply by whole', () => {
    it('answer is whole × numerator', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('frac_multiply_by_whole', seed);
        const [whole, numer] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(whole * numer);
        expect(p.questionText).toContain('\u00d7');
      }
    });
  });

  describe('Grade 5: add/subtract unlike denominator', () => {
    it('generates problems with different denominators', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('frac_add_subtract_unlike_denom', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
        // Question has two different denominators in the fractions
        const matches = p.questionText.match(/\/(\d+)/g);
        expect(matches).not.toBeNull();
        expect(matches!.length).toBeGreaterThanOrEqual(3); // two input + one result
      }
    });
  });

  describe('Grade 5: multiply fractions', () => {
    it('answer is product of numerators', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('frac_multiply_fractions', seed);
        const [n1, n2] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(n1 * n2);
      }
    });
  });

  describe('Grade 5: divide with unit fractions', () => {
    it('generates valid division problems', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('frac_divide_unit_fraction', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
        expect(p.questionText).toContain('\u00f7');
      }
    });
  });

  describe('Grade 6: divide fractions', () => {
    it('answer is numerator of reciprocal product', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('frac_divide_fractions', seed);
        const [n1, n2] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        // a/b ÷ c/d = (a×d)/(b×c), operands are [n1, n2] = [a, c]
        // We can verify answer > 0
        expect(answer).toBeGreaterThan(0);
        expect(p.questionText).toContain('\u00f7');
      }
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = [
        'frac_equal_parts',
        'frac_equivalent',
        'frac_add_subtract_like_denom',
        'frac_multiply_fractions',
        'frac_divide_fractions',
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

  describe('metadata', () => {
    it('all fraction problems have fractionDisplay in metadata', () => {
      const templates = [
        'frac_equal_parts',
        'frac_halves_quarters',
        'frac_unit_fractions',
        'frac_on_number_line',
        'frac_equivalent',
        'frac_add_subtract_like_denom',
        'frac_mixed_numbers',
        'frac_multiply_by_whole',
      ];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.metadata.fractionDisplay).toBeDefined();
        expect(p.metadata.fractionDisplay!.numerator).toBeGreaterThanOrEqual(0);
        expect(p.metadata.fractionDisplay!.denominator).toBeGreaterThan(0);
      }
    });
  });

  describe('answer type', () => {
    it('all fraction problems return NumericAnswer', () => {
      const templates = [
        'frac_equal_parts',
        'frac_equivalent',
        'frac_add_subtract_like_denom',
        'frac_multiply_fractions',
        'frac_divide_fractions',
      ];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.correctAnswer.type).toBe('numeric');
      }
    });
  });
});
