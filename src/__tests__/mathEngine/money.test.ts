import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

describe('Money Handler', () => {
  describe('Grade 1: coin identification', () => {
    it('answer is the coin value in cents', () => {
      const validValues = [1, 5, 10, 25];
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('money_coin_id', seed);
        expect(p.operation).toBe('money');
        const answer = answerNumericValue(p.correctAnswer);
        expect(validValues).toContain(answer);
        expect(p.questionText).toContain('cents');
      }
    });
  });

  describe('Grade 1: count same-type coins', () => {
    it('answer is coin value × count', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('money_count_same_type', seed);
        const [coinValue, count] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(coinValue * count);
        expect(p.questionText).toContain('cents');
      }
    });
  });

  describe('Grade 2: count mixed coins', () => {
    it('answer is total cents from two coin types', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('money_count_mixed', seed);
        const [value1, value2] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(value1 + value2);
        expect(p.questionText).toContain('total');
      }
    });
  });

  describe('Grade 2: dollar/cent notation', () => {
    it('answer is the cent value', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('money_notation', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThanOrEqual(1);
        expect(answer).toBeLessThanOrEqual(999);
        expect(p.questionText).toContain('cents');
      }
    });

    it('question shows dollar notation for values >= 100', () => {
      let foundDollar = false;
      for (let seed = 1; seed <= 50; seed++) {
        const p = gen('money_notation', seed);
        if (p.questionText.includes('$')) {
          foundDollar = true;
          break;
        }
      }
      expect(foundDollar).toBe(true);
    });
  });

  describe('Grade 2: making change', () => {
    it('answer is paid - cost', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('money_change_simple', seed);
        const [paid, cost] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(paid - cost);
        expect(answer).toBeGreaterThan(0);
      }
    });
  });

  describe('Grade 3: multi-step', () => {
    it('answer is total cost of all items', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('money_multi_step', seed);
        const [v1, v2] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBe(v1 + v2);
        expect(p.questionText).toContain('total');
      }
    });
  });

  describe('Grade 4: unit pricing', () => {
    it('answer divides evenly into total', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('money_unit_price', seed);
        const [total, count] = p.operands;
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer * count).toBe(total);
        expect(p.questionText).toContain('apple');
      }
    });
  });

  describe('metadata', () => {
    it('coin problems have coinSet metadata', () => {
      const templates = ['money_coin_id', 'money_count_same_type', 'money_count_mixed'];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.metadata.coinSet).toBeDefined();
        expect(p.metadata.coinSet!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = [
        'money_coin_id',
        'money_count_same_type',
        'money_change_simple',
        'money_unit_price',
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
    it('all money problems return NumericAnswer', () => {
      const templates = [
        'money_coin_id',
        'money_count_same_type',
        'money_count_mixed',
        'money_notation',
        'money_change_simple',
        'money_multi_step',
        'money_unit_price',
      ];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.correctAnswer.type).toBe('numeric');
      }
    });
  });
});
