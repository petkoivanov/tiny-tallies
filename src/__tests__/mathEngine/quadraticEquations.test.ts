// Wave 0 RED stubs — all tests FAIL until Wave 1 lands
// quadraticEquations domain does not exist yet; imports will throw

import { createRng } from '../../services/mathEngine/seededRng';
import { getHandler } from '../../services/mathEngine/domains/registry';
import { getSkillsByOperation } from '../../services/mathEngine/skills';
import { getTemplatesBySkill } from '../../services/mathEngine/templates';
import {
  generateDistractors,
  QUADRATIC_EQUATIONS_BUGS,
} from '../../services/mathEngine/bugLibrary';
import { answerNumericValue, multiSelectAnswer } from '../../services/mathEngine/types';
import type { MathDomain, MultiSelectAnswer } from '../../services/mathEngine/types';

const OPERATION: MathDomain = 'quadratic_equations' as MathDomain;

const EXPECTED_SKILL_IDS = [
  'factoring_monic',
  'factoring_leading_coeff',
  'quadratic_formula_simple',
  'quadratic_formula_rational',
  'completing_the_square',
  'quad_word_problem',
] as const;

describe('Quadratic Equations Domain', () => {
  describe('registry', () => {
    it('handler is registered and defined for quadratic_equations', () => {
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
      expect(QUADRATIC_EQUATIONS_BUGS).toHaveLength(3);
    });

    it('all skills use operation quadratic_equations', () => {
      const skills = getSkillsByOperation(OPERATION);
      for (const skill of skills) {
        expect(skill.operation).toBe('quadratic_equations');
      }
    });

    it('all templates use operation quadratic_equations', () => {
      const skills = getSkillsByOperation(OPERATION);
      for (const skill of skills) {
        const templates = getTemplatesBySkill(skill.id);
        for (const template of templates) {
          expect(template.operation).toBe('quadratic_equations');
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
    it.each(EXPECTED_SKILL_IDS)(
      'skill "%s" produces multi_select answer with 2 distinct roots',
      (skillId) => {
        const handler = getHandler(OPERATION);
        const templates = getTemplatesBySkill(skillId);
        expect(templates.length).toBeGreaterThan(0);

        const rng = createRng(42);
        const result = handler.generate(templates[0], rng);

        // multi_select answer type with exactly 2 values
        expect(result.correctAnswer.type).toBe('multi_select');
        const answer = result.correctAnswer as MultiSelectAnswer;
        expect(answer.values.length).toBe(2);
        expect(answer.values[0]).not.toBe(answer.values[1]);

        // non-empty question text
        expect(typeof result.questionText).toBe('string');
        expect(result.questionText.length).toBeGreaterThan(0);

        // 4 operands: wrongSignR1, wrongSignR2, sum, product
        expect(result.operands.length).toBe(4);
      },
    );
  });

  describe('distractor values', () => {
    it('distractor values should include wrong-sign roots', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('factoring_monic');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(42);
      const result = handler.generate(templates[0], rng);
      const answer = result.correctAnswer as MultiSelectAnswer;

      // operands[0] === -correctAnswer.values[0] (wrong sign root 1)
      expect(result.operands[0]).toBe(-answer.values[0]);
      // operands[1] === -correctAnswer.values[1] (wrong sign root 2)
      expect(result.operands[1]).toBe(-answer.values[1]);
    });
  });

  describe('bug library', () => {
    it('quad_wrong_sign compute returns a non-null number', () => {
      const bug = QUADRATIC_EQUATIONS_BUGS.find(
        (b) => b.id === 'quad_wrong_sign',
      );
      expect(bug).toBeDefined();
      // operands[0] = wrongSignR1 = -3, operands[1] = wrongSignR2 = 5
      const result = bug!.compute(-3, 5, 'quadratic_equations' as MathDomain);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('number');
    });

    it('quad_sum_product_confusion compute returns a non-null number', () => {
      const bug = QUADRATIC_EQUATIONS_BUGS.find(
        (b) => b.id === 'quad_sum_product_confusion',
      );
      expect(bug).toBeDefined();
      const result = bug!.compute(-3, 5, 'quadratic_equations' as MathDomain);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('number');
    });

    it('quad_only_one_root compute returns a non-null number', () => {
      const bug = QUADRATIC_EQUATIONS_BUGS.find(
        (b) => b.id === 'quad_only_one_root',
      );
      expect(bug).toBeDefined();
      const result = bug!.compute(-3, 5, 'quadratic_equations' as MathDomain);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('number');
    });
  });

  describe('generator properties', () => {
    it('all generators produce integer roots', () => {
      const handler = getHandler(OPERATION);
      for (const skillId of EXPECTED_SKILL_IDS) {
        const templates = getTemplatesBySkill(skillId);
        expect(templates.length).toBeGreaterThan(0);

        for (let seed = 1; seed <= 20; seed++) {
          const rng = createRng(seed);
          const result = handler.generate(templates[0], rng);
          const answer = result.correctAnswer as MultiSelectAnswer;
          for (const v of answer.values) {
            expect(Number.isInteger(v)).toBe(true);
          }
        }
      }
    });

    it('factoring_leading_coeff has leading coefficient > 1', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('factoring_leading_coeff');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(42);
      const result = handler.generate(templates[0], rng);
      // questionText starts with "2x" or "3x" (not "x")
      expect(result.questionText).not.toMatch(/^x/);
      expect(result.questionText).toMatch(/^[23]\d*x/);
    });

    it('word_problem generator produces question with context sentence', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('word_problem');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(42);
      const result = handler.generate(templates[0], rng);

      // Word problem questionText should be longer than a bare equation
      expect(result.questionText.length).toBeGreaterThan(30);
    });
  });
});
