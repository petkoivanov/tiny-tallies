import type { ManipulativeType, SkillManipulativeMapping } from './cpaTypes';

/**
 * Static mapping of all 14 skills to their ranked manipulative preferences.
 *
 * Mapping pattern (locked per user decisions and Common Core pedagogy):
 * - single-digit: counters, bar_model
 * - within-20: number_line, bar_model
 * - two-digit: base_ten_blocks, number_line, bar_model
 * - three-digit: base_ten_blocks, bar_model
 *
 * Subtraction mirrors addition (same manipulatives for equivalent complexity).
 * Bar model included as last entry for every skill (prepares for AI tutor word-problem wrapping).
 * Fraction strips are NOT mapped (sandbox-only per user decision).
 */
export const SKILL_MANIPULATIVE_MAP: readonly SkillManipulativeMapping[] = [
  // Addition skills
  {
    skillId: 'addition.single-digit.no-carry',
    manipulatives: ['counters', 'bar_model'],
  },
  {
    skillId: 'addition.within-20.no-carry',
    manipulatives: ['number_line', 'bar_model'],
  },
  {
    skillId: 'addition.within-20.with-carry',
    manipulatives: ['number_line', 'bar_model'],
  },
  {
    skillId: 'addition.two-digit.no-carry',
    manipulatives: ['base_ten_blocks', 'number_line', 'bar_model'],
  },
  {
    skillId: 'addition.two-digit.with-carry',
    manipulatives: ['base_ten_blocks', 'number_line', 'bar_model'],
  },
  {
    skillId: 'addition.three-digit.no-carry',
    manipulatives: ['base_ten_blocks', 'bar_model'],
  },
  {
    skillId: 'addition.three-digit.with-carry',
    manipulatives: ['base_ten_blocks', 'bar_model'],
  },

  // Subtraction skills (mirrors addition)
  {
    skillId: 'subtraction.single-digit.no-borrow',
    manipulatives: ['counters', 'bar_model'],
  },
  {
    skillId: 'subtraction.within-20.no-borrow',
    manipulatives: ['number_line', 'bar_model'],
  },
  {
    skillId: 'subtraction.within-20.with-borrow',
    manipulatives: ['number_line', 'bar_model'],
  },
  {
    skillId: 'subtraction.two-digit.no-borrow',
    manipulatives: ['base_ten_blocks', 'number_line', 'bar_model'],
  },
  {
    skillId: 'subtraction.two-digit.with-borrow',
    manipulatives: ['base_ten_blocks', 'number_line', 'bar_model'],
  },
  {
    skillId: 'subtraction.three-digit.no-borrow',
    manipulatives: ['base_ten_blocks', 'bar_model'],
  },
  {
    skillId: 'subtraction.three-digit.with-borrow',
    manipulatives: ['base_ten_blocks', 'bar_model'],
  },
];

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
