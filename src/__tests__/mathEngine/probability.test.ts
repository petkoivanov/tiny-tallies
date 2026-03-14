import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

describe('Probability Handler', () => {
  describe('Grade 7: basic probability', () => {
    it('answer equals the favorable count', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('prob_basic', seed);
        expect(p.operation).toBe('probability');
        const answer = answerNumericValue(p.correctAnswer);
        const [favorable] = p.operands;
        expect(answer).toBe(favorable);
      }
    });

    it('favorable < total', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('prob_basic', seed);
        const [favorable, total] = p.operands;
        expect(favorable).toBeGreaterThanOrEqual(1);
        expect(favorable).toBeLessThan(total);
      }
    });

    it('total is between 5 and 20', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('prob_basic', seed);
        const total = p.operands[1];
        expect(total).toBeGreaterThanOrEqual(5);
        expect(total).toBeLessThanOrEqual(20);
      }
    });

    it('question mentions the denominator', () => {
      for (let seed = 1; seed <= 10; seed++) {
        const p = gen('prob_basic', seed);
        const total = p.operands[1];
        expect(p.questionText).toContain(`denominator is ${total}`);
      }
    });
  });

  describe('Grade 7: complement probability', () => {
    it('answer = total - favorable', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('prob_complement', seed);
        const answer = answerNumericValue(p.correctAnswer);
        const [favorable, total] = p.operands;
        expect(answer).toBe(total - favorable);
      }
    });

    it('answer is positive and less than total', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('prob_complement', seed);
        const answer = answerNumericValue(p.correctAnswer);
        const total = p.operands[1];
        expect(answer).toBeGreaterThanOrEqual(1);
        expect(answer).toBeLessThan(total);
      }
    });

    it('question asks for NOT picking', () => {
      for (let seed = 1; seed <= 10; seed++) {
        const p = gen('prob_complement', seed);
        expect(p.questionText).toContain('NOT picking');
      }
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = ['prob_basic', 'prob_complement'];
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
    it('all probability problems return NumericAnswer', () => {
      const templates = ['prob_basic', 'prob_complement'];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.correctAnswer.type).toBe('numeric');
      }
    });
  });
});
