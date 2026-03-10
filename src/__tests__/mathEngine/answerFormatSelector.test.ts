import {
  freeTextProbability,
  mcOptionCount,
  selectAndFormatAnswer,
} from '../../services/mathEngine/answerFormats/answerFormatSelector';
import { generateProblem } from '../../services/mathEngine/generator';

describe('Answer Format Selector', () => {
  describe('freeTextProbability', () => {
    it('returns ~5% at Elo 600', () => {
      const p = freeTextProbability(600);
      expect(p).toBeGreaterThan(0);
      expect(p).toBeLessThan(0.1);
    });

    it('returns ~50% at Elo 1000', () => {
      const p = freeTextProbability(1000);
      expect(p).toBeCloseTo(0.5, 1);
    });

    it('returns ~95% at Elo 1400', () => {
      const p = freeTextProbability(1400);
      expect(p).toBeGreaterThan(0.9);
      expect(p).toBeLessThanOrEqual(1);
    });

    it('monotonically increases with Elo', () => {
      let prev = 0;
      for (let elo = 600; elo <= 1400; elo += 50) {
        const p = freeTextProbability(elo);
        expect(p).toBeGreaterThanOrEqual(prev);
        prev = p;
      }
    });
  });

  describe('mcOptionCount', () => {
    it('returns 4 for Elo < 950', () => {
      expect(mcOptionCount(800)).toBe(4);
      expect(mcOptionCount(949)).toBe(4);
    });

    it('returns 5 for 950 ≤ Elo < 1100', () => {
      expect(mcOptionCount(950)).toBe(5);
      expect(mcOptionCount(1050)).toBe(5);
      expect(mcOptionCount(1099)).toBe(5);
    });

    it('returns 6 for Elo ≥ 1100', () => {
      expect(mcOptionCount(1100)).toBe(6);
      expect(mcOptionCount(1400)).toBe(6);
    });
  });

  describe('selectAndFormatAnswer', () => {
    const problem = generateProblem({
      templateId: 'add_single_digit_no_carry',
      seed: 42,
    });

    it('returns a valid formatted problem', () => {
      const result = selectAndFormatAnswer(problem, 900, 42);
      expect(result.problem).toBe(problem);
      expect(['multiple_choice', 'free_text']).toContain(result.format);
    });

    it('at low Elo, mostly returns MC', () => {
      let mcCount = 0;
      for (let i = 0; i < 100; i++) {
        const result = selectAndFormatAnswer(problem, 700, i);
        if (result.format === 'multiple_choice') mcCount++;
      }
      expect(mcCount).toBeGreaterThan(85);
    });

    it('at high Elo, mostly returns free text', () => {
      let ftCount = 0;
      for (let i = 0; i < 100; i++) {
        const result = selectAndFormatAnswer(problem, 1400, i);
        if (result.format === 'free_text') ftCount++;
      }
      expect(ftCount).toBeGreaterThan(85);
    });

    it('MC at low Elo has 4 options', () => {
      for (let i = 0; i < 50; i++) {
        const result = selectAndFormatAnswer(problem, 800, i);
        if (result.format === 'multiple_choice') {
          expect(result.options).toHaveLength(4);
          break;
        }
      }
    });

    it('MC at high Elo has 6 options', () => {
      // At 1100+ Elo, MC should have 6 options when it does appear
      for (let i = 0; i < 200; i++) {
        const result = selectAndFormatAnswer(problem, 1100, i);
        if (result.format === 'multiple_choice') {
          expect(result.options).toHaveLength(6);
          break;
        }
      }
    });

    it('is deterministic with the same seed', () => {
      const r1 = selectAndFormatAnswer(problem, 900, 123);
      const r2 = selectAndFormatAnswer(problem, 900, 123);
      expect(r1.format).toBe(r2.format);
    });
  });
});
