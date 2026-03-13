// Wave 0 RED stubs — all tests FAIL until Wave 1 lands
// statisticsHs domain does not exist yet; imports will throw

import { createRng } from '../../services/mathEngine/seededRng';
import { getHandler } from '../../services/mathEngine/domains/registry';
import { getSkillsByOperation } from '../../services/mathEngine/skills';
import { getTemplatesBySkill } from '../../services/mathEngine/templates';
import {
  generateDistractors,
  STATISTICS_HS_BUGS,
} from '../../services/mathEngine/bugLibrary';
import { answerNumericValue } from '../../services/mathEngine/types';
import type { MathDomain } from '../../services/mathEngine/types';

const OPERATION: MathDomain = 'statistics_hs' as MathDomain;

const EXPECTED_SKILL_IDS = [
  'stats_stddev_concept',
  'stats_normal_rule',
  'stats_zscore',
  'stats_percentile',
  'stats_word_problem',
] as const;

describe('Statistics HS Domain', () => {
  describe('registry', () => {
    it('handler is registered and defined for statistics_hs', () => {
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

  describe('handler generation — z-score bounds', () => {
    it('stats_zscore answers are bounded in range [-2, 2] across seeds 1-20', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('stats_zscore');
      expect(templates.length).toBeGreaterThan(0);

      for (let seed = 1; seed <= 20; seed++) {
        const rng = createRng(seed);
        const result = handler.generate(templates[0], rng);
        const value = answerNumericValue(result.correctAnswer);
        expect(value).toBeGreaterThanOrEqual(-2);
        expect(value).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('bug library', () => {
    it('STATISTICS_HS_BUGS has exactly 3 entries', () => {
      expect(STATISTICS_HS_BUGS).toHaveLength(3);
    });

    it('has expected bug IDs', () => {
      const ids = STATISTICS_HS_BUGS.map((b) => b.id);
      expect(ids).toContain('stats_zscore_sign_flip');
      expect(ids).toContain('stats_zscore_forgot_mean');
      expect(ids).toContain('stats_normal_wrong_band');
    });

    it('each bug has a non-empty description string (feeds bugDescription in AI tutor prompts)', () => {
      for (const bug of STATISTICS_HS_BUGS) {
        expect(typeof bug.description).toBe('string');
        expect(bug.description.length).toBeGreaterThan(0);
      }
    });

    it('all patterns target statistics_hs operation', () => {
      for (const bug of STATISTICS_HS_BUGS) {
        expect(bug.operations).toContain(OPERATION);
      }
    });
  });

  describe('distractor generation', () => {
    it('generateDistractors returns 3 distractors, none equal to correct answer', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('stats_zscore');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(1);
      const domainData = handler.generate(templates[0], rng);
      const correctValue = answerNumericValue(domainData.correctAnswer);

      const problem = {
        id: 'test-stats-1',
        templateId: 'stats_zscore',
        skillId: 'stats_zscore',
        standards: ['HSS.ID.A.4'],
        grade: 9 as const,
        baseElo: 1000,
        operation: OPERATION,
        correctAnswer: domainData.correctAnswer,
        questionText: domainData.questionText,
        operands: domainData.operands,
        metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false, ...domainData.metadata },
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
