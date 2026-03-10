import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

describe('Patterns Handler', () => {
  describe('Grade 1: find next in sequence', () => {
    it('generates a valid additive sequence', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pat_number_patterns', seed);
        expect(p.operation).toBe('patterns');
        const [lastShown, step] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(lastShown + step);
        expect(p.questionText).toContain('What comes next?');
      }
    });
  });

  describe('Grade 2: skip counting patterns', () => {
    it('generates sequences with consistent step', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pat_skip_counting_patterns', seed);
        const [lastShown, step] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(lastShown + step);
        expect(step).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('Grade 1: missing addend', () => {
    it('question has the form "? + N = M" or "N + ? = M"', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pat_missing_addend', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThanOrEqual(1);
        expect(p.questionText).toContain('?');
        expect(p.questionText).toContain('+');
        expect(p.questionText).toContain('=');
      }
    });

    it('answer satisfies the equation', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pat_missing_addend', seed);
        const [a, b] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        // answer is either a or b
        expect([a, b]).toContain(answer);
        // and a + b equals the sum shown in the question
        const match = p.questionText.match(/= (\d+)/);
        expect(match).not.toBeNull();
        expect(a + b).toBe(Number(match![1]));
      }
    });
  });

  describe('Grade 3: missing factor', () => {
    it('answer satisfies the multiplication equation', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pat_missing_factor', seed);
        const [a, b] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect([a, b]).toContain(answer);
        const match = p.questionText.match(/= (\d+)/);
        expect(match).not.toBeNull();
        expect(a * b).toBe(Number(match![1]));
      }
    });

    it('question uses multiplication symbol', () => {
      const p = gen('pat_missing_factor', 1);
      expect(p.questionText).toContain('\u00d7');
    });
  });

  describe('Grade 4: input/output tables', () => {
    it('generates valid I/O table with rule', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('pat_input_output', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeDefined();
        expect(p.questionText).toContain('Rule:');
        expect(p.questionText).toContain('→ ?');
      }
    });

    it('rule types include add, subtract, or multiply', () => {
      let hasAdd = false;
      let hasSub = false;
      let hasMul = false;
      for (let seed = 1; seed <= 50; seed++) {
        const p = gen('pat_input_output', seed);
        if (p.questionText.includes('add')) hasAdd = true;
        if (p.questionText.includes('subtract')) hasSub = true;
        if (p.questionText.includes('multiply')) hasMul = true;
      }
      expect(hasAdd).toBe(true);
      expect(hasSub).toBe(true);
      expect(hasMul).toBe(true);
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = [
        'pat_number_patterns',
        'pat_skip_counting_patterns',
        'pat_missing_addend',
        'pat_missing_factor',
        'pat_input_output',
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
    it('all patterns problems return NumericAnswer', () => {
      const templates = [
        'pat_number_patterns',
        'pat_skip_counting_patterns',
        'pat_missing_addend',
        'pat_missing_factor',
        'pat_input_output',
      ];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.correctAnswer.type).toBe('numeric');
      }
    });
  });
});
