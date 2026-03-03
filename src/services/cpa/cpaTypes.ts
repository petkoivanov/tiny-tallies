/**
 * CPA (Concrete-Pictorial-Abstract) progression types.
 *
 * The CPA framework guides children through three stages of mathematical understanding:
 * - Concrete: Physical/virtual manipulatives (counters, blocks)
 * - Pictorial: Visual representations (diagrams, number lines)
 * - Abstract: Symbolic notation (numbers, equations)
 */

/** CPA learning stage for a skill */
export type CpaStage = 'concrete' | 'pictorial' | 'abstract';

/** Types of virtual manipulatives available */
export type ManipulativeType =
  | 'base_ten_blocks'
  | 'number_line'
  | 'fraction_strips'
  | 'counters'
  | 'ten_frame'
  | 'bar_model';

/** Maps a skill to its ranked manipulative preferences */
export interface SkillManipulativeMapping {
  skillId: string;
  manipulatives: ManipulativeType[];
}

/**
 * Mastery probability threshold below which a skill is in the concrete stage.
 * Aligns with BKT_RETEACH_THRESHOLD (0.40).
 * P(L) < 0.40 = concrete
 */
export const CPA_CONCRETE_THRESHOLD = 0.4;

/**
 * Mastery probability threshold at or above which a skill is in the abstract stage.
 * P(L) >= 0.85 = abstract
 */
export const CPA_ABSTRACT_THRESHOLD = 0.85;
