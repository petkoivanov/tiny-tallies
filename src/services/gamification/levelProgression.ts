/** Base XP needed per level before the per-level increment. */
export const BASE_LEVEL_XP = 100;

/** Additional XP added per level (level N needs BASE_LEVEL_XP + N * LEVEL_XP_INCREMENT). */
export const LEVEL_XP_INCREMENT = 20;

/**
 * Returns the cumulative XP threshold required to REACH a given level.
 *
 * Level 1 requires 0 XP (starting level).
 * Level 2 requires 120 XP (100 + 1*20).
 * Level 3 requires 120 + 140 = 260 XP (100 + 2*20).
 *
 * Formula: sum from i=1 to (level-1) of (BASE_LEVEL_XP + i * LEVEL_XP_INCREMENT)
 * Closed-form: (level-1) * BASE_LEVEL_XP + LEVEL_XP_INCREMENT * (level-1) * level / 2
 *
 * @param level - The level to calculate the threshold for (must be >= 1)
 * @returns Cumulative XP needed to reach this level
 */
export function calculateXpForLevel(level: number): number {
  if (level <= 1) return 0;

  const n = level - 1;
  // Sum of (BASE_LEVEL_XP + i * LEVEL_XP_INCREMENT) for i = 1..n
  // = n * BASE_LEVEL_XP + LEVEL_XP_INCREMENT * n * (n + 1) / 2
  return n * BASE_LEVEL_XP + LEVEL_XP_INCREMENT * (n * (n + 1)) / 2;
}

/**
 * Given cumulative total XP, derives the current level and progress info.
 *
 * Walks levels upward until totalXp is less than the threshold for the next level.
 * Level starts at 1 (0 XP).
 *
 * @param totalXp - The player's cumulative total XP
 * @returns Current level, XP progress into current level, and XP needed for next level
 */
export function calculateLevelFromXp(totalXp: number): {
  level: number;
  xpIntoCurrentLevel: number;
  xpNeededForNextLevel: number;
} {
  let level = 1;

  while (totalXp >= calculateXpForLevel(level + 1)) {
    level++;
  }

  const currentLevelThreshold = calculateXpForLevel(level);
  const nextLevelThreshold = calculateXpForLevel(level + 1);

  return {
    level,
    xpIntoCurrentLevel: totalXp - currentLevelThreshold,
    xpNeededForNextLevel: nextLevelThreshold - currentLevelThreshold,
  };
}

/**
 * Compares old vs new total XP to detect level changes.
 *
 * Supports multi-level jumps (levelsGained can be > 1).
 *
 * @param previousTotalXp - Total XP before earning new XP
 * @param newTotalXp      - Total XP after earning new XP
 * @returns Level-up detection result
 */
export function detectLevelUp(
  previousTotalXp: number,
  newTotalXp: number,
): {
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
  levelsGained: number;
} {
  const previous = calculateLevelFromXp(previousTotalXp);
  const current = calculateLevelFromXp(newTotalXp);

  const levelsGained = current.level - previous.level;

  return {
    leveledUp: levelsGained > 0,
    previousLevel: previous.level,
    newLevel: current.level,
    levelsGained,
  };
}
