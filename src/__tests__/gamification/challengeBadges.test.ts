import { BADGES } from '@/services/achievement/badgeRegistry';
import { evaluateBadges } from '@/services/achievement/badgeEvaluation';
import type { BadgeEvaluationSnapshot } from '@/services/achievement/badgeTypes';

function makeSnapshot(
  overrides: Partial<BadgeEvaluationSnapshot> = {},
): BadgeEvaluationSnapshot {
  return {
    skillStates: {},
    weeklyStreak: 0,
    sessionsCompleted: 0,
    misconceptions: {},
    challengesCompleted: 0,
    ...overrides,
  };
}

describe('challenge badges', () => {
  it('BADGES has 31 entries (27 existing + 4 challenge)', () => {
    expect(BADGES).toHaveLength(31);
  });

  it('awards behavior.challenge.first when challengesCompleted >= 1', () => {
    const snapshot = makeSnapshot({ challengesCompleted: 1 });
    const earned = evaluateBadges(snapshot, {});
    expect(earned).toContain('behavior.challenge.first');
  });

  it('awards behavior.challenge.streak when challengesCompleted >= 5', () => {
    const snapshot = makeSnapshot({ challengesCompleted: 5 });
    const earned = evaluateBadges(snapshot, {});
    expect(earned).toContain('behavior.challenge.streak');
  });

  it('awards behavior.challenge.master when challengesCompleted >= 20', () => {
    const snapshot = makeSnapshot({ challengesCompleted: 20 });
    const earned = evaluateBadges(snapshot, {});
    expect(earned).toContain('behavior.challenge.master');
  });

  it('awards behavior.challenge.perfect when lastChallengeScore is 10/10', () => {
    const snapshot = makeSnapshot({
      lastChallengeScore: { score: 10, total: 10 },
    });
    const earned = evaluateBadges(snapshot, {});
    expect(earned).toContain('behavior.challenge.perfect');
  });

  it('does not award perfect badge when score < total', () => {
    const snapshot = makeSnapshot({
      lastChallengeScore: { score: 9, total: 10 },
    });
    const earned = evaluateBadges(snapshot, {});
    expect(earned).not.toContain('behavior.challenge.perfect');
  });

  it('does not award challenge badges when not yet earned', () => {
    const snapshot = makeSnapshot({ challengesCompleted: 0 });
    const earned = evaluateBadges(snapshot, {});
    expect(earned).not.toContain('behavior.challenge.first');
    expect(earned).not.toContain('behavior.challenge.streak');
    expect(earned).not.toContain('behavior.challenge.master');
    expect(earned).not.toContain('behavior.challenge.perfect');
  });
});
