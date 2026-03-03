import {
  calculateXpForLevel,
  calculateLevelFromXp,
  detectLevelUp,
  BASE_LEVEL_XP,
  LEVEL_XP_INCREMENT,
} from '@/services/gamification';

describe('levelProgression', () => {
  describe('constants', () => {
    it('exports BASE_LEVEL_XP as 100', () => {
      expect(BASE_LEVEL_XP).toBe(100);
    });

    it('exports LEVEL_XP_INCREMENT as 20', () => {
      expect(LEVEL_XP_INCREMENT).toBe(20);
    });
  });

  describe('calculateXpForLevel', () => {
    it('level 1 requires 0 XP', () => {
      expect(calculateXpForLevel(1)).toBe(0);
    });

    it('level 2 requires 120 XP (100 + 1*20)', () => {
      expect(calculateXpForLevel(2)).toBe(120);
    });

    it('level 3 requires 260 XP (120 + 100 + 2*20)', () => {
      expect(calculateXpForLevel(3)).toBe(260);
    });

    it('level 4 requires 420 XP (260 + 100 + 3*20)', () => {
      expect(calculateXpForLevel(4)).toBe(420);
    });

    it('returns 0 for level 0 or negative', () => {
      expect(calculateXpForLevel(0)).toBe(0);
      expect(calculateXpForLevel(-1)).toBe(0);
    });
  });

  describe('calculateLevelFromXp', () => {
    it('0 XP = level 1 with 0/120 progress', () => {
      const result = calculateLevelFromXp(0);
      expect(result.level).toBe(1);
      expect(result.xpIntoCurrentLevel).toBe(0);
      expect(result.xpNeededForNextLevel).toBe(120);
    });

    it('119 XP = level 1 with 119/120 progress', () => {
      const result = calculateLevelFromXp(119);
      expect(result.level).toBe(1);
      expect(result.xpIntoCurrentLevel).toBe(119);
      expect(result.xpNeededForNextLevel).toBe(120);
    });

    it('120 XP = level 2 with 0/140 progress', () => {
      const result = calculateLevelFromXp(120);
      expect(result.level).toBe(2);
      expect(result.xpIntoCurrentLevel).toBe(0);
      expect(result.xpNeededForNextLevel).toBe(140);
    });

    it('250 XP = level 2 with 130/140 progress', () => {
      const result = calculateLevelFromXp(250);
      expect(result.level).toBe(2);
      expect(result.xpIntoCurrentLevel).toBe(130);
      expect(result.xpNeededForNextLevel).toBe(140);
    });

    it('260 XP = level 3', () => {
      const result = calculateLevelFromXp(260);
      expect(result.level).toBe(3);
      expect(result.xpIntoCurrentLevel).toBe(0);
    });

    it('handles very large XP values correctly', () => {
      const result = calculateLevelFromXp(10000);
      expect(result.level).toBeGreaterThan(1);
      // Verify round-trip: threshold for this level <= 10000 < threshold for next level
      expect(calculateXpForLevel(result.level)).toBeLessThanOrEqual(10000);
      expect(calculateXpForLevel(result.level + 1)).toBeGreaterThan(10000);
      // Progress should be consistent
      expect(result.xpIntoCurrentLevel).toBe(
        10000 - calculateXpForLevel(result.level),
      );
      expect(result.xpNeededForNextLevel).toBe(
        calculateXpForLevel(result.level + 1) - calculateXpForLevel(result.level),
      );
    });
  });

  describe('detectLevelUp', () => {
    it('no level change when staying within level 1 (0 -> 50)', () => {
      const result = detectLevelUp(0, 50);
      expect(result.leveledUp).toBe(false);
      expect(result.previousLevel).toBe(1);
      expect(result.newLevel).toBe(1);
      expect(result.levelsGained).toBe(0);
    });

    it('single level up (50 -> 130)', () => {
      const result = detectLevelUp(50, 130);
      expect(result.leveledUp).toBe(true);
      expect(result.previousLevel).toBe(1);
      expect(result.newLevel).toBe(2);
      expect(result.levelsGained).toBe(1);
    });

    it('multi-level jump (0 -> 300)', () => {
      const result = detectLevelUp(0, 300);
      expect(result.leveledUp).toBe(true);
      expect(result.previousLevel).toBe(1);
      expect(result.newLevel).toBe(3);
      expect(result.levelsGained).toBe(2);
    });

    it('no change when XP is the same', () => {
      const result = detectLevelUp(100, 100);
      expect(result.leveledUp).toBe(false);
      expect(result.previousLevel).toBe(1);
      expect(result.newLevel).toBe(1);
      expect(result.levelsGained).toBe(0);
    });

    it('detects level up at exact boundary (0 -> 120)', () => {
      const result = detectLevelUp(0, 120);
      expect(result.leveledUp).toBe(true);
      expect(result.previousLevel).toBe(1);
      expect(result.newLevel).toBe(2);
      expect(result.levelsGained).toBe(1);
    });

    it('handles very large XP values', () => {
      const result = detectLevelUp(9000, 10000);
      expect(typeof result.leveledUp).toBe('boolean');
      expect(result.newLevel).toBeGreaterThanOrEqual(result.previousLevel);
      expect(result.levelsGained).toBe(result.newLevel - result.previousLevel);
    });
  });
});
