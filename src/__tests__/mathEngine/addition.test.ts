import { requiresCarry } from '../../services/mathEngine/constraints';
import { generateProblem } from '../../services/mathEngine/generator';
import { ADDITION_TEMPLATES } from '../../services/mathEngine/templates/addition';

describe.each(ADDITION_TEMPLATES)('Addition template: $id', (template) => {
  const baseSeed = ADDITION_TEMPLATES.indexOf(template) * 1000;

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
      expect(problem.operands[1]).toBeGreaterThanOrEqual(
        template.operandRanges[1].min,
      );
      expect(problem.operands[1]).toBeLessThanOrEqual(
        template.operandRanges[1].max,
      );
    }
  });

  it('result is within template result range', () => {
    for (let i = 1; i <= 20; i++) {
      const problem = generateProblem({
        templateId: template.id,
        seed: baseSeed + i,
      });

      expect(problem.correctAnswer).toBeGreaterThanOrEqual(
        template.resultRange.min,
      );
      expect(problem.correctAnswer).toBeLessThanOrEqual(
        template.resultRange.max,
      );
    }
  });

  it('carry constraint is respected', () => {
    for (let i = 1; i <= 20; i++) {
      const problem = generateProblem({
        templateId: template.id,
        seed: baseSeed + i,
      });

      const hasCarry = requiresCarry(problem.operands[0], problem.operands[1]);

      if (template.requiresCarry === true) {
        expect(hasCarry).toBe(true);
      } else if (template.requiresCarry === false) {
        expect(hasCarry).toBe(false);
      }
    }
  });

  it('correct answer equals a + b', () => {
    for (let i = 1; i <= 20; i++) {
      const problem = generateProblem({
        templateId: template.id,
        seed: baseSeed + i,
      });

      expect(problem.correctAnswer).toBe(
        problem.operands[0] + problem.operands[1],
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
});
