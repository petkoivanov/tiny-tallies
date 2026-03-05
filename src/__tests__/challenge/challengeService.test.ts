import {
  getDateSeed,
  getTodayDateKey,
  getTodaysChallenge,
  getChallengeSkillIds,
  evaluateChallengeGoals,
  CHALLENGE_THEMES,
} from '@/services/challenge';
import type { SkillState } from '@/store/slices/skillStatesSlice';

// Helper to create a minimal SkillState for testing
function makeSkillState(overrides: Partial<SkillState> = {}): SkillState {
  return {
    eloRating: 1000,
    attempts: 5,
    correct: 3,
    masteryProbability: 0.5,
    consecutiveWrong: 0,
    masteryLocked: true,
    leitnerBox: 3 as SkillState['leitnerBox'],
    nextReviewDue: null,
    consecutiveCorrectInBox6: 0,
    cpaLevel: 'abstract' as SkillState['cpaLevel'],
    ...overrides,
  };
}

describe('challengeService', () => {
  describe('getDateSeed', () => {
    it('returns YYYYMMDD integer for a given date', () => {
      const date = new Date(2026, 2, 5); // March 5, 2026
      expect(getDateSeed(date)).toBe(20260305);
    });

    it('returns different seeds for different dates', () => {
      const d1 = new Date(2026, 0, 1);
      const d2 = new Date(2026, 0, 2);
      expect(getDateSeed(d1)).not.toBe(getDateSeed(d2));
    });
  });

  describe('getTodayDateKey', () => {
    it('returns YYYY-MM-DD string', () => {
      const date = new Date(2026, 2, 5);
      expect(getTodayDateKey(date)).toBe('2026-03-05');
    });

    it('zero-pads month and day', () => {
      const date = new Date(2026, 0, 9);
      expect(getTodayDateKey(date)).toBe('2026-01-09');
    });
  });

  describe('getTodaysChallenge', () => {
    it('returns same theme for same date (deterministic)', () => {
      const date = new Date(2026, 2, 5);
      const theme1 = getTodaysChallenge(date);
      const theme2 = getTodaysChallenge(date);
      expect(theme1.id).toBe(theme2.id);
    });

    it('returns different themes for different dates', () => {
      const themes = new Set<string>();
      // Check 10 consecutive days -- should hit multiple different themes
      for (let i = 0; i < 10; i++) {
        const date = new Date(2026, 2, 1 + i);
        themes.add(getTodaysChallenge(date).id);
      }
      expect(themes.size).toBeGreaterThan(1);
    });

    it('cycles through all 5 themes across enough days', () => {
      const themes = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const date = new Date(2026, 0, 1 + i);
        themes.add(getTodaysChallenge(date).id);
      }
      expect(themes.size).toBe(5);
    });
  });

  describe('getChallengeSkillIds', () => {
    // Build skill states where all skills are mastered (so all unlocked)
    const allMasteredStates: Record<string, SkillState> = {};
    const allSkillIds = [
      'addition.single-digit.no-carry',
      'addition.within-20.no-carry',
      'addition.within-20.with-carry',
      'addition.two-digit.no-carry',
      'addition.two-digit.with-carry',
      'addition.three-digit.no-carry',
      'addition.three-digit.with-carry',
      'subtraction.single-digit.no-borrow',
      'subtraction.within-20.no-borrow',
      'subtraction.within-20.with-borrow',
      'subtraction.two-digit.no-borrow',
      'subtraction.two-digit.with-borrow',
      'subtraction.three-digit.no-borrow',
      'subtraction.three-digit.with-borrow',
    ];
    for (const id of allSkillIds) {
      allMasteredStates[id] = makeSkillState({ masteryLocked: true });
    }

    it('returns only addition skills for addition-adventure theme', () => {
      const theme = CHALLENGE_THEMES.find(
        (t) => t.id === 'addition-adventure',
      )!;
      const skillIds = getChallengeSkillIds(theme, allMasteredStates);
      expect(skillIds.length).toBeGreaterThan(0);
      expect(skillIds.every((id) => id.startsWith('addition.'))).toBe(true);
    });

    it('returns only subtraction skills for subtraction-sprint theme', () => {
      const theme = CHALLENGE_THEMES.find(
        (t) => t.id === 'subtraction-sprint',
      )!;
      const skillIds = getChallengeSkillIds(theme, allMasteredStates);
      expect(skillIds.length).toBeGreaterThan(0);
      expect(skillIds.every((id) => id.startsWith('subtraction.'))).toBe(true);
    });

    it('returns only grade 1 skills for number-bonds theme', () => {
      const theme = CHALLENGE_THEMES.find((t) => t.id === 'number-bonds')!;
      const skillIds = getChallengeSkillIds(theme, allMasteredStates);
      expect(skillIds.length).toBeGreaterThan(0);
      // Grade 1 skills: single-digit, within-20 variants
      for (const id of skillIds) {
        expect(
          id.includes('single-digit') || id.includes('within-20'),
        ).toBe(true);
      }
    });

    it('returns only grade 2-3 skills for place-value-power theme', () => {
      const theme = CHALLENGE_THEMES.find(
        (t) => t.id === 'place-value-power',
      )!;
      const skillIds = getChallengeSkillIds(theme, allMasteredStates);
      expect(skillIds.length).toBeGreaterThan(0);
      // Grade 2-3 skills: two-digit, three-digit
      for (const id of skillIds) {
        expect(
          id.includes('two-digit') || id.includes('three-digit'),
        ).toBe(true);
      }
    });

    it('falls back to all unlocked skills when filtered set is empty', () => {
      // Only have grade 1 skills unlocked, pick a theme that wants grade 2-3
      const grade1Only: Record<string, SkillState> = {
        'addition.single-digit.no-carry': makeSkillState(),
        'subtraction.single-digit.no-borrow': makeSkillState(),
      };
      const theme = CHALLENGE_THEMES.find(
        (t) => t.id === 'place-value-power',
      )!;
      const skillIds = getChallengeSkillIds(theme, grade1Only);
      // Should fall back to all unlocked (the 2 root skills)
      expect(skillIds.length).toBeGreaterThan(0);
    });
  });

  describe('evaluateChallengeGoals', () => {
    const theme = CHALLENGE_THEMES.find(
      (t) => t.id === 'addition-adventure',
    )!;

    it('returns accuracyGoalMet true when score >= accuracyTarget', () => {
      const result = evaluateChallengeGoals(8, 10, 2, theme);
      expect(result.accuracyGoalMet).toBe(true);
    });

    it('returns streakGoalMet true when maxStreak >= streakTarget', () => {
      const result = evaluateChallengeGoals(3, 10, 4, theme);
      expect(result.streakGoalMet).toBe(true);
    });

    it('returns both false when neither goal met', () => {
      const result = evaluateChallengeGoals(3, 10, 1, theme);
      expect(result.accuracyGoalMet).toBe(false);
      expect(result.streakGoalMet).toBe(false);
    });

    it('returns both true when both goals met', () => {
      const result = evaluateChallengeGoals(10, 10, 5, theme);
      expect(result.accuracyGoalMet).toBe(true);
      expect(result.streakGoalMet).toBe(true);
    });
  });

  describe('CHALLENGE_THEMES', () => {
    it('has exactly 5 entries', () => {
      expect(CHALLENGE_THEMES).toHaveLength(5);
    });

    it('each theme has valid structure', () => {
      for (const theme of CHALLENGE_THEMES) {
        expect(theme.id).toBeTruthy();
        expect(theme.name).toBeTruthy();
        expect(theme.emoji).toBeTruthy();
        expect(theme.description).toBeTruthy();
        expect(theme.skillFilter).toBeDefined();
        expect(theme.goals.accuracyTarget).toBeGreaterThan(0);
        expect(theme.goals.streakTarget).toBeGreaterThan(0);
      }
    });
  });
});
