import {
  getISOWeekNumber,
  isSameISOWeek,
  isConsecutiveWeek,
  computeStreakUpdate,
} from '@/services/gamification';

describe('weeklyStreak', () => {
  describe('getISOWeekNumber', () => {
    it('Monday 2026-03-02 is in week 10 of 2026', () => {
      const result = getISOWeekNumber(new Date(2026, 2, 2)); // March 2
      expect(result).toEqual({ year: 2026, week: 10 });
    });

    it('Sunday 2026-03-08 is also in week 10 of 2026', () => {
      const result = getISOWeekNumber(new Date(2026, 2, 8)); // March 8
      expect(result).toEqual({ year: 2026, week: 10 });
    });

    it('Monday 2026-03-09 is in week 11 of 2026', () => {
      const result = getISOWeekNumber(new Date(2026, 2, 9)); // March 9
      expect(result).toEqual({ year: 2026, week: 11 });
    });

    it('year boundary: 2025-12-29 (Monday) is in week 1 of 2026', () => {
      // Dec 29, 2025 is a Monday. Its Thursday (Jan 1, 2026) falls in 2026.
      const result = getISOWeekNumber(new Date(2025, 11, 29)); // Dec 29
      expect(result).toEqual({ year: 2026, week: 1 });
    });

    it('2025-12-28 (Sunday) is in the last week of 2025', () => {
      const result = getISOWeekNumber(new Date(2025, 11, 28)); // Dec 28
      expect(result.year).toBe(2025);
      // The last week of 2025 is week 52
      expect(result.week).toBe(52);
    });

    it('2026-01-01 (Thursday) is in week 1 of 2026', () => {
      const result = getISOWeekNumber(new Date(2026, 0, 1)); // Jan 1
      expect(result).toEqual({ year: 2026, week: 1 });
    });
  });

  describe('isSameISOWeek', () => {
    it('same week returns true (Mon and Sun of same week)', () => {
      const monday = new Date(2026, 2, 2); // March 2 (Monday)
      const sunday = new Date(2026, 2, 8); // March 8 (Sunday)
      expect(isSameISOWeek(monday, sunday)).toBe(true);
    });

    it('different weeks return false', () => {
      const sunday = new Date(2026, 2, 8); // March 8 (Sunday, week 10)
      const monday = new Date(2026, 2, 9); // March 9 (Monday, week 11)
      expect(isSameISOWeek(sunday, monday)).toBe(false);
    });

    it('same day returns true', () => {
      const date = new Date(2026, 2, 5);
      expect(isSameISOWeek(date, new Date(2026, 2, 5))).toBe(true);
    });

    it('different years but same ISO week returns true for year boundary', () => {
      // Dec 29, 2025 and Jan 1, 2026 are both in ISO week 1 of 2026
      const dec29 = new Date(2025, 11, 29);
      const jan1 = new Date(2026, 0, 1);
      expect(isSameISOWeek(dec29, jan1)).toBe(true);
    });
  });

  describe('isConsecutiveWeek', () => {
    it('week 10 to week 11 returns true', () => {
      const week10 = new Date(2026, 2, 2); // March 2 (Mon, week 10)
      const week11 = new Date(2026, 2, 9); // March 9 (Mon, week 11)
      expect(isConsecutiveWeek(week10, week11)).toBe(true);
    });

    it('week 10 to week 12 returns false', () => {
      const week10 = new Date(2026, 2, 2); // March 2 (Mon, week 10)
      const week12 = new Date(2026, 2, 16); // March 16 (Mon, week 12)
      expect(isConsecutiveWeek(week10, week12)).toBe(false);
    });

    it('same week returns false', () => {
      const monday = new Date(2026, 2, 2); // March 2
      const wednesday = new Date(2026, 2, 4); // March 4
      expect(isConsecutiveWeek(monday, wednesday)).toBe(false);
    });

    it('year boundary: last week of 2025 to week 1 of 2026 returns true', () => {
      // Dec 22, 2025 (Mon, week 52 of 2025) -> Dec 29, 2025 (Mon, week 1 of 2026)
      const week52 = new Date(2025, 11, 22);
      const week1 = new Date(2025, 11, 29);
      expect(isConsecutiveWeek(week52, week1)).toBe(true);
    });

    it('reversed order returns false (later before earlier)', () => {
      const week11 = new Date(2026, 2, 9);
      const week10 = new Date(2026, 2, 2);
      expect(isConsecutiveWeek(week11, week10)).toBe(false);
    });
  });

  describe('computeStreakUpdate', () => {
    it('first session (null lastSessionDate): streak becomes 1', () => {
      const result = computeStreakUpdate(null, new Date(2026, 2, 2), 0);
      expect(result).toEqual({ newStreak: 1, practicedThisWeek: true });
    });

    it('same week session: streak unchanged', () => {
      // Last session Monday, current session Wednesday, same week
      const lastDate = new Date(2026, 2, 2).toISOString(); // March 2 (Mon)
      const currentDate = new Date(2026, 2, 4); // March 4 (Wed)
      const result = computeStreakUpdate(lastDate, currentDate, 3);
      expect(result).toEqual({ newStreak: 3, practicedThisWeek: true });
    });

    it('consecutive week: streak increments by 1', () => {
      const lastDate = new Date(2026, 2, 2).toISOString(); // March 2 (week 10)
      const currentDate = new Date(2026, 2, 9); // March 9 (week 11)
      const result = computeStreakUpdate(lastDate, currentDate, 3);
      expect(result).toEqual({ newStreak: 4, practicedThisWeek: true });
    });

    it('two-week gap: streak resets to 1', () => {
      const lastDate = new Date(2026, 2, 2).toISOString(); // March 2 (week 10)
      const currentDate = new Date(2026, 2, 16); // March 16 (week 12)
      const result = computeStreakUpdate(lastDate, currentDate, 5);
      expect(result).toEqual({ newStreak: 1, practicedThisWeek: true });
    });

    it('three-week gap: streak resets to 1', () => {
      const lastDate = new Date(2026, 2, 2).toISOString(); // March 2 (week 10)
      const currentDate = new Date(2026, 2, 23); // March 23 (week 13)
      const result = computeStreakUpdate(lastDate, currentDate, 10);
      expect(result).toEqual({ newStreak: 1, practicedThisWeek: true });
    });

    it('multiple sessions same week after streak increment: streak unchanged', () => {
      // First practice this week was on Monday (streak already incremented to 4)
      // Now practicing again on Wednesday — should not change
      const lastDate = new Date(2026, 2, 9).toISOString(); // March 9 (Mon, week 11)
      const currentDate = new Date(2026, 2, 11); // March 11 (Wed, week 11)
      const result = computeStreakUpdate(lastDate, currentDate, 4);
      expect(result).toEqual({ newStreak: 4, practicedThisWeek: true });
    });

    it('year boundary consecutive weeks: streak increments', () => {
      const lastDate = new Date(2025, 11, 22).toISOString(); // Dec 22 (week 52 of 2025)
      const currentDate = new Date(2025, 11, 29); // Dec 29 (week 1 of 2026)
      const result = computeStreakUpdate(lastDate, currentDate, 2);
      expect(result).toEqual({ newStreak: 3, practicedThisWeek: true });
    });

    it('first session always returns practicedThisWeek true', () => {
      const result = computeStreakUpdate(null, new Date(), 0);
      expect(result.practicedThisWeek).toBe(true);
    });
  });
});
