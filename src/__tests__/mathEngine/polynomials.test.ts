// Wave 0 RED stubs — all tests FAIL until Wave 1 lands
// polynomials domain does not exist yet; imports will throw

import { createRng } from '../../services/mathEngine/seededRng';
import { getHandler } from '../../services/mathEngine/domains/registry';
import { getSkillsByOperation } from '../../services/mathEngine/skills';
import { getTemplatesBySkill } from '../../services/mathEngine/templates';
import {
  generateDistractors,
  POLYNOMIALS_BUGS,
} from '../../services/mathEngine/bugLibrary';
import { answerNumericValue } from '../../services/mathEngine/types';
import type { MathDomain } from '../../services/mathEngine/types';

const OPERATION: MathDomain = 'polynomials' as MathDomain;

const EXPECTED_SKILL_IDS = [
  'foil_expansion',
  'poly_evaluation',
  'gcf_factoring',
  'diff_of_squares',
  'combined_operations',
  'poly_word_problem',
] as const;

describe('Polynomials Domain', () => {
  describe('registry', () => {
    it('handler is registered and defined for polynomials', () => {
      const handler = getHandler(OPERATION);
      expect(handler).toBeDefined();
      expect(typeof handler.generate).toBe('function');
    });
  });

  describe('skills', () => {
    it('has exactly 6 skills', () => {
      const skills = getSkillsByOperation(OPERATION);
      expect(skills.length).toBe(6);
    });

    it('has exactly 6 templates', () => {
      const skills = getSkillsByOperation(OPERATION);
      let totalTemplates = 0;
      for (const skill of skills) {
        totalTemplates += getTemplatesBySkill(skill.id).length;
      }
      expect(totalTemplates).toBe(6);
    });

    it('has exactly 3 bug patterns', () => {
      expect(POLYNOMIALS_BUGS).toHaveLength(3);
    });

    it('all skills use operation polynomials', () => {
      const skills = getSkillsByOperation(OPERATION);
      for (const skill of skills) {
        expect(skill.operation).toBe('polynomials');
      }
    });

    it('all templates use operation polynomials', () => {
      const skills = getSkillsByOperation(OPERATION);
      for (const skill of skills) {
        const templates = getTemplatesBySkill(skill.id);
        for (const template of templates) {
          expect(template.operation).toBe('polynomials');
        }
      }
    });

    it('all templates use domain_specific distractor strategy', () => {
      const skills = getSkillsByOperation(OPERATION);
      for (const skill of skills) {
        const templates = getTemplatesBySkill(skill.id);
        for (const template of templates) {
          expect(template.distractorStrategy).toBe('domain_specific');
        }
      }
    });
  });

  describe('handler generation — per skill type', () => {
    it.each([
      ['foil_expansion', 'numeric'],
      ['poly_evaluation', 'numeric'],
      ['gcf_factoring', 'numeric'],
      ['diff_of_squares', 'numeric'],
      ['combined_operations', 'numeric'],
      ['poly_word_problem', 'numeric'],
    ] as const)(
      'skill "%s" produces %s answer with non-empty question and >= 3 operands',
      (skillId, expectedType) => {
        const handler = getHandler(OPERATION);
        const templates = getTemplatesBySkill(skillId);
        expect(templates.length).toBeGreaterThan(0);

        const rng = createRng(42);
        const result = handler.generate(templates[0], rng);

        expect(result.correctAnswer.type).toBe(expectedType);
        expect(typeof result.questionText).toBe('string');
        expect(result.questionText.length).toBeGreaterThan(0);
        expect(result.operands.length).toBeGreaterThanOrEqual(3);
      },
    );
  });

  describe('specific generator behavior', () => {
    it('foil_expansion evaluates correctly — (x+a)(x+b) at x gives correct answer', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('foil_expansion');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(42);
      const result = handler.generate(templates[0], rng);
      const value = answerNumericValue(result.correctAnswer);

      // operands: [a, b, x, wrongMiddle]
      const a = result.operands[0];
      const b = result.operands[1];
      const x = result.operands[2];
      const expected = (x + a) * (x + b);
      expect(value).toBe(expected);
    });

    it('gcf_factoring answer is the GCF value', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('gcf_factoring');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(42);
      const result = handler.generate(templates[0], rng);
      const value = answerNumericValue(result.correctAnswer);

      // operands[0] = gcf
      expect(value).toBe(result.operands[0]);
    });

    it('poly_evaluation computes ax^2+bx+c correctly', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('poly_evaluation');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(42);
      const result = handler.generate(templates[0], rng);
      const value = answerNumericValue(result.correctAnswer);

      // operands: [coeffA, coeffB, coeffC, evalX]
      const a = result.operands[0];
      const b = result.operands[1];
      const c = result.operands[2];
      const x = result.operands[3];
      const expected = a * x * x + b * x + c;
      expect(value).toBe(expected);
    });
  });

  describe('bug library', () => {
    it('poly_foil_forgot_middle compute returns a non-null number', () => {
      const bug = POLYNOMIALS_BUGS.find(
        (b) => b.id === 'poly_foil_forgot_middle',
      );
      expect(bug).toBeDefined();
      const result = bug!.compute(3, 2, 'polynomials' as MathDomain);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('number');
    });

    it('poly_wrong_gcf compute returns a non-null number', () => {
      const bug = POLYNOMIALS_BUGS.find(
        (b) => b.id === 'poly_wrong_gcf',
      );
      expect(bug).toBeDefined();
      const result = bug!.compute(6, 3, 'polynomials' as MathDomain);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('number');
    });

    it('poly_sign_error compute returns a non-null number', () => {
      const bug = POLYNOMIALS_BUGS.find(
        (b) => b.id === 'poly_sign_error',
      );
      expect(bug).toBeDefined();
      const result = bug!.compute(3, 2, 'polynomials' as MathDomain);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('number');
    });
  });

  describe('generator properties', () => {
    it('all generators produce integer answers', () => {
      const handler = getHandler(OPERATION);
      for (const skillId of EXPECTED_SKILL_IDS) {
        const templates = getTemplatesBySkill(skillId);
        expect(templates.length).toBeGreaterThan(0);

        for (let seed = 1; seed <= 20; seed++) {
          const rng = createRng(seed);
          const result = handler.generate(templates[0], rng);
          const value = answerNumericValue(result.correctAnswer);
          expect(Number.isInteger(value)).toBe(true);
        }
      }
    });
  });
});
