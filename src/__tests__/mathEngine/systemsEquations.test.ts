// Wave 0 RED stubs — all tests FAIL until Wave 1 lands
// systemsEquations domain does not exist yet; imports will throw

import { createRng } from '../../services/mathEngine/seededRng';
import { getHandler } from '../../services/mathEngine/domains/registry';
import { getSkillsByOperation } from '../../services/mathEngine/skills';
import { getTemplatesBySkill } from '../../services/mathEngine/templates';
import {
  generateDistractors,
  SYSTEMS_EQUATIONS_BUGS,
} from '../../services/mathEngine/bugLibrary';
import { answerNumericValue } from '../../services/mathEngine/types';
import type { MathDomain } from '../../services/mathEngine/types';

const OPERATION: MathDomain = 'systems_equations' as MathDomain;

const EXPECTED_SKILL_IDS = [
  'substitution_simple',
  'substitution_general',
  'elimination_add',
  'elimination_multiply',
  'sys_word_problem',
] as const;

describe('Systems of Equations Domain', () => {
  describe('registry', () => {
    it('handler is registered and defined for systems_equations', () => {
      const handler = getHandler(OPERATION);
      expect(handler).toBeDefined();
      expect(typeof handler.generate).toBe('function');
    });
  });

  describe('skills', () => {
    it('has exactly 5 skills', () => {
      const skills = getSkillsByOperation(OPERATION);
      expect(skills.length).toBe(5);
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

  describe('handler generation — integer answers across all skills', () => {
    it.each(EXPECTED_SKILL_IDS)(
      'skill "%s" produces integer-valued correctAnswer across seeds 1-20',
      (skillId) => {
        const handler = getHandler(OPERATION);
        const templates = getTemplatesBySkill(skillId);
        expect(templates.length).toBeGreaterThan(0);

        for (let seed = 1; seed <= 20; seed++) {
          const rng = createRng(seed);
          const result = handler.generate(templates[0], rng);
          const value = answerNumericValue(result.correctAnswer);
          expect(Number.isInteger(value)).toBe(true);
        }
      },
    );
  });

  describe('handler generation — substitution_simple answer bounds', () => {
    it('substitution_simple answers are bounded in range [1, 8] across seeds 1-20', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('substitution_simple');
      expect(templates.length).toBeGreaterThan(0);

      for (let seed = 1; seed <= 20; seed++) {
        const rng = createRng(seed);
        const result = handler.generate(templates[0], rng);
        const value = answerNumericValue(result.correctAnswer);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(8);
      }
    });
  });

  describe('bug library', () => {
    it('SYSTEMS_EQUATIONS_BUGS has exactly 3 entries', () => {
      expect(SYSTEMS_EQUATIONS_BUGS).toHaveLength(3);
    });

    it('has expected bug IDs', () => {
      const ids = SYSTEMS_EQUATIONS_BUGS.map((b) => b.id);
      expect(ids).toContain('sys_swapped_xy');
      expect(ids).toContain('sys_sign_error');
      expect(ids).toContain('sys_forgot_back_sub');
    });

    it('each bug has a non-empty description string', () => {
      for (const bug of SYSTEMS_EQUATIONS_BUGS) {
        expect(typeof bug.description).toBe('string');
        expect(bug.description.length).toBeGreaterThan(0);
      }
    });

    it('all patterns target systems_equations operation', () => {
      for (const bug of SYSTEMS_EQUATIONS_BUGS) {
        expect(bug.operations).toContain(OPERATION);
      }
    });
  });

  describe('distractor generation', () => {
    it('generateDistractors returns 3 distractors, none equal to correct answer', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('substitution_simple');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(1);
      const domainData = handler.generate(templates[0], rng);
      const correctValue = answerNumericValue(domainData.correctAnswer);

      const problem = {
        id: 'test-sys-1',
        templateId: 'substitution_simple',
        skillId: 'substitution_simple',
        standards: ['HSA.REI.C.6'],
        grade: 9 as const,
        baseElo: 1000,
        operation: OPERATION,
        correctAnswer: domainData.correctAnswer,
        questionText: domainData.questionText,
        operands: domainData.operands,
        metadata: { digitCount: 2, requiresCarry: false, requiresBorrow: false, ...domainData.metadata },
        distractorStrategy: 'domain_specific' as const,
      };

      const distractors = generateDistractors(problem, createRng(1), 3, 'domain_specific');
      expect(distractors).toHaveLength(3);
      for (const d of distractors) {
        expect(d.value).not.toBe(correctValue);
      }
    });
  });
});
