/** Base XP awarded for any correctly answered problem. */
export const BASE_XP = 10;

/** Reference Elo value where bonus XP is zero. */
const ELO_REFERENCE = 1000;

/** Scale factor for converting Elo difference to bonus XP. */
const SCALE_FACTOR = 0.01;

/**
 * Calculates XP earned for answering a problem correctly.
 *
 * XP scales with template difficulty: harder problems (higher baseElo)
 * earn more XP. There is a minimum floor of BASE_XP (10), so easy
 * problems never award less than the base amount.
 *
 * Examples:
 * - baseElo 800  -> 10 XP (floor)
 * - baseElo 1000 -> 10 XP (reference)
 * - baseElo 1250 -> 13 XP (bonus)
 *
 * @param templateBaseElo - The base Elo difficulty of the problem template
 * @returns XP amount (always >= BASE_XP)
 */
export function calculateXp(templateBaseElo: number): number {
  const bonus = Math.round((templateBaseElo - ELO_REFERENCE) * SCALE_FACTOR);
  return Math.max(BASE_XP, BASE_XP + bonus);
}
