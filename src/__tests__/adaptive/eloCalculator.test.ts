import {
  expectedScore,
  getKFactor,
  calculateEloUpdate,
  ELO_MIN,
  ELO_MAX,
} from '@/services/adaptive/eloCalculator';

describe('expectedScore', () => {
  it('returns 0.5 when ratings are equal', () => {
    expect(expectedScore(1000, 1000)).toBeCloseTo(0.5);
  });

  it('returns > 0.5 when student rated higher', () => {
    expect(expectedScore(1200, 1000)).toBeGreaterThan(0.5);
  });

  it('returns < 0.5 when student rated lower', () => {
    expect(expectedScore(800, 1000)).toBeLessThan(0.5);
  });

  it('is bounded in (0, 1) at extreme differences', () => {
    expect(expectedScore(600, 1400)).toBeGreaterThan(0);
    expect(expectedScore(1400, 600)).toBeLessThan(1);
  });
});

describe('getKFactor', () => {
  it('returns 40 at 0 attempts', () => {
    expect(getKFactor(0)).toBe(40);
  });

  it('returns approximately 28 at 20 attempts', () => {
    expect(getKFactor(20)).toBeCloseTo(28, 0);
  });

  it('is always above K_MIN=16 at any finite attempts', () => {
    const attemptValues = [0, 1, 10, 50, 100, 500, 1000, 10000];
    for (const attempts of attemptValues) {
      expect(getKFactor(attempts)).toBeGreaterThan(16);
    }
  });

  it('decreases monotonically as attempts increase', () => {
    const k10 = getKFactor(10);
    const k50 = getKFactor(50);
    const k200 = getKFactor(200);
    expect(k10).toBeGreaterThan(k50);
    expect(k50).toBeGreaterThan(k200);
  });
});

describe('calculateEloUpdate', () => {
  it('increases Elo on correct answer', () => {
    const result = calculateEloUpdate(1000, 1000, true, 10);
    expect(result.eloDelta).toBeGreaterThan(0);
    expect(result.newElo).toBeGreaterThan(1000);
  });

  it('decreases Elo on incorrect answer', () => {
    const result = calculateEloUpdate(1000, 1000, false, 10);
    expect(result.eloDelta).toBeLessThan(0);
    expect(result.newElo).toBeLessThan(1000);
  });

  it('clamps at ELO_MIN=600 (cannot go below)', () => {
    const result = calculateEloUpdate(610, 1400, false, 0);
    expect(result.newElo).toBeGreaterThanOrEqual(ELO_MIN);
  });

  it('clamps at ELO_MAX=1400 (cannot go above)', () => {
    const result = calculateEloUpdate(1390, 600, true, 0);
    expect(result.newElo).toBeLessThanOrEqual(ELO_MAX);
  });

  it('returns rounded integer Elo', () => {
    const result = calculateEloUpdate(1000, 1050, true, 5);
    expect(result.newElo).toBe(Math.round(result.newElo));
  });

  it('eloDelta reflects actual change after clamping', () => {
    // At the boundary, delta should be limited by the clamp
    const result = calculateEloUpdate(610, 1400, false, 0);
    expect(result.eloDelta).toBe(result.newElo - 610);
  });

  it('high attempts produce smaller delta than low attempts for same correct answer', () => {
    const newStudent = calculateEloUpdate(1000, 1000, true, 0);
    const veteranStudent = calculateEloUpdate(1000, 1000, true, 200);
    expect(Math.abs(newStudent.eloDelta)).toBeGreaterThan(
      Math.abs(veteranStudent.eloDelta),
    );
  });
});
