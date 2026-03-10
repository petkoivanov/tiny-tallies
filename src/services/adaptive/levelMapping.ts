/**
 * Maps Elo rating to a child-friendly level (1-10).
 *
 * Level 1:  600-700
 * Level 2:  700-780
 * Level 3:  780-860
 * Level 4:  860-940
 * Level 5:  940-1020
 * Level 6:  1020-1100
 * Level 7:  1100-1160
 * Level 8:  1160-1240
 * Level 9:  1240-1320
 * Level 10: 1320+
 */
const LEVEL_THRESHOLDS = [600, 700, 780, 860, 940, 1020, 1100, 1160, 1240, 1320];

export function eloToLevel(elo: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (elo >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

/** Returns the Elo range [min, max] for a given level */
export function levelToEloRange(level: number): { min: number; max: number } {
  const clamped = Math.max(1, Math.min(10, level));
  const min = LEVEL_THRESHOLDS[clamped - 1];
  const max = clamped < 10 ? LEVEL_THRESHOLDS[clamped] - 1 : 1400;
  return { min, max };
}

/** Returns progress within the current level as 0-1 */
export function levelProgress(elo: number): number {
  const level = eloToLevel(elo);
  const { min, max } = levelToEloRange(level);
  if (max === min) return 1;
  return Math.min(1, Math.max(0, (elo - min) / (max - min + 1)));
}
