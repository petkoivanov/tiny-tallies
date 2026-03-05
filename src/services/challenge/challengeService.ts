import { createRng } from '../mathEngine/seededRng';
import { SKILLS } from '../mathEngine/skills';
import { getUnlockedSkills } from '../adaptive/prerequisiteGating';
import type { SkillState } from '../../store/slices/skillStatesSlice';
import type { ChallengeTheme } from './challengeTypes';
import { CHALLENGE_THEMES } from './challengeThemes';

/**
 * Returns YYYYMMDD integer seed for deterministic daily rotation.
 * Uses local date (not UTC) so the challenge changes at midnight local time.
 */
export function getDateSeed(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return year * 10000 + month * 100 + day;
}

/**
 * Returns "YYYY-MM-DD" date key for challenge completion storage.
 */
export function getTodayDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's challenge theme using date-seeded PRNG for deterministic rotation.
 * Same date always returns the same theme.
 */
export function getTodaysChallenge(date: Date = new Date()): ChallengeTheme {
  const seed = getDateSeed(date);
  const rng = createRng(seed);
  const index = rng.intRange(0, CHALLENGE_THEMES.length - 1);
  return CHALLENGE_THEMES[index];
}

/**
 * Returns skill IDs matching the theme's skill filter from currently unlocked skills.
 * Falls back to all unlocked skills when the filtered set is empty.
 */
export function getChallengeSkillIds(
  theme: ChallengeTheme,
  skillStates: Record<string, SkillState>,
): string[] {
  const unlockedIds = getUnlockedSkills(skillStates);

  const filtered = unlockedIds.filter((skillId) => {
    const skill = SKILLS.find((s) => s.id === skillId);
    if (!skill) return false;

    const { operations, grades } = theme.skillFilter;

    if (operations && !operations.includes(skill.operation)) return false;
    if (grades && !grades.includes(skill.grade)) return false;

    return true;
  });

  // Fallback: if filtering produces empty set, use all unlocked skills
  return filtered.length > 0 ? filtered : unlockedIds;
}

/**
 * Evaluates whether the player met the challenge's accuracy and streak goals.
 * Pure function with no side effects.
 */
export function evaluateChallengeGoals(
  score: number,
  total: number,
  maxStreak: number,
  theme: ChallengeTheme,
): { accuracyGoalMet: boolean; streakGoalMet: boolean } {
  return {
    accuracyGoalMet: score >= theme.goals.accuracyTarget,
    streakGoalMet: maxStreak >= theme.goals.streakTarget,
  };
}
