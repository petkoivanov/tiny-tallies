import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

describe('Time Handler', () => {
  describe('Grade 1: read hours', () => {
    it('answer is the hour (1-12)', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('time_read_hours', seed);
        expect(p.operation).toBe('time');
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThanOrEqual(1);
        expect(answer).toBeLessThanOrEqual(12);
        expect(p.questionText).toContain('What hour');
      }
    });

    it('minutes are always 0 for hour precision', () => {
      for (let seed = 1; seed <= 10; seed++) {
        const p = gen('time_read_hours', seed);
        expect(p.operands[1]).toBe(0);
      }
    });
  });

  describe('Grade 1: read half hours', () => {
    it('answer is 0 or 30 minutes', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('time_read_half_hours', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect([0, 30]).toContain(answer);
        expect(p.questionText).toContain('minutes');
      }
    });
  });

  describe('Grade 2: read quarter hours', () => {
    it('answer is 0, 15, 30, or 45', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('time_read_quarter_hours', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect([0, 15, 30, 45]).toContain(answer);
      }
    });
  });

  describe('Grade 2: read five minutes', () => {
    it('answer is a multiple of 5', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('time_read_five_minutes', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer % 5).toBe(0);
        expect(answer).toBeGreaterThanOrEqual(0);
        expect(answer).toBeLessThanOrEqual(55);
      }
    });
  });

  describe('Grade 2: AM/PM', () => {
    it('answer is elapsed hours', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('time_am_pm', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThanOrEqual(1);
        expect(answer).toBeLessThanOrEqual(6);
        expect(p.questionText).toContain('AM');
      }
    });
  });

  describe('Grade 3: read one minute', () => {
    it('answer is 0-59', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('time_read_one_minute', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThanOrEqual(0);
        expect(answer).toBeLessThanOrEqual(59);
      }
    });
  });

  describe('Grade 3: elapsed time', () => {
    it('answer is elapsed minutes', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('time_elapsed', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
        expect(answer % 5).toBe(0);
        expect(p.questionText).toContain('minutes passed');
      }
    });
  });

  describe('metadata', () => {
    it('clock-reading problems have displayTime', () => {
      const templates = [
        'time_read_hours',
        'time_read_half_hours',
        'time_read_quarter_hours',
        'time_read_five_minutes',
        'time_read_one_minute',
      ];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.metadata.displayTime).toBeDefined();
        expect(p.metadata.displayTime!.hours).toBeGreaterThanOrEqual(1);
        expect(p.metadata.displayTime!.hours).toBeLessThanOrEqual(12);
      }
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = [
        'time_read_hours',
        'time_read_half_hours',
        'time_am_pm',
        'time_elapsed',
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
    it('all time problems return NumericAnswer', () => {
      const templates = [
        'time_read_hours',
        'time_read_half_hours',
        'time_read_quarter_hours',
        'time_read_five_minutes',
        'time_am_pm',
        'time_read_one_minute',
        'time_elapsed',
      ];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.correctAnswer.type).toBe('numeric');
      }
    });
  });
});
