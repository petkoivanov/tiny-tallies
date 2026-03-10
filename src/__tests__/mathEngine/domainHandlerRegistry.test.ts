import { getHandler } from '@/services/mathEngine/domains/registry';
import { SKILLS, getSkillsByOperation } from '@/services/mathEngine/skills';
import { getTemplatesBySkill } from '@/services/mathEngine/templates';
import { createRng } from '@/services/mathEngine/seededRng';
import type { Operation } from '@/services/mathEngine/types';

const ALL_OPERATIONS: Operation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'fractions',
  'place_value',
  'time',
  'money',
  'patterns',
  'measurement',
  'ratios',
  'exponents',
  'expressions',
  'geometry',
  'probability',
  'number_theory',
];

describe('Domain Handler Registry', () => {
  it('has a handler registered for all 16 operations', () => {
    for (const op of ALL_OPERATIONS) {
      const handler = getHandler(op);
      expect(handler).toBeDefined();
      expect(typeof handler.generate).toBe('function');
    }
  });

  it('every handler can generate a problem from its first template', () => {
    for (const op of ALL_OPERATIONS) {
      const handler = getHandler(op);
      const skills = getSkillsByOperation(op);
      expect(skills.length).toBeGreaterThan(0);

      const templates = getTemplatesBySkill(skills[0].id);
      expect(templates.length).toBeGreaterThan(0);

      const rng = createRng(42);
      const result = handler.generate(templates[0], rng);

      expect(result.correctAnswer).toBeDefined();
      expect(result.questionText).toBeTruthy();
      expect(result.operands).toBeDefined();
    }
  });

  it('every domain has at least one skill registered', () => {
    for (const op of ALL_OPERATIONS) {
      const skills = getSkillsByOperation(op);
      expect(skills.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every skill operation matches a registered handler', () => {
    for (const skill of SKILLS) {
      const handler = getHandler(skill.operation);
      expect(handler).toBeDefined();
    }
  });

  it('all 132 skills are covered across the 16 domains', () => {
    let total = 0;
    for (const op of ALL_OPERATIONS) {
      total += getSkillsByOperation(op).length;
    }
    expect(total).toBe(SKILLS.length);
    expect(total).toBe(132);
  });

  it('handler generates valid answer types per domain', () => {
    const expectedTypes: Partial<Record<Operation, string[]>> = {
      addition: ['numeric'],
      subtraction: ['numeric'],
      multiplication: ['numeric'],
      division: ['numeric'],
      fractions: ['numeric', 'fraction', 'comparison'],
      place_value: ['numeric'],
      time: ['numeric'],
      money: ['numeric'],
      patterns: ['numeric'],
      measurement: ['numeric'],
      ratios: ['numeric'],
      exponents: ['numeric'],
      expressions: ['numeric', 'expression'],
      geometry: ['numeric', 'coordinate'],
      probability: ['numeric', 'fraction'],
      number_theory: ['numeric'],
    };

    for (const op of ALL_OPERATIONS) {
      const handler = getHandler(op);
      const skills = getSkillsByOperation(op);
      const answerTypes = new Set<string>();

      for (const skill of skills) {
        const templates = getTemplatesBySkill(skill.id);
        if (templates.length === 0) continue;
        const rng = createRng(42);
        const result = handler.generate(templates[0], rng);
        answerTypes.add(result.correctAnswer.type);
      }

      const allowed = expectedTypes[op] ?? ['numeric'];
      for (const ansType of answerTypes) {
        expect(allowed).toContain(ansType);
      }
    }
  });
});
