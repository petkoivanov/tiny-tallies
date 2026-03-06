import { SKILLS } from '../mathEngine/skills';
import type { SkillState } from '../../store/slices/skillStatesSlice';

/** Pre-mastered skill state for below-grade skills */
const PRE_MASTERED_STATE: SkillState = {
  eloRating: 1100,
  attempts: 5,
  correct: 5,
  masteryProbability: 0.95,
  consecutiveWrong: 0,
  masteryLocked: true,
  leitnerBox: 5,
  nextReviewDue: null,
  consecutiveCorrectInBox6: 0,
  cpaLevel: 'abstract',
};

/**
 * Create grade-appropriate skill states for a new child profile.
 *
 * Skills BELOW the child's grade are pre-mastered (masteryLocked: true)
 * so the prerequisite gating system unlocks grade-appropriate content.
 *
 * Skills AT or ABOVE the child's grade are omitted — the existing
 * lazy-init in skillStatesSlice handles them on first encounter.
 */
export function createGradeAppropriateSkillStates(
  grade: number,
): Record<string, SkillState> {
  const result: Record<string, SkillState> = {};

  for (const skill of SKILLS) {
    if (skill.grade < grade) {
      result[skill.id] = { ...PRE_MASTERED_STATE };
    }
  }

  return result;
}
