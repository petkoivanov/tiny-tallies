/**
 * Item bank — converts math engine templates into IRT 2PL items
 * for the CAT placement test.
 *
 * Maps template baseElo to IRT difficulty (b) on the logit scale,
 * and assigns discrimination (a) based on domain characteristics.
 *
 * Selects one representative item per skill to cover the curriculum
 * efficiently during placement testing.
 */

import type { IrtItem } from './types';
import { SKILLS } from '@/services/mathEngine/skills';
import { getTemplatesBySkill } from '@/services/mathEngine/templates';

/**
 * Convert Elo difficulty to IRT logit scale.
 *
 * Maps Elo range [600, 1400] to logit range [-3, 3].
 * Center point: Elo 1000 → logit 0.
 */
function eloToLogit(elo: number): number {
  const logit = (elo - 1000) / (400 / 3);
  // Clamp to [-3.5, 3.5] to stay within reasonable IRT range
  return Math.max(-3.5, Math.min(3.5, logit));
}

/**
 * Discrimination parameter by domain.
 *
 * Higher discrimination means the item better differentiates between
 * ability levels. Computational domains (addition, multiplication)
 * tend to be more discriminating than conceptual ones (patterns, geometry).
 */
const DOMAIN_DISCRIMINATION: Record<string, number> = {
  addition: 1.5,
  subtraction: 1.5,
  multiplication: 1.4,
  division: 1.4,
  fractions: 1.2,
  place_value: 1.3,
  time: 1.0,
  money: 1.1,
  patterns: 0.9,
  measurement: 1.0,
  ratios: 1.2,
  exponents: 1.3,
  expressions: 1.2,
  geometry: 0.9,
  probability: 1.0,
  number_theory: 1.1,
  basic_graphs: 0.8,
  data_analysis: 1.0,
};

/**
 * Build the IRT item bank from the math engine's skill/template registry.
 *
 * Selects one template per skill (the first/primary template),
 * converts to IRT parameters, and returns the full item pool.
 */
export function buildItemBank(): IrtItem[] {
  const items: IrtItem[] = [];

  for (const skill of SKILLS) {
    const templates = getTemplatesBySkill(skill.id);
    if (templates.length === 0) continue;

    // Use the first (primary) template for this skill
    const template = templates[0];
    const discrimination =
      DOMAIN_DISCRIMINATION[skill.operation] ?? 1.0;

    items.push({
      id: `cat_${skill.id}`,
      discrimination,
      difficulty: eloToLogit(template.baseElo),
      grade: skill.grade,
      skillId: skill.id,
      operation: skill.operation,
    });
  }

  return items;
}

/**
 * Build a filtered item bank for a specific grade range.
 * Useful for constraining the placement test to relevant content.
 */
export function buildItemBankForGrades(
  minGrade: number,
  maxGrade: number,
): IrtItem[] {
  return buildItemBank().filter(
    (item) => item.grade >= minGrade && item.grade <= maxGrade,
  );
}
