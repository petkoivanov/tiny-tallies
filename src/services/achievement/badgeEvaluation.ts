import { SKILLS } from '../mathEngine/skills';
import { BADGES } from './badgeRegistry';
import type { BadgeEvaluationSnapshot, UnlockCondition } from './badgeTypes';

/**
 * Checks whether a single unlock condition is satisfied by the snapshot.
 * Pure function with no side effects.
 */
/**
 * Check if a skill is still at its pre-mastered baseline (below child's grade
 * and never lost mastery). If the adaptive system demoted the skill
 * (masteryLocked reverted to false), it's no longer pre-mastered — the child
 * must re-earn it, and the badge becomes relevant.
 */
function isPreMastered(
  skillId: string,
  childGrade: number,
  skillStates: Record<string, { masteryLocked: boolean }>,
): boolean {
  const skill = SKILLS.find((s) => s.id === skillId);
  if (!skill || skill.grade >= childGrade) return false;
  // Still at pre-mastered baseline if masteryLocked is true (never lost)
  // If masteryLocked is false, the child was demoted — badge becomes relevant
  return skillStates[skillId]?.masteryLocked === true;
}

function checkCondition(
  condition: UnlockCondition,
  snapshot: BadgeEvaluationSnapshot,
): boolean {
  switch (condition.type) {
    case 'skill-mastery':
      // Skip badges for skills still at pre-mastered baseline (below child's grade)
      if (isPreMastered(condition.skillId, snapshot.childGrade, snapshot.skillStates)) return false;
      return snapshot.skillStates[condition.skillId]?.masteryLocked === true;

    case 'category-mastery': {
      const operationSkills = SKILLS.filter(
        (s) => s.operation === condition.operation,
      );
      // Only require mastery of non-pre-mastered skills (at/above grade, or demoted)
      const relevantSkills = operationSkills.filter(
        (s) => !isPreMastered(s.id, snapshot.childGrade, snapshot.skillStates),
      );
      if (relevantSkills.length === 0) return false;
      return relevantSkills.every(
        (s) => snapshot.skillStates[s.id]?.masteryLocked === true,
      );
    }

    case 'grade-mastery': {
      // Skip grade badges for grades entirely below the child's baseline
      if (condition.grade < snapshot.childGrade) {
        // Unless any skill in that grade was demoted (no longer pre-mastered)
        const gradeSkills = SKILLS.filter((s) => s.grade === condition.grade);
        const hasDemoted = gradeSkills.some(
          (s) => !isPreMastered(s.id, snapshot.childGrade, snapshot.skillStates),
        );
        if (!hasDemoted) return false;
      }
      const gradeSkills = SKILLS.filter((s) => s.grade === condition.grade);
      return gradeSkills.every(
        (s) => snapshot.skillStates[s.id]?.masteryLocked === true,
      );
    }

    case 'streak-milestone':
      return snapshot.weeklyStreak >= condition.weeklyStreakRequired;

    case 'sessions-milestone':
      return snapshot.sessionsCompleted >= condition.sessionsRequired;

    case 'remediation-victory': {
      const resolvedCount = Object.values(snapshot.misconceptions).filter(
        (r) => r.status === 'resolved',
      ).length;
      return resolvedCount >= condition.resolvedCountRequired;
    }

    case 'challenges-completed':
      return snapshot.challengesCompleted >= condition.challengesRequired;

    case 'perfect-challenge':
      return (
        snapshot.lastChallengeScore !== undefined &&
        snapshot.lastChallengeScore.score === snapshot.lastChallengeScore.total
      );

    case 'first-session':
      return snapshot.sessionsCompleted >= 1;

    case 'session-score':
      return (
        snapshot.lastSessionScore !== undefined &&
        snapshot.lastSessionScore.correct >= condition.correctRequired
      );

    case 'perfect-session':
      return (
        snapshot.lastSessionScore !== undefined &&
        snapshot.lastSessionScore.total > 0 &&
        snapshot.lastSessionScore.correct === snapshot.lastSessionScore.total
      );

    case 'skills-practiced':
      return (
        snapshot.lastSessionScore !== undefined &&
        snapshot.lastSessionScore.skillsPracticed >= condition.skillCount
      );

    default:
      return false;
  }
}

/**
 * Evaluates all badges against the current snapshot, returning only
 * newly-earned badge IDs (those not already in earnedBadges).
 *
 * Pure function: no side effects, no store coupling, no mutations.
 * Single-pass iteration over the BADGES array.
 */
export function evaluateBadges(
  snapshot: BadgeEvaluationSnapshot,
  earnedBadges: Record<string, { earnedAt: string }>,
): string[] {
  const newlyEarned: string[] = [];

  for (const badge of BADGES) {
    if (earnedBadges[badge.id]) continue;
    if (checkCondition(badge.condition, snapshot)) {
      newlyEarned.push(badge.id);
    }
  }

  return newlyEarned;
}
