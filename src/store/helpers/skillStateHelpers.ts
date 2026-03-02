import type { SkillState } from '../slices/skillStatesSlice';

/** Standard Elo starting value (middle of 800-1250 template range). */
export const DEFAULT_ELO = 1000;

/**
 * Returns the existing SkillState for a given skillId, or creates a new
 * default entry with the specified Elo rating. Supports lazy initialization
 * so callers never need to check for undefined.
 */
export function getOrCreateSkillState(
  skillStates: Record<string, SkillState>,
  skillId: string,
  defaultElo: number = DEFAULT_ELO,
): SkillState {
  return (
    skillStates[skillId] ?? {
      eloRating: defaultElo,
      attempts: 0,
      correct: 0,
    }
  );
}

/**
 * Checks whether a child profile has all required fields populated.
 * Accepts a plain object (not the full AppState) so it can be used
 * as a derived selector.
 */
export function isProfileComplete(profile: {
  childName: string | null;
  childAge: number | null;
  childGrade: number | null;
  avatarId: string | null;
}): boolean {
  return (
    profile.childName !== null &&
    profile.childAge !== null &&
    profile.childGrade !== null &&
    profile.avatarId !== null
  );
}
