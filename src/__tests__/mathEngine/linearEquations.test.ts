// Wave 0 RED stubs — all tests FAIL until Wave 1 lands
// linearEquations domain does not exist yet; imports will throw

import { createRng } from '../../services/mathEngine/seededRng';
import { getHandler } from '../../services/mathEngine/domains/registry';
import { getSkillsByOperation } from '../../services/mathEngine/skills';
import { getTemplatesBySkill } from '../../services/mathEngine/templates';
import {
  generateDistractors,
  isValidDistractor,
  LINEAR_EQUATIONS_BUGS,
} from '../../services/mathEngine/bugLibrary';
import { answerNumericValue } from '../../services/mathEngine/types';
import type { MathDomain } from '../../services/mathEngine/types';

const OPERATION: MathDomain = 'linear_equations' as MathDomain;

const EXPECTED_SKILL_IDS = [
  'one_step_addition',
  'one_step_multiplication',
  'two_step_add_mul',
  'two_step_sub_div',
  'two_step_mixed',
  'multi_step',
  'negative_solution',
  'word_problem',
] as const;

describe('Linear Equations Domain', () => {
  describe('registry', () => {
    it('handler is registered and defined for linear_equations', () => {
      const handler = getHandler(OPERATION);
      expect(handler).toBeDefined();
      expect(typeof handler.generate).toBe('function');
    });
  });

  describe('skills', () => {
    it('has exactly 8 skills', () => {
      const skills = getSkillsByOperation(OPERATION);
      expect(skills.length).toBe(8);
    });

    it.each(EXPECTED_SKILL_IDS)('skill "%s" exists', (skillId) => {
      const skills = getSkillsByOperation(OPERATION);
      const ids = skills.map((s) => s.id);
      expect(ids).toContain(skillId);
    });

    it('every skill has at least one template', () => {
      const skills = getSkillsByOperation(OPERATION);
      for (const skill of skills) {
        const templates = getTemplatesBySkill(skill.id);
        expect(templates.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('handler generation', () => {
    it('produces integer correctAnswer for all 8 skills across seeds 1-20', () => {
      const skills = getSkillsByOperation(OPERATION);
      const handler = getHandler(OPERATION);

      for (const skill of skills) {
        const templates = getTemplatesBySkill(skill.id);
        expect(templates.length).toBeGreaterThan(0);

        for (let seed = 1; seed <= 20; seed++) {
          const rng = createRng(seed);
          const result = handler.generate(templates[0], rng);
          const value = answerNumericValue(result.correctAnswer);
          expect(Number.isInteger(value)).toBe(true);
        }
      }
    });

    it('every template has distractorStrategy === "domain_specific"', () => {
      const skills = getSkillsByOperation(OPERATION);
      for (const skill of skills) {
        const templates = getTemplatesBySkill(skill.id);
        for (const template of templates) {
          expect(template.distractorStrategy).toBe('domain_specific');
        }
      }
    });
  });

  describe('bug library', () => {
    it('LINEAR_EQUATIONS_BUGS has exactly 3 entries', () => {
      expect(LINEAR_EQUATIONS_BUGS).toHaveLength(3);
    });

    it('has expected bug IDs', () => {
      const ids = LINEAR_EQUATIONS_BUGS.map((b) => b.id);
      expect(ids).toContain('lin_wrong_operation');
      expect(ids).toContain('lin_sign_flip');
      expect(ids).toContain('lin_forgot_to_divide');
    });

    it('each bug has a non-empty description string', () => {
      for (const bug of LINEAR_EQUATIONS_BUGS) {
        expect(typeof bug.description).toBe('string');
        expect(bug.description.length).toBeGreaterThan(0);
      }
    });

    it('all patterns target linear_equations operation', () => {
      for (const bug of LINEAR_EQUATIONS_BUGS) {
        expect(bug.operations).toContain(OPERATION);
      }
    });
  });

  describe('distractor generation', () => {
    it('generateDistractors returns 3 distractors, none equal to correct answer', () => {
      const skills = getSkillsByOperation(OPERATION);
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill(skills[0].id);
      const rng = createRng(42);
      const domainData = handler.generate(templates[0], rng);
      const correctValue = answerNumericValue(domainData.correctAnswer);

      // Build a minimal Problem shape for generateDistractors
      const problem = {
        id: 'test-lin-1',
        templateId: 'lin_one_step_add_sub',
        skillId: 'one_step_addition',
        standards: ['8.EE.C.7b'],
        grade: 8 as const,
        baseElo: 1000,
        operation: OPERATION,
        correctAnswer: domainData.correctAnswer,
        questionText: domainData.questionText,
        operands: domainData.operands,
        metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false, ...domainData.metadata },
        distractorStrategy: 'domain_specific' as const,
      };

      const distractors = generateDistractors(problem, createRng(42), 3, 'domain_specific');
      expect(distractors).toHaveLength(3);
      for (const d of distractors) {
        expect(d.value).not.toBe(correctValue);
      }
    });
  });

  describe('negative solutions', () => {
    it('negative_solution skill produces x < 0 (generator emits negative answers)', () => {
      const skills = getSkillsByOperation(OPERATION);
      const negSkill = skills.find((s) => s.id === 'negative_solution');
      expect(negSkill).toBeDefined();

      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill(negSkill!.id);
      expect(templates.length).toBeGreaterThan(0);

      let foundNegative = false;
      for (let seed = 1; seed <= 20; seed++) {
        const rng = createRng(seed);
        const result = handler.generate(templates[0], rng);
        const value = answerNumericValue(result.correctAnswer);
        if (value < 0) {
          foundNegative = true;
          break;
        }
      }
      expect(foundNegative).toBe(true);
    });

    it('isValidDistractor allows negative distractors for linear_equations', () => {
      expect(isValidDistractor(-5, 3, OPERATION)).toBe(true);
    });
  });
});
