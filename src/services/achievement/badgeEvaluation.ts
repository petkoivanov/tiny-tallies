import type { BadgeEvaluationSnapshot } from './badgeTypes';

// Stub: will be implemented in GREEN phase
export function evaluateBadges(
  _snapshot: BadgeEvaluationSnapshot,
  _earnedBadges: Record<string, { earnedAt: string }>,
): string[] {
  return [];
}
