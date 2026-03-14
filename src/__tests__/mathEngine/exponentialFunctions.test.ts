// Wave 0 RED stubs — all tests FAIL until Wave 1 lands
// exponential_functions domain does not exist yet; imports will throw

import { createRng } from '../../services/mathEngine/seededRng';
import { getHandler } from '../../services/mathEngine/domains/registry';
import { getSkillsByOperation } from '../../services/mathEngine/skills';
import { getTemplatesBySkill } from '../../services/mathEngine/templates';
import {
  generateDistractors,
  EXPONENTIAL_FUNCTIONS_BUGS,
} from '../../services/mathEngine/bugLibrary';
import { answerNumericValue } from '../../services/mathEngine/types';
import type { MathDomain } from '../../services/mathEngine/types';

const OPERATION: MathDomain = 'exponential_functions' as MathDomain;

const EXPECTED_SKILL_IDS = [
  'exp_evaluate',
  'growth_factor',
  'decay_factor',
  'doubling_time',
  'exp_word_problem',
] as const;

describe('Exponential Functions Domain', () => {
  describe('registry', () => {
    it('should be registered in domain registry', () => {
      const handler = getHandler(OPERATION);
      expect(handler).toBeDefined();
      expect(typeof handler.generate).toBe('function');
    });
  });

  describe('skills', () => {
    it('should have 5 skills', () => {
      const skills = getSkillsByOperation(OPERATION);
      expect(skills.length).toBe(5);
    });

    it('should have 5 templates', () => {
      const skills = getSkillsByOperation(OPERATION);
      let totalTemplates = 0;
      for (const skill of skills) {
        totalTemplates += getTemplatesBySkill(skill.id).length;
      }
      expect(totalTemplates).toBe(5);
    });

    it('should have 3 bug patterns', () => {
      expect(EXPONENTIAL_FUNCTIONS_BUGS).toHaveLength(3);
    });

    it('all skills use operation exponential_functions', () => {
      const skills = getSkillsByOperation(OPERATION);
      for (const skill of skills) {
        expect(skill.operation).toBe('exponential_functions');
      }
    });

    it('all templates use operation exponential_functions', () => {
      const skills = getSkillsByOperation(OPERATION);
      for (const skill of skills) {
        const templates = getTemplatesBySkill(skill.id);
        for (const template of templates) {
          expect(template.operation).toBe('exponential_functions');
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
      ['exp_evaluate', 'numeric'],
      ['growth_factor', 'numeric'],
      ['decay_factor', 'numeric'],
      ['doubling_time', 'numeric'],
      ['exp_word_problem', 'numeric'],
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
    it('exp_evaluate computes base^exponent correctly', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('exp_evaluate');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(42);
      const result = handler.generate(templates[0], rng);
      const value = answerNumericValue(result.correctAnswer);

      // operands: [wrongMultiply, wrongPlusOne, answer]
      // answer = Math.pow(base, exp), stored as operands[2]
      expect(value).toBe(result.operands[2]);
      // Verify it is a valid power
      expect(value).toBeGreaterThan(1);
    });

    it('growth_factor produces correct exponential growth result', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('growth_factor');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(42);
      const result = handler.generate(templates[0], rng);
      const value = answerNumericValue(result.correctAnswer);

      // answer = initial * factor^periods, stored as operands[2]
      expect(value).toBe(result.operands[2]);
      expect(value).toBeGreaterThan(0);
    });

    it('decay_factor produces correct halving result', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('decay_factor');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(42);
      const result = handler.generate(templates[0], rng);
      const value = answerNumericValue(result.correctAnswer);

      // answer = initial / 2^periods, stored as operands[2]
      // initial is a power of 2 so result is always integer
      expect(value).toBe(result.operands[2]);
      expect(value).toBeGreaterThan(0);
      expect(Number.isInteger(value)).toBe(true);
    });
  });

  describe('bug library', () => {
    it('exp_linear_thinking compute returns a non-null number', () => {
      const bug = EXPONENTIAL_FUNCTIONS_BUGS.find(
        (b) => b.id === 'exp_linear_thinking',
      );
      expect(bug).toBeDefined();
      const result = bug!.compute(3, 2, 'exponential_functions' as MathDomain);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('number');
    });

    it('exp_off_by_one_period compute returns a non-null number', () => {
      const bug = EXPONENTIAL_FUNCTIONS_BUGS.find(
        (b) => b.id === 'exp_off_by_one_period',
      );
      expect(bug).toBeDefined();
      const result = bug!.compute(3, 2, 'exponential_functions' as MathDomain);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('number');
    });

    it('exp_growth_decay_swap compute returns a non-null number', () => {
      const bug = EXPONENTIAL_FUNCTIONS_BUGS.find(
        (b) => b.id === 'exp_growth_decay_swap',
      );
      expect(bug).toBeDefined();
      const result = bug!.compute(3, 2, 'exponential_functions' as MathDomain);
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

    it('all answers are bounded under 2000', () => {
      const handler = getHandler(OPERATION);
      for (const skillId of EXPECTED_SKILL_IDS) {
        const templates = getTemplatesBySkill(skillId);
        expect(templates.length).toBeGreaterThan(0);

        for (let seed = 1; seed <= 20; seed++) {
          const rng = createRng(seed);
          const result = handler.generate(templates[0], rng);
          const value = answerNumericValue(result.correctAnswer);
          expect(value).toBeLessThan(2000);
        }
      }
    });
  });
});
