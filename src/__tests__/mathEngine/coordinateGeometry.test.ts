// Wave 0 RED stubs — all tests FAIL until Wave 1 lands
// coordinateGeometry domain does not exist yet; imports will throw

import { createRng } from '../../services/mathEngine/seededRng';
import { getHandler } from '../../services/mathEngine/domains/registry';
import { getSkillsByOperation } from '../../services/mathEngine/skills';
import { getTemplatesBySkill } from '../../services/mathEngine/templates';
import {
  generateDistractors,
  isValidDistractor,
  COORDINATE_GEOMETRY_BUGS,
} from '../../services/mathEngine/bugLibrary';
import { answerNumericValue } from '../../services/mathEngine/types';
import type { MathDomain } from '../../services/mathEngine/types';

const OPERATION: MathDomain = 'coordinate_geometry' as MathDomain;

const EXPECTED_SKILL_IDS = [
  'slope',
  'distance',
  'midpoint',
  'line_equation_yintercept',
  'line_equation_slope',
  'coord_word_problem',
] as const;

/** Compute GCD of two non-negative integers using Euclidean algorithm */
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

describe('Coordinate Geometry Domain', () => {
  describe('registry', () => {
    it('handler is registered and defined for coordinate_geometry', () => {
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

  describe('handler generation — integer answers', () => {
    const INTEGER_SKILL_IDS = [
      'distance',
      'midpoint',
      'line_equation_yintercept',
      'line_equation_slope',
    ] as const;

    it.each(INTEGER_SKILL_IDS)(
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

  describe('handler generation — slope FractionAnswer', () => {
    it('slope skill returns correctAnswer.type === "fraction" across seeds 1-20', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('slope');
      expect(templates.length).toBeGreaterThan(0);

      for (let seed = 1; seed <= 20; seed++) {
        const rng = createRng(seed);
        const result = handler.generate(templates[0], rng);
        expect(result.correctAnswer.type).toBe('fraction');
      }
    });

    it('slope FractionAnswer is in reduced form — gcd(|numerator|, denominator) === 1 across seeds 1-20', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('slope');
      expect(templates.length).toBeGreaterThan(0);

      for (let seed = 1; seed <= 20; seed++) {
        const rng = createRng(seed);
        const result = handler.generate(templates[0], rng);
        expect(result.correctAnswer.type).toBe('fraction');
        const frac = result.correctAnswer as { type: 'fraction'; numerator: number; denominator: number };
        expect(gcd(Math.abs(frac.numerator), frac.denominator)).toBe(1);
      }
    });

    it('slope FractionAnswer has positive denominator across seeds 1-20', () => {
      const handler = getHandler(OPERATION);
      const templates = getTemplatesBySkill('slope');
      expect(templates.length).toBeGreaterThan(0);

      for (let seed = 1; seed <= 20; seed++) {
        const rng = createRng(seed);
        const result = handler.generate(templates[0], rng);
        expect(result.correctAnswer.type).toBe('fraction');
        const frac = result.correctAnswer as { type: 'fraction'; numerator: number; denominator: number };
        expect(frac.denominator).toBeGreaterThan(0);
      }
    });
  });

  describe('bug library', () => {
    it('COORDINATE_GEOMETRY_BUGS has exactly 3 entries', () => {
      expect(COORDINATE_GEOMETRY_BUGS).toHaveLength(3);
    });

    it('has expected bug IDs', () => {
      const ids = COORDINATE_GEOMETRY_BUGS.map((b) => b.id);
      expect(ids).toContain('coord_slope_swapped_rise_run');
      expect(ids).toContain('coord_slope_sign_error');
      expect(ids).toContain('coord_distance_forgot_sqrt');
    });

    it('each bug has a non-empty description string (COORD-04 contract)', () => {
      for (const bug of COORDINATE_GEOMETRY_BUGS) {
        expect(typeof bug.description).toBe('string');
        expect(bug.description.length).toBeGreaterThan(0);
      }
    });

    it('all patterns target coordinate_geometry operation', () => {
      for (const bug of COORDINATE_GEOMETRY_BUGS) {
        expect(bug.operations).toContain(OPERATION);
      }
    });
  });

  describe('distractor generation', () => {
    it('generateDistractors returns 3 distractors, none equal to correct answer', () => {
      const skills = getSkillsByOperation(OPERATION);
      const handler = getHandler(OPERATION);
      // Use a non-slope skill for numeric distractor test
      const distanceSkill = skills.find((s) => s.id === 'distance') ?? skills[0];
      const templates = getTemplatesBySkill(distanceSkill.id);
      const rng = createRng(42);
      const domainData = handler.generate(templates[0], rng);
      const correctValue = answerNumericValue(domainData.correctAnswer);

      const problem = {
        id: 'test-coord-1',
        templateId: 'coord_distance',
        skillId: distanceSkill.id,
        standards: ['8.G.B.8'],
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

  describe('negative values allowed', () => {
    it('isValidDistractor(-3, 4, "coordinate_geometry") returns true (negative slopes/values allowed)', () => {
      expect(isValidDistractor(-3, 4, OPERATION)).toBe(true);
    });
  });
});
