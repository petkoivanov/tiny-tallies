import { SKILLS } from '../mathEngine/skills';
import type { ManipulativeType, SkillManipulativeMapping } from './cpaTypes';

/**
 * Default manipulative mappings by operation and skill complexity.
 *
 * Mapping pattern (locked per user decisions and Common Core pedagogy):
 * - single-digit: counters, bar_model
 * - within-20: number_line, bar_model
 * - two-digit: base_ten_blocks, number_line, bar_model
 * - three-digit+: base_ten_blocks, bar_model
 *
 * New domains use pedagogically appropriate defaults:
 * - multiplication: counters (equal groups/arrays), bar_model
 * - division: counters, bar_model
 * - fractions: fraction_strips, bar_model
 * - place_value: base_ten_blocks, bar_model
 * - time: number_line, bar_model
 * - money: counters, bar_model
 * - patterns: number_line, bar_model
 *
 * Subtraction mirrors addition (same manipulatives for equivalent complexity).
 * Bar model included as last entry for every skill.
 * Fraction strips are mapped for fraction skills (not sandbox-only for fractions domain).
 */

/** Maps addition/subtraction skill IDs to manipulatives by complexity tier */
function getArithmeticManipulatives(skillId: string): ManipulativeType[] {
  if (skillId.includes('single-digit')) return ['counters', 'bar_model'];
  if (skillId.includes('within-20')) return ['number_line', 'bar_model'];
  if (skillId.includes('two-digit'))
    return ['base_ten_blocks', 'number_line', 'bar_model'];
  // three-digit, four-digit
  return ['base_ten_blocks', 'bar_model'];
}

/** Maps a skill to manipulatives based on its operation and complexity */
function getDefaultManipulatives(
  skillId: string,
  operation: string,
): ManipulativeType[] {
  switch (operation) {
    case 'addition':
    case 'subtraction':
      return getArithmeticManipulatives(skillId);
    case 'multiplication':
      if (
        skillId.includes('two-by') ||
        skillId.includes('four-by') ||
        skillId.includes('by-10')
      ) {
        return ['base_ten_blocks', 'bar_model'];
      }
      return ['counters', 'bar_model'];
    case 'division':
      if (skillId.includes('two-by') || skillId.includes('three-by')) {
        return ['base_ten_blocks', 'bar_model'];
      }
      return ['counters', 'bar_model'];
    case 'fractions':
      return ['fraction_strips', 'bar_model'];
    case 'place_value':
      return ['base_ten_blocks', 'bar_model'];
    case 'time':
      return ['number_line', 'bar_model'];
    case 'money':
      return ['counters', 'bar_model'];
    case 'patterns':
      return ['number_line', 'bar_model'];
    default:
      return ['bar_model'];
  }
}

/**
 * Static mapping of all skills to their ranked manipulative preferences.
 * Dynamically generated from the SKILLS array to stay in sync.
 */
export const SKILL_MANIPULATIVE_MAP: readonly SkillManipulativeMapping[] =
  SKILLS.map((skill) => ({
    skillId: skill.id,
    manipulatives: getDefaultManipulatives(skill.id, skill.operation),
  }));

/**
 * Returns the ranked list of manipulatives for a given skill ID.
 * Returns empty array if skill is not found.
 */
export function getManipulativesForSkill(
  skillId: string,
): ManipulativeType[] {
  const mapping = SKILL_MANIPULATIVE_MAP.find((m) => m.skillId === skillId);
  return mapping ? [...mapping.manipulatives] : [];
}

/**
 * Returns the primary (first-preference) manipulative for a skill.
 * Returns null if skill is not found.
 */
export function getPrimaryManipulative(
  skillId: string,
): ManipulativeType | null {
  const mapping = SKILL_MANIPULATIVE_MAP.find((m) => m.skillId === skillId);
  return mapping ? mapping.manipulatives[0] : null;
}
