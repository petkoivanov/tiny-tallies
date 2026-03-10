import { generateProblem } from '../../services/mathEngine/generator';
import { DIVISION_TEMPLATES } from '../../services/mathEngine/templates/division';
import { answerNumericValue } from '../../services/mathEngine/types';

describe.each(DIVISION_TEMPLATES)(
  'Division template: $id',
  (template) => {
    const baseSeed = DIVISION_TEMPLATES.indexOf(template) * 1000 + 30000;

    it('generates 20 problems without error', () => {
      for (let i = 1; i <= 20; i++) {
        expect(() =>
          generateProblem({ templateId: template.id, seed: baseSeed + i }),
        ).not.toThrow();
      }
    });

    it('divisor is never zero', () => {
      for (let i = 1; i <= 20; i++) {
        const problem = generateProblem({
          templateId: template.id,
          seed: baseSeed + i,
        });
        expect(problem.operands[1]).toBeGreaterThan(0);
      }
    });

    it('correct answer equals a ÷ b (exact division)', () => {
      for (let i = 1; i <= 20; i++) {
        const problem = generateProblem({
          templateId: template.id,
          seed: baseSeed + i,
        });

        expect(answerNumericValue(problem.correctAnswer)).toBe(
          problem.operands[0] / problem.operands[1],
        );
        expect(Number.isInteger(answerNumericValue(problem.correctAnswer))).toBe(true);
      }
    });

    it('dividend is divisible by divisor', () => {
      for (let i = 1; i <= 20; i++) {
        const problem = generateProblem({
          templateId: template.id,
          seed: baseSeed + i,
        });
        expect(problem.operands[0] % problem.operands[1]).toBe(0);
      }
    });

    it('question text uses ÷ symbol', () => {
      const problem = generateProblem({
        templateId: template.id,
        seed: baseSeed + 1,
      });
      expect(problem.questionText).toContain('÷');
    });

    it('has operation set to division', () => {
      const problem = generateProblem({
        templateId: template.id,
        seed: baseSeed + 1,
      });
      expect(problem.operation).toBe('division');
    });

    it('has non-empty standards', () => {
      const problem = generateProblem({
        templateId: template.id,
        seed: baseSeed + 1,
      });
      expect(problem.standards.length).toBeGreaterThan(0);
    });
  },
);
