import { generateProblem } from '../../services/mathEngine/generator';
import { MULTIPLICATION_TEMPLATES } from '../../services/mathEngine/templates/multiplication';
import { answerNumericValue } from '../../services/mathEngine/types';

describe.each(MULTIPLICATION_TEMPLATES)(
  'Multiplication template: $id',
  (template) => {
    const baseSeed = MULTIPLICATION_TEMPLATES.indexOf(template) * 1000 + 20000;

    it('generates 20 problems without error', () => {
      for (let i = 1; i <= 20; i++) {
        expect(() =>
          generateProblem({ templateId: template.id, seed: baseSeed + i }),
        ).not.toThrow();
      }
    });

    it('operands are within template ranges', () => {
      for (let i = 1; i <= 20; i++) {
        const problem = generateProblem({
          templateId: template.id,
          seed: baseSeed + i,
        });

        expect(problem.operands[0]).toBeGreaterThanOrEqual(
          template.operandRanges![0].min,
        );
        expect(problem.operands[0]).toBeLessThanOrEqual(
          template.operandRanges![0].max,
        );
        expect(problem.operands[1]).toBeGreaterThanOrEqual(
          template.operandRanges![1].min,
        );
        expect(problem.operands[1]).toBeLessThanOrEqual(
          template.operandRanges![1].max,
        );
      }
    });

    it('correct answer equals a × b', () => {
      for (let i = 1; i <= 20; i++) {
        const problem = generateProblem({
          templateId: template.id,
          seed: baseSeed + i,
        });

        expect(answerNumericValue(problem.correctAnswer)).toBe(
          problem.operands[0] * problem.operands[1],
        );
      }
    });

    it('question text uses × symbol', () => {
      const problem = generateProblem({
        templateId: template.id,
        seed: baseSeed + 1,
      });
      expect(problem.questionText).toContain('×');
    });

    it('has operation set to multiplication', () => {
      const problem = generateProblem({
        templateId: template.id,
        seed: baseSeed + 1,
      });
      expect(problem.operation).toBe('multiplication');
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
