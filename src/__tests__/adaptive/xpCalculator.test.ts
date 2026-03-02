import { calculateXp, BASE_XP } from '@/services/adaptive/xpCalculator';

describe('xpCalculator', () => {
  it('baseElo 1000 gives BASE_XP', () => {
    expect(calculateXp(1000)).toBe(10);
  });

  it('baseElo 1250 gives more XP', () => {
    expect(calculateXp(1250)).toBe(13);
  });

  it('baseElo 800 gives minimum BASE_XP', () => {
    expect(calculateXp(800)).toBe(10);
  });

  it('baseElo 600 gives minimum BASE_XP', () => {
    expect(calculateXp(600)).toBe(10);
  });

  it('higher baseElo always gives >= lower baseElo XP', () => {
    const elos = [600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400];
    for (let i = 1; i < elos.length; i++) {
      expect(calculateXp(elos[i])).toBeGreaterThanOrEqual(
        calculateXp(elos[i - 1]),
      );
    }
  });
});
