/**
 * Weekly streak tracking based on ISO 8601 calendar weeks (Monday-Sunday).
 *
 * Streak increments when a session is completed in a new calendar week.
 * Streak resets to 1 (new streak) if a full week is missed.
 * Multiple sessions in the same week do not change the streak.
 */

/** ISO week result with year to handle year-boundary edge cases. */
export interface ISOWeek {
  year: number;
  week: number;
}

/**
 * Returns the ISO 8601 week number (Monday-based) and year for a given date.
 *
 * Algorithm: find the Thursday of the date's week, then derive
 * the year and week number from that Thursday.
 *
 * ISO 8601 rules:
 * - Weeks start on Monday.
 * - Week 1 of a year is the week containing the first Thursday of January.
 * - A date in late December can belong to week 1 of the next year.
 * - A date in early January can belong to the last week of the previous year.
 *
 * @param date - The date to compute the ISO week for
 * @returns ISO year and week number
 */
export function getISOWeekNumber(date: Date): ISOWeek {
  // Work in UTC to avoid DST issues causing off-by-one day differences
  const y = date.getFullYear();
  const m = date.getMonth();
  const day = date.getDate();

  // Create a UTC timestamp for the date at noon (avoids edge issues)
  const utcMs = Date.UTC(y, m, day);
  const d = new Date(utcMs);

  // ISO day of week: Monday=1 ... Sunday=7
  const dayOfWeek = d.getUTCDay() === 0 ? 7 : d.getUTCDay();

  // Set to the Thursday of this ISO week (Thursday is always in the correct ISO year)
  d.setUTCDate(d.getUTCDate() + (4 - dayOfWeek));

  const isoYear = d.getUTCFullYear();

  // January 1st of the Thursday's year (in UTC)
  const jan1 = Date.UTC(isoYear, 0, 1);

  // Days between Jan 1 and the Thursday
  const daysDiff = Math.round((d.getTime() - jan1) / (24 * 60 * 60 * 1000));
  const week = Math.floor(daysDiff / 7) + 1;

  return { year: isoYear, week };
}

/**
 * Returns true if both dates fall in the same ISO 8601 week.
 *
 * Compares both year AND week number to handle year boundaries correctly.
 *
 * @param dateA - First date
 * @param dateB - Second date
 * @returns True if same ISO week
 */
export function isSameISOWeek(dateA: Date, dateB: Date): boolean {
  const weekA = getISOWeekNumber(dateA);
  const weekB = getISOWeekNumber(dateB);
  return weekA.year === weekB.year && weekA.week === weekB.week;
}

/**
 * Returns true if `later` is in the ISO week immediately following `earlier`.
 *
 * Handles year boundaries where the last week of a year (52 or 53) is
 * followed by week 1 of the next year.
 *
 * @param earlier - The earlier date
 * @param later   - The later date
 * @returns True if the dates are in consecutive ISO weeks
 */
export function isConsecutiveWeek(earlier: Date, later: Date): boolean {
  const weekEarlier = getISOWeekNumber(earlier);
  const weekLater = getISOWeekNumber(later);

  // Same year, consecutive week numbers
  if (
    weekLater.year === weekEarlier.year &&
    weekLater.week === weekEarlier.week + 1
  ) {
    return true;
  }

  // Year boundary: last week of year -> week 1 of next year
  if (
    weekLater.year === weekEarlier.year + 1 &&
    weekLater.week === 1
  ) {
    // Verify the earlier week is actually the last week of its year
    // by checking that week 1 of the next year does not include the earlier date
    // (i.e., the earlier week number is >= 52)
    if (weekEarlier.week >= 52) {
      return true;
    }
  }

  return false;
}

/**
 * Computes the updated streak value after completing a session.
 *
 * Rules:
 * - First-ever session (null lastSessionDate): new streak of 1.
 * - Same ISO week as last session: no change (already counted this week).
 * - Consecutive ISO week: streak increments by 1.
 * - Gap of 2+ weeks: streak resets to 1 (this session starts a new streak).
 *
 * Note: The returned newStreak is the value AFTER this session commits.
 * A "reset" always yields 1 (not 0) because the current session itself counts.
 *
 * @param lastSessionDate - ISO date string of the last session, or null if never practiced
 * @param currentDate     - The current date (when this session completes)
 * @param currentStreak   - The streak value before this session
 * @returns Updated streak count and whether this week now has a session
 */
export function computeStreakUpdate(
  lastSessionDate: string | null,
  currentDate: Date,
  currentStreak: number,
): { newStreak: number; practicedThisWeek: boolean } {
  // First-ever session
  if (lastSessionDate === null) {
    return { newStreak: 1, practicedThisWeek: true };
  }

  const lastDate = new Date(lastSessionDate);

  // Same ISO week: no streak change, already counted
  if (isSameISOWeek(lastDate, currentDate)) {
    return { newStreak: currentStreak, practicedThisWeek: true };
  }

  // Consecutive ISO week: streak continues
  if (isConsecutiveWeek(lastDate, currentDate)) {
    return { newStreak: currentStreak + 1, practicedThisWeek: true };
  }

  // Gap of 2+ weeks: reset and start fresh
  return { newStreak: 1, practicedThisWeek: true };
}
