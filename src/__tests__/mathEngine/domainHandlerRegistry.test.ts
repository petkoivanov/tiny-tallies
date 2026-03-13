import { getHandler } from '@/services/mathEngine/domains/registry';
import { SKILLS, getSkillsByOperation } from '@/services/mathEngine/skills';
import { getTemplatesBySkill } from '@/services/mathEngine/templates';
import { createRng } from '@/services/mathEngine/seededRng';
import type { MathDomain } from '@/services/mathEngine/types';

const ALL_OPERATIONS: MathDomain[] = [
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
  'basic_graphs',
  'data_analysis',
  'linear_equations',
  'coordinate_geometry',
];

describe('Domain Handler Registry', () => {
  it('has a handler registered for all 20 operations', () => {
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

  it('all skills are covered across the 20 domains', () => {
    let total = 0;
    for (const op of ALL_OPERATIONS) {
      total += getSkillsByOperation(op).length;
    }
    expect(total).toBe(SKILLS.length);
    expect(total).toBe(165);
  });

  it('handler generates valid answer types per domain', () => {
    const expectedTypes: Partial<Record<MathDomain, string[]>> = {
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
      basic_graphs: ['numeric'],
      data_analysis: ['numeric'],
      linear_equations: ['numeric'],
      coordinate_geometry: ['numeric', 'fraction'],
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
