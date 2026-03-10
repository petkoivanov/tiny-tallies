import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

describe('Place Value Handler', () => {
  describe('Grade 1: decompose (ones/tens)', () => {
    it('generates a valid decompose problem', () => {
      const p = gen('pv_ones_tens', 1);
      expect(p.operation).toBe('place_value');
      expect(p.questionText).toMatch(/How many (ones|tens) are in \d+/);
    });

    it('answer is the correct digit', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pv_ones_tens', seed);
        const answer = answerNumericValue(p.correctAnswer);
        const [number, place] = p.operands;
        const digits = String(number).split('').reverse().map(Number);
        expect(answer).toBe(digits[place]);
        expect(answer).toBeGreaterThanOrEqual(0);
        expect(answer).toBeLessThanOrEqual(9);
      }
    });
  });

  describe('Grade 2: identify digit', () => {
    it('generates valid identify digit problems for 3-digit numbers', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pv_hundreds', seed);
        const answer = answerNumericValue(p.correctAnswer);
        const [number, place] = p.operands;
        expect(number).toBeGreaterThanOrEqual(100);
        expect(number).toBeLessThanOrEqual(999);
        const digits = String(number).split('').reverse().map(Number);
        expect(answer).toBe(digits[place]);
      }
    });
  });

  describe('Grade 2: read/write numbers', () => {
    it('answer is the composed number', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pv_to_1000', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThanOrEqual(100);
        expect(answer).toBeLessThanOrEqual(999);
        expect(p.questionText).toContain('What number has');
      }
    });

    it('question mentions place names', () => {
      for (let seed = 1; seed <= 10; seed++) {
        const p = gen('pv_to_1000', seed);
        // Should mention at least one place name
        expect(p.questionText).toMatch(/ones|tens|hundreds/);
      }
    });
  });

  describe('Grade 2: comparing', () => {
    it('answer is the larger number', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pv_comparing', seed);
        const [a, b] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(Math.max(a, b));
        expect(a).not.toBe(b);
      }
    });

    it('question asks which is greater', () => {
      const p = gen('pv_comparing', 1);
      expect(p.questionText).toContain('Which is greater');
    });
  });

  describe('Grade 2: skip counting', () => {
    it('generates valid skip counting sequences', () => {
      const validSteps = [2, 5, 10, 100];
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pv_skip_counting', seed);
        const [lastShown, step] = p.operands;
        expect(validSteps).toContain(step);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(lastShown + step);
      }
    });

    it('question shows a sequence', () => {
      const p = gen('pv_skip_counting', 1);
      expect(p.questionText).toContain('What comes next?');
      expect(p.questionText).toContain(', ?');
    });
  });

  describe('Grade 3: rounding', () => {
    it('rounds correctly to nearest 10 or 100', () => {
      for (let seed = 1; seed <= 30; seed++) {
        const p = gen('pv_rounding_10_100', seed);
        const [number, roundTo] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect([10, 100]).toContain(roundTo);
        expect(answer).toBe(Math.round(number / roundTo) * roundTo);
      }
    });

    it('question mentions the rounding target', () => {
      for (let seed = 1; seed <= 10; seed++) {
        const p = gen('pv_rounding_10_100', seed);
        const roundTo = p.operands[1];
        expect(p.questionText).toContain(`nearest ${roundTo}`);
      }
    });
  });

  describe('Grade 4: identify digit (4-digit numbers)', () => {
    it('handles 4-digit numbers', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pv_to_10000', seed);
        const [number, place] = p.operands;
        expect(number).toBeGreaterThanOrEqual(1000);
        expect(number).toBeLessThanOrEqual(9999);
        const digits = String(number).split('').reverse().map(Number);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(digits[place]);
      }
    });
  });

  describe('Grade 4: expanded form', () => {
    it('generates valid expanded form problems', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pv_expanded_form', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
        // Question has either "= ?" (compose) or contains "?" within expanded (missing term)
        expect(p.questionText).toContain('?');
      }
    });

    it('compose variant: answer equals the full number', () => {
      let foundCompose = false;
      for (let seed = 1; seed <= 50; seed++) {
        const p = gen('pv_expanded_form', seed);
        if (p.questionText.endsWith('= ?')) {
          foundCompose = true;
          const answer = answerNumericValue(p.correctAnswer);
          // Answer should be a 4-digit number
          expect(answer).toBeGreaterThanOrEqual(1000);
          expect(answer).toBeLessThanOrEqual(9999);
          // Verify expanded terms sum to answer
          const terms = p.questionText
            .replace(' = ?', '')
            .split(' + ')
            .map(Number);
          expect(terms.reduce((s, t) => s + t, 0)).toBe(answer);
        }
      }
      expect(foundCompose).toBe(true);
    });

    it('missing term variant: answer is a valid place value term', () => {
      let foundMissing = false;
      for (let seed = 1; seed <= 50; seed++) {
        const p = gen('pv_expanded_form', seed);
        if (!p.questionText.endsWith('= ?') && p.questionText.includes('?')) {
          foundMissing = true;
          const answer = answerNumericValue(p.correctAnswer);
          // Answer should be a place value term (ones, tens, hundreds, or thousands)
          expect(answer).toBeGreaterThan(0);
          expect(answer).toBeLessThanOrEqual(9000);
        }
      }
      expect(foundMissing).toBe(true);
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = [
        'pv_ones_tens',
        'pv_hundreds',
        'pv_to_1000',
        'pv_comparing',
        'pv_skip_counting',
        'pv_rounding_10_100',
        'pv_to_10000',
        'pv_expanded_form',
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
    it('all place value problems return NumericAnswer', () => {
      const templates = [
        'pv_ones_tens',
        'pv_hundreds',
        'pv_to_1000',
        'pv_comparing',
        'pv_skip_counting',
        'pv_rounding_10_100',
        'pv_to_10000',
        'pv_expanded_form',
      ];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.correctAnswer.type).toBe('numeric');
      }
    });
  });
});
