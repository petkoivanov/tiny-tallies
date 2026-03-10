import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

describe('Measurement Handler', () => {
  describe('Grade 4: convert larger to smaller units', () => {
    it('answer is value × factor', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('meas_convert_down', seed);
        expect(p.operation).toBe('measurement');
        const [value, factor] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(value * factor);
      }
    });

    it('question contains unit names', () => {
      for (let seed = 1; seed <= 10; seed++) {
        const p = gen('meas_convert_down', seed);
        expect(p.questionText).toContain('=');
        expect(p.questionText).toContain('?');
      }
    });
  });

  describe('Grade 4: convert smaller to larger units', () => {
    it('answer is value ÷ factor (exact division)', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('meas_convert_up', seed);
        const [value, factor] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(value / factor);
        expect(Number.isInteger(answer)).toBe(true);
      }
    });
  });

  describe('Grade 4-5: compare measurements', () => {
    it('generates valid comparison problems', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('meas_compare', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThanOrEqual(0);
        expect(p.questionText).toContain('away from');
      }
    });
  });

  describe('Grade 5: metric conversions', () => {
    it('generates valid metric conversion problems', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('meas_metric', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
        expect(p.questionText).toContain('=');
      }
    });

    it('covers both directions (up and down)', () => {
      let hasLarge = false;
      let hasSmall = false;
      for (let seed = 1; seed <= 50; seed++) {
        const p = gen('meas_metric', seed);
        const answer = answerNumericValue(p.correctAnswer);
        if (answer >= 100) hasLarge = true;
        if (answer <= 15) hasSmall = true;
      }
      expect(hasLarge).toBe(true);
      expect(hasSmall).toBe(true);
    });
  });

  describe('Grade 5: multi-step measurement', () => {
    it('generates word problems with valid answers', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('meas_multi_step', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
        expect(p.questionText).toContain('remain');
      }
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = [
        'meas_convert_down',
        'meas_convert_up',
        'meas_compare',
        'meas_metric',
        'meas_multi_step',
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
    it('all measurement problems return NumericAnswer', () => {
      const templates = [
        'meas_convert_down',
        'meas_convert_up',
        'meas_compare',
        'meas_metric',
        'meas_multi_step',
      ];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.correctAnswer.type).toBe('numeric');
      }
    });
  });
});
