import { SKILLS } from '@/services/mathEngine/skills';
import type { BadgeEvaluationSnapshot } from '@/services/achievement/badgeTypes';
import { evaluateBadges } from '@/services/achievement/badgeEvaluation';

function createEmptySnapshot(): BadgeEvaluationSnapshot {
  return {
    skillStates: {},
    weeklyStreak: 0,
    sessionsCompleted: 0,
    misconceptions: {},
  };
}

function createMasteredSnapshot(
  skillIds: string[],
): BadgeEvaluationSnapshot {
  const snapshot = createEmptySnapshot();
  for (const id of skillIds) {
    snapshot.skillStates[id] = { masteryLocked: true };
  }
  return snapshot;
}

describe('badgeEvaluation', () => {
  describe('evaluateBadges', () => {
    it('returns empty array when no badges are earned (fresh state)', () => {
      const snapshot = createEmptySnapshot();
      const result = evaluateBadges(snapshot, {});
      expect(result).toEqual([]);
    });

    it('returns skill-mastery badge ID when skill has masteryLocked=true', () => {
      const snapshot = createMasteredSnapshot([
        'addition.single-digit.no-carry',
      ]);
      const result = evaluateBadges(snapshot, {});
      expect(result).toContain('mastery.addition.single-digit.no-carry');
    });

    it('skips already-earned badges', () => {
      const snapshot = createMasteredSnapshot([
        'addition.single-digit.no-carry',
      ]);
      const earnedBadges = {
        'mastery.addition.single-digit.no-carry': {
          earnedAt: '2026-01-01T00:00:00Z',
        },
      };
      const result = evaluateBadges(snapshot, earnedBadges);
      expect(result).not.toContain('mastery.addition.single-digit.no-carry');
    });

    it('returns category-mastery badge when ALL skills of an operation are mastered', () => {
      const additionSkillIds = SKILLS.filter(
        (s) => s.operation === 'addition',
      ).map((s) => s.id);
      const snapshot = createMasteredSnapshot(additionSkillIds);
      const result = evaluateBadges(snapshot, {});
      expect(result).toContain('mastery.category.addition');
    });

    it('does NOT return category-mastery badge when only SOME skills are mastered', () => {
      const snapshot = createMasteredSnapshot([
        'addition.single-digit.no-carry',
        'addition.within-20.no-carry',
      ]);
      const result = evaluateBadges(snapshot, {});
      expect(result).not.toContain('mastery.category.addition');
    });

    it('returns grade-mastery badge when ALL skills of a grade are mastered', () => {
      const grade1SkillIds = SKILLS.filter((s) => s.grade === 1).map(
        (s) => s.id,
      );
      const snapshot = createMasteredSnapshot(grade1SkillIds);
      const result = evaluateBadges(snapshot, {});
      expect(result).toContain('mastery.grade.1');
    });

    it('returns streak-milestone badge when weeklyStreak >= threshold', () => {
      const snapshot = createEmptySnapshot();
      snapshot.weeklyStreak = 4;
      const result = evaluateBadges(snapshot, {});
      expect(result).toContain('behavior.streak.bronze');
      expect(result).toContain('behavior.streak.silver');
      expect(result).not.toContain('behavior.streak.gold');
    });

    it('returns sessions-milestone badge when sessionsCompleted >= threshold', () => {
      const snapshot = createEmptySnapshot();
      snapshot.sessionsCompleted = 50;
      const result = evaluateBadges(snapshot, {});
      expect(result).toContain('behavior.sessions.bronze');
      expect(result).toContain('behavior.sessions.silver');
      expect(result).not.toContain('behavior.sessions.gold');
    });

    it('returns remediation-victory badge when resolved misconception count >= threshold', () => {
      const snapshot = createEmptySnapshot();
      snapshot.misconceptions = {
        'bug-1': { status: 'resolved' },
        'bug-2': { status: 'confirmed' },
        'bug-3': { status: 'resolved' },
        'bug-4': { status: 'resolved' },
      };
      const result = evaluateBadges(snapshot, {});
      expect(result).toContain('behavior.remediation.bronze');
      expect(result).toContain('behavior.remediation.silver');
    });

    it('can return multiple badges in a single evaluation', () => {
      const snapshot = createMasteredSnapshot([
        'addition.single-digit.no-carry',
      ]);
      snapshot.weeklyStreak = 2;
      snapshot.sessionsCompleted = 10;
      const result = evaluateBadges(snapshot, {});
      expect(result).toContain('mastery.addition.single-digit.no-carry');
      expect(result).toContain('behavior.streak.bronze');
      expect(result).toContain('behavior.sessions.bronze');
      expect(result.length).toBeGreaterThanOrEqual(3);
    });

    it('is a pure function (same input produces same output, inputs not mutated)', () => {
      const snapshot = createMasteredSnapshot([
        'addition.single-digit.no-carry',
      ]);
      snapshot.weeklyStreak = 2;
      const earnedBadges = {
        'behavior.streak.bronze': { earnedAt: '2026-01-01T00:00:00Z' },
      };

      // Deep copy for mutation check
      const snapshotCopy = JSON.parse(JSON.stringify(snapshot));
      const earnedCopy = JSON.parse(JSON.stringify(earnedBadges));

      const result1 = evaluateBadges(snapshot, earnedBadges);
      const result2 = evaluateBadges(snapshot, earnedBadges);

      // Same output
      expect(result1).toEqual(result2);

      // Inputs not mutated
      expect(snapshot).toEqual(snapshotCopy);
      expect(earnedBadges).toEqual(earnedCopy);
    });
  });
});
