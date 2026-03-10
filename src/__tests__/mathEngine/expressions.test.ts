import { generateProblem } from '@/services/mathEngine/generator';
import { answerNumericValue } from '@/services/mathEngine/types';

function gen(templateId: string, seed: number) {
  return generateProblem({ templateId, seed });
}

describe('Expressions Handler (Order of Operations)', () => {
  describe('Grade 5: two operations', () => {
    it('evaluates with correct operator precedence', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('expr_two_ops', seed);
        expect(p.operation).toBe('expressions');
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThanOrEqual(0);
        // Left-to-right result (stored in operands[0]) should differ
        expect(p.operands[0]).not.toBe(answer);
      }
    });

    it('question contains × or ÷ mixed with + or −', () => {
      for (let seed = 1; seed <= 10; seed++) {
        const p = gen('expr_two_ops', seed);
        const hasMul = p.questionText.includes('\u00d7');
        const hasDiv = p.questionText.includes('\u00f7');
        expect(hasMul || hasDiv).toBe(true);
      }
    });
  });

  describe('Grade 5: parentheses', () => {
    it('evaluates parenthesized expressions', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('expr_parentheses', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThanOrEqual(0);
        expect(p.questionText).toContain('(');
        expect(p.questionText).toContain(')');
      }
    });
  });

  describe('Grade 5: three operations', () => {
    it('evaluates three-operation expressions', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('expr_three_ops', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThanOrEqual(0);
        expect(p.questionText).toContain('\u00d7');
      }
    });
  });

  describe('Grade 5: with division', () => {
    it('evaluates expressions containing division', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('expr_with_division', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
        expect(p.questionText).toContain('\u00f7');
      }
    });
  });

  describe('Grade 5: nested parentheses', () => {
    it('evaluates nested parenthesized expressions', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const p = gen('expr_nested_parens', seed);
        const answer = answerNumericValue(p.correctAnswer);
        expect(answer).toBeGreaterThan(0);
        // Should have at least 2 pairs of parens
        const openParens = (p.questionText.match(/\(/g) || []).length;
        expect(openParens).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('operands store expression data', () => {
    it('operands has more than 2 elements', () => {
      const p = gen('expr_two_ops', 1);
      expect(p.operands.length).toBeGreaterThan(2);
    });
  });

  describe('deterministic generation', () => {
    it('same seed produces same problem', () => {
      const templates = [
        'expr_two_ops',
        'expr_parentheses',
        'expr_three_ops',
        'expr_with_division',
        'expr_nested_parens',
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
    it('all expressions return NumericAnswer', () => {
      const templates = [
        'expr_two_ops',
        'expr_parentheses',
        'expr_three_ops',
        'expr_with_division',
        'expr_nested_parens',
      ];
      for (const templateId of templates) {
        const p = gen(templateId, 1);
        expect(p.correctAnswer.type).toBe('numeric');
      }
    });
  });
});
