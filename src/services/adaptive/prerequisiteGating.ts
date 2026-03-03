import { SKILLS } from '../mathEngine/skills';
import type { SkillState } from '../../store/slices/skillStatesSlice';

/**
 * Returns whether a skill is unlocked based on BKT mastery of its prerequisites.
 *
 * - Root skills (no prerequisites) are always unlocked.
 * - A skill is unlocked when ALL prerequisite skills have masteryLocked=true.
 * - No-re-locking policy: if the child has practiced this skill (attempts > 0),
 *   it stays unlocked permanently even if prerequisite mastery is lost.
 * - Skills not found in the SKILLS array return false.
 * - Missing skillStates entries are treated as not mastered (locked).
 *
 * @param skillId     - The skill to check
 * @param skillStates - Map of skillId -> SkillState with BKT mastery data
 * @returns Whether the skill is unlocked
 */
export function isSkillUnlocked(
  skillId: string,
  skillStates: Record<string, SkillState>,
): boolean {
  const skill = SKILLS.find((s) => s.id === skillId);
  if (!skill) return false;
  if (skill.prerequisites.length === 0) return true;

  // No-re-locking policy: if the child has practiced this skill, it stays unlocked
  const skillState = skillStates[skillId];
  if (skillState && skillState.attempts > 0) return true;

  // BKT-mastery gating: all prerequisites must have masteryLocked=true
  return skill.prerequisites.every((prereqId) => {
    const prereqState = skillStates[prereqId];
    return prereqState?.masteryLocked === true;
  });
}

/**
 * Returns an array of skill IDs that are currently unlocked based on BKT mastery rules.
 *
 * Always includes root skills (no prerequisites). For chained skills, each skill
 * is independently evaluated against its direct prerequisites.
 *
 * @param skillStates - Map of skillId -> SkillState with BKT mastery data
 * @returns Array of unlocked skill IDs
 */
export function getUnlockedSkills(
  skillStates: Record<string, SkillState>,
): string[] {
  return SKILLS.filter((s) => isSkillUnlocked(s.id, skillStates)).map(
    (s) => s.id,
  );
}

/**
 * Returns skill IDs that are ready to learn: unmastered skills whose ALL
 * prerequisites have BKT-mastery (masteryLocked=true).
 *
 * - Root skills (no prerequisites) are in the fringe if not yet mastered.
 * - Mastered skills (masteryLocked=true) are excluded.
 * - Skills that lost mastery (soft lock broke, attempts > 0) are NOT in the fringe
 *   -- they are handled by Leitner review scheduling.
 * - Returns empty array when all skills are mastered.
 *
 * Used by Phase 14 session orchestrator for the "30% new skills" category.
 */
export function getOuterFringe(
  skillStates: Record<string, SkillState>,
): string[] {
  return SKILLS.filter((skill) => {
    const state = skillStates[skill.id];

    // Already mastered: not in fringe (Leitner handles review)
    if (state?.masteryLocked === true) return false;

    // Previously practiced but not mastered: not in fringe (Leitner handles review)
    if (state && state.attempts > 0) return false;

    // Check all prerequisites are mastered
    if (skill.prerequisites.length === 0) return true;
    return skill.prerequisites.every((prereqId) => {
      const prereqState = skillStates[prereqId];
      return prereqState?.masteryLocked === true;
    });
  }).map((s) => s.id);
}
