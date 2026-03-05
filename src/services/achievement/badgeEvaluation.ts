import { SKILLS } from '../mathEngine/skills';
import { BADGES } from './badgeRegistry';
import type { BadgeEvaluationSnapshot, UnlockCondition } from './badgeTypes';

/**
 * Checks whether a single unlock condition is satisfied by the snapshot.
 * Pure function with no side effects.
 */
function checkCondition(
  condition: UnlockCondition,
  snapshot: BadgeEvaluationSnapshot,
): boolean {
  switch (condition.type) {
    case 'skill-mastery':
      return snapshot.skillStates[condition.skillId]?.masteryLocked === true;

    case 'category-mastery': {
      const operationSkills = SKILLS.filter(
        (s) => s.operation === condition.operation,
      );
      return operationSkills.every(
        (s) => snapshot.skillStates[s.id]?.masteryLocked === true,
      );
    }

    case 'grade-mastery': {
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
