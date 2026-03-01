import { requiresBorrow } from '../../services/mathEngine/constraints';
import { generateProblem } from '../../services/mathEngine/generator';
import { SUBTRACTION_TEMPLATES } from '../../services/mathEngine/templates/subtraction';

describe.each(SUBTRACTION_TEMPLATES)(
  'Subtraction template: $id',
  (template) => {
    const baseSeed = SUBTRACTION_TEMPLATES.indexOf(template) * 1000 + 10000;

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
          template.operandRanges[0].min,
        );
        expect(problem.operands[0]).toBeLessThanOrEqual(
          template.operandRanges[0].max,
        );
        // Note: operand[1] may be further constrained by generator to ensure non-negative result
        expect(problem.operands[1]).toBeGreaterThanOrEqual(
          template.operandRanges[1].min,
        );
        expect(problem.operands[1]).toBeLessThanOrEqual(
          template.operandRanges[1].max,
        );
      }
    });

    it('result is non-negative', () => {
      for (let i = 1; i <= 20; i++) {
        const problem = generateProblem({
          templateId: template.id,
          seed: baseSeed + i,
        });

        expect(problem.correctAnswer).toBeGreaterThanOrEqual(0);
      }
    });

    it('borrow constraint is respected', () => {
      for (let i = 1; i <= 20; i++) {
        const problem = generateProblem({
          templateId: template.id,
          seed: baseSeed + i,
        });

        const hasBorrow = requiresBorrow(
          problem.operands[0],
          problem.operands[1],
        );

        if (template.requiresBorrow === true) {
          expect(hasBorrow).toBe(true);
        } else if (template.requiresBorrow === false) {
          expect(hasBorrow).toBe(false);
        }
      }
    });

    it('correct answer equals a - b', () => {
      for (let i = 1; i <= 20; i++) {
        const problem = generateProblem({
          templateId: template.id,
          seed: baseSeed + i,
        });

        expect(problem.correctAnswer).toBe(
          problem.operands[0] - problem.operands[1],
        );
      }
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
