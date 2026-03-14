// Wave 0 RED stubs — all tests FAIL until Wave 1 lands
// logarithms domain does not exist yet; imports will throw

import { createRng } from '../../services/mathEngine/seededRng';
import { getHandler } from '../../services/mathEngine/domains/registry';
import { getSkillsByOperation } from '../../services/mathEngine/skills';
import { getTemplatesBySkill } from '../../services/mathEngine/templates';
import {
  generateDistractors,
  LOGARITHMS_BUGS,
} from '../../services/mathEngine/bugLibrary';
import { answerNumericValue } from '../../services/mathEngine/types';
import type { MathDomain } from '../../services/mathEngine/types';

const OPERATION: MathDomain = 'logarithms' as MathDomain;

const EXPECTED_SKILL_IDS = [
  'log10_eval',
  'log2_eval',
  'ln_eval',
  'log_word_problem',
] as const;

describe('Logarithms Domain', () => {
  describe('registry', () => {
    it('should be registered in domain registry', () => {
      const handler = getHandler(OPERATION);
      expect(handler).toBeDefined();
      expect(typeof handler.generate).toBe('function');
    });
  });

  describe('skills', () => {
    it('should have 4 skills', () => {
      const skills = getSkillsByOperation(OPERATION);
      expect(skills.length).toBe(4);
    });

    it('should have 4 templates', () => {
      const skills = getSkillsByOperation(OPERATION);
      let totalTemplates = 0;
      for (const skill of skills) {
        totalTemplates += getTemplatesBySkill(skill.id).length;
      }
      expect(totalTemplates).toBe(4);
    });

    it('should have 3 bug patterns', () => {
      expect(LOGARITHMS_BUGS).toHaveLength(3);
    });

    it('all skills use operation logarithms', () => {
      const skills = getSkillsByOperation(OPERATION);
      for (const skill of skills) {
        expect(skill.operation).toBe('logarithms');
      }
    });

    it('all templates use operation logarithms', () => {
      const skills = getSkillsByOperation(OPERATION);
      for (const skill of skills) {
        const templates = getTemplatesBySkill(skill.id);
        for (const template of templates) {
          expect(template.operation).toBe('logarithms');
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
      ['log10_eval', 'numeric'],
      ['log2_eval', 'numeric'],
      ['ln_eval', 'numeric'],
      ['log_word_problem', 'numeric'],
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
    it('log10_eval produces correct exponent as answer', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('log10_eval');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(42);
      const result = handler.generate(templates[0], rng);
      const value = answerNumericValue(result.correctAnswer);

      // answer = n where argument = 10^n, stored as operands[2]
      expect(value).toBe(result.operands[2]);
      // Verify answer equals the exponent n where argument = 10^n
      const argument = result.operands[0]; // wrongArgument = argument itself
      expect(Math.pow(10, value)).toBe(argument);
    });

    it('log2_eval produces correct exponent as answer', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('log2_eval');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(42);
      const result = handler.generate(templates[0], rng);
      const value = answerNumericValue(result.correctAnswer);

      // answer = n where argument = 2^n, stored as operands[2]
      expect(value).toBe(result.operands[2]);
      const argument = result.operands[0]; // wrongArgument = argument itself
      expect(Math.pow(2, value)).toBe(argument);
    });

    it('ln_eval displays as ln(e^n) not numeric argument', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('ln_eval');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(42);
      const result = handler.generate(templates[0], rng);

      // questionText should contain "ln(e" and NOT contain a large numeric argument
      expect(result.questionText).toContain('ln(e');
      // Should not contain any number > 10 (e^n values are irrational, never displayed)
      const largeNumbers = result.questionText.match(/\d{3,}/g);
      expect(largeNumbers).toBeNull();
    });
  });

  describe('bug library', () => {
    it('log_gave_argument compute returns a non-null number', () => {
      const bug = LOGARITHMS_BUGS.find(
        (b) => b.id === 'log_gave_argument',
      );
      expect(bug).toBeDefined();
      const result = bug!.compute(1000, 4, 'logarithms' as MathDomain);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('number');
    });

    it('log_off_by_one compute returns a non-null number', () => {
      const bug = LOGARITHMS_BUGS.find(
        (b) => b.id === 'log_off_by_one',
      );
      expect(bug).toBeDefined();
      const result = bug!.compute(1000, 4, 'logarithms' as MathDomain);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('number');
    });

    it('log_confused_base compute returns a non-null number', () => {
      const bug = LOGARITHMS_BUGS.find(
        (b) => b.id === 'log_confused_base',
      );
      expect(bug).toBeDefined();
      const result = bug!.compute(1000, 4, 'logarithms' as MathDomain);
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

    it('log10_eval answer range is 1-6', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('log10_eval');
      expect(templates.length).toBeGreaterThan(0);

      for (let seed = 1; seed <= 20; seed++) {
        const rng = createRng(seed);
        const result = handler.generate(templates[0], rng);
        const value = answerNumericValue(result.correctAnswer);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(6);
      }
    });

    it('log2_eval answer range is 1-10', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('log2_eval');
      expect(templates.length).toBeGreaterThan(0);

      for (let seed = 1; seed <= 20; seed++) {
        const rng = createRng(seed);
        const result = handler.generate(templates[0], rng);
        const value = answerNumericValue(result.correctAnswer);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      }
    });

    it('ln_eval answer range is 1-5', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('ln_eval');
      expect(templates.length).toBeGreaterThan(0);

      for (let seed = 1; seed <= 20; seed++) {
        const rng = createRng(seed);
        const result = handler.generate(templates[0], rng);
        const value = answerNumericValue(result.correctAnswer);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(5);
      }
    });
  });
});
