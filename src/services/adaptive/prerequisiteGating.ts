import { SKILLS } from '../mathEngine/skills';
import type { SkillState } from '../../store/slices/skillStatesSlice';

/**
 * Minimum Elo rating required on all prerequisite skills to unlock a dependent skill.
 * Set below the default Elo of 1000 so that a skill becomes locked only after
 * the student has demonstrated difficulty (dropped below 950) on a prerequisite.
 */
export const UNLOCK_THRESHOLD = 950;

/** Default Elo used when a skill has no entry in skillStates. */
const DEFAULT_ELO = 1000;

/**
 * Returns whether a skill is unlocked based on its prerequisites' Elo ratings.
 *
 * - Root skills (no prerequisites) are always unlocked.
 * - A skill is unlocked only when ALL prerequisite skills have eloRating >= UNLOCK_THRESHOLD.
 * - Skills not found in the SKILLS array return false.
 * - Missing skillStates entries use defaultElo (default 1000).
 *
 * This function checks only the direct prerequisites (parent), not the full ancestor chain.
 * The skill graph structure (each skill depends on one parent) means that if a parent
 * is unlocked, its parent must have met the threshold too -- enforced at unlock time.
 *
 * @param skillId     - The skill to check
 * @param skillStates - Map of skillId -> SkillState with Elo ratings
 * @param defaultElo  - Elo to assume for skills not in skillStates (default 1000)
 * @returns Whether the skill is unlocked
 */
export function isSkillUnlocked(
  skillId: string,
  skillStates: Record<string, SkillState>,
  defaultElo: number = DEFAULT_ELO,
): boolean {
  const skill = SKILLS.find((s) => s.id === skillId);
  if (!skill) return false;
  if (skill.prerequisites.length === 0) return true;

  return skill.prerequisites.every((prereqId) => {
    const state = skillStates[prereqId];
    return (state?.eloRating ?? defaultElo) >= UNLOCK_THRESHOLD;
  });
}

/**
 * Returns an array of skill IDs that are currently unlocked based on prerequisite Elo ratings.
 *
 * Always includes root skills (no prerequisites). For chained skills, each skill
 * is independently evaluated against its direct prerequisites.
 *
 * @param skillStates - Map of skillId -> SkillState with Elo ratings
 * @param defaultElo  - Elo to assume for skills not in skillStates (default 1000)
 * @returns Array of unlocked skill IDs
 */
export function getUnlockedSkills(
  skillStates: Record<string, SkillState>,
  defaultElo: number = DEFAULT_ELO,
): string[] {
  return SKILLS.filter((s) =>
    isSkillUnlocked(s.id, skillStates, defaultElo),
  ).map((s) => s.id);
}
