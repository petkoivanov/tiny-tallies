// Wave 0 RED stubs — all tests FAIL until Wave 1 lands
// sequencesSeries domain does not exist yet; imports will throw

import { createRng } from '../../services/mathEngine/seededRng';
import { getHandler } from '../../services/mathEngine/domains/registry';
import { getSkillsByOperation } from '../../services/mathEngine/skills';
import { getTemplatesBySkill } from '../../services/mathEngine/templates';
import {
  generateDistractors,
  SEQUENCES_SERIES_BUGS,
} from '../../services/mathEngine/bugLibrary';
import { answerNumericValue } from '../../services/mathEngine/types';
import type { MathDomain } from '../../services/mathEngine/types';

const OPERATION: MathDomain = 'sequences_series' as MathDomain;

const EXPECTED_SKILL_IDS = [
  'arithmetic_next_term',
  'arithmetic_nth_term',
  'geometric_next_term',
  'geometric_nth_term',
  'seq_word_problem',
] as const;

describe('Sequences & Series Domain', () => {
  describe('registry', () => {
    it('handler is registered and defined for sequences_series', () => {
      const handler = getHandler(OPERATION);
      expect(handler).toBeDefined();
      expect(typeof handler.generate).toBe('function');
    });
  });

  describe('skills', () => {
    it('has exactly 5 skills (arithmetic_partial_sum deferred)', () => {
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

  describe('handler generation — geometric bounds', () => {
    it('geometric_nth_term answers are bounded (< 2000) across seeds 1-20', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('geometric_nth_term');
      expect(templates.length).toBeGreaterThan(0);

      for (let seed = 1; seed <= 20; seed++) {
        const rng = createRng(seed);
        const result = handler.generate(templates[0], rng);
        const value = answerNumericValue(result.correctAnswer);
        expect(value).toBeLessThan(2000);
      }
    });
  });

  describe('bug library', () => {
    it('SEQUENCES_SERIES_BUGS has exactly 3 entries', () => {
      expect(SEQUENCES_SERIES_BUGS).toHaveLength(3);
    });

    it('has expected bug IDs', () => {
      const ids = SEQUENCES_SERIES_BUGS.map((b) => b.id);
      expect(ids).toContain('seq_arithmetic_wrong_step');
      expect(ids).toContain('seq_arithmetic_off_by_one');
      expect(ids).toContain('seq_geometric_uses_arithmetic');
    });

    it('each bug has a non-empty description string (feeds bugDescription in AI tutor prompts)', () => {
      for (const bug of SEQUENCES_SERIES_BUGS) {
        expect(typeof bug.description).toBe('string');
        expect(bug.description.length).toBeGreaterThan(0);
      }
    });

    it('all patterns target sequences_series operation', () => {
      for (const bug of SEQUENCES_SERIES_BUGS) {
        expect(bug.operations).toContain(OPERATION);
      }
    });
  });

  describe('distractor generation', () => {
    it('generateDistractors returns 3 distractors, none equal to correct answer', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('arithmetic_next_term');
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(1);
      const domainData = handler.generate(templates[0], rng);
      const correctValue = answerNumericValue(domainData.correctAnswer);

      const problem = {
        id: 'test-seq-1',
        templateId: 'arithmetic_next_term',
        skillId: 'arithmetic_next_term',
        standards: ['HSF.BF.A.2'],
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
