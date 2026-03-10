import { migrateStore } from '../../store/migrations';

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  randomUUID: () => 'migration-test-uuid',
}));

// Mock dependencies used by earlier migrations
jest.mock('../../services/adaptive/leitnerCalculator', () => ({
  mapPLToInitialBox: (p: number) => (p > 0.5 ? 3 : 1),
}));

jest.mock('../../services/cpa/cpaMappingService', () => ({
  deriveCpaStage: (p: number) => (p > 0.5 ? 'abstract' : 'concrete'),
}));

describe('migrateStore v12 -> v13', () => {
  const makeV12State = (): Record<string, unknown> => ({
    childName: 'Alice',
    childAge: 7,
    childGrade: 2,
    avatarId: 'fox',
    frameId: 'gold',
    themeId: 'ocean',
    tutorConsentGranted: true,
    skillStates: { 'add-single-digit': { eloRating: 1050 } },
    xp: 250,
    level: 3,
    weeklyStreak: 2,
    lastSessionDate: '2026-03-01',
    exploredManipulatives: ['blocks'],
    misconceptions: { m1: { count: 2 } },
    earnedBadges: { b1: { earned: true } },
    sessionsCompleted: 10,
    challengeCompletions: { c1: { done: true } },
    challengesCompleted: 5,
  });

  it('wraps all 18 fields into a children map entry', () => {
    const state = makeV12State();
    const result = migrateStore(state, 12);
    const children = result.children as Record<string, Record<string, unknown>>;
    const childIds = Object.keys(children);
    expect(childIds).toHaveLength(1);

    const child = children[childIds[0]];
    expect(child.childName).toBe('Alice');
    expect(child.childAge).toBe(7);
    expect(child.childGrade).toBe(2);
    expect(child.avatarId).toBe('fox');
    expect(child.frameId).toBe('gold');
    expect(child.themeId).toBe('ocean');
    expect(child.tutorConsentGranted).toBe(true);
    expect(child.skillStates).toEqual({ 'add-single-digit': { eloRating: 1050 } });
    expect(child.xp).toBe(250);
    expect(child.level).toBe(3);
    expect(child.weeklyStreak).toBe(2);
    expect(child.lastSessionDate).toBe('2026-03-01');
    expect(child.exploredManipulatives).toEqual(['blocks']);
    expect(child.misconceptions).toEqual({ m1: { count: 2 } });
    expect(child.earnedBadges).toEqual({ b1: { earned: true } });
    expect(child.sessionsCompleted).toBe(10);
    expect(child.challengeCompletions).toEqual({ c1: { done: true } });
    expect(child.challengesCompleted).toBe(5);
  });

  it('the migrated child entry has a UUID key', () => {
    const result = migrateStore(makeV12State(), 12);
    const children = result.children as Record<string, unknown>;
    expect(children['migration-test-uuid']).toBeDefined();
  });

  it('activeChildId is set to the same UUID', () => {
    const result = migrateStore(makeV12State(), 12);
    expect(result.activeChildId).toBe('migration-test-uuid');
  });

  it('_needsMigrationPrompt is set to true', () => {
    const result = migrateStore(makeV12State(), 12);
    expect(result._needsMigrationPrompt).toBe(true);
  });

  it('all original field values are preserved inside children map entry', () => {
    const original = makeV12State();
    const result = migrateStore({ ...original }, 12);
    const child = (result.children as Record<string, Record<string, unknown>>)[
      'migration-test-uuid'
    ];

    // Check every single field
    expect(child.childName).toBe(original.childName);
    expect(child.childAge).toBe(original.childAge);
    expect(child.childGrade).toBe(original.childGrade);
    expect(child.avatarId).toBe(original.avatarId);
    expect(child.frameId).toBe(original.frameId);
    expect(child.themeId).toBe(original.themeId);
    expect(child.tutorConsentGranted).toBe(original.tutorConsentGranted);
    expect(child.skillStates).toEqual(original.skillStates);
    expect(child.xp).toBe(original.xp);
    expect(child.level).toBe(original.level);
    expect(child.weeklyStreak).toBe(original.weeklyStreak);
    expect(child.lastSessionDate).toBe(original.lastSessionDate);
    expect(child.exploredManipulatives).toEqual(original.exploredManipulatives);
    expect(child.misconceptions).toEqual(original.misconceptions);
    expect(child.earnedBadges).toEqual(original.earnedBadges);
    expect(child.sessionsCompleted).toBe(original.sessionsCompleted);
    expect(child.challengeCompletions).toEqual(original.challengeCompletions);
    expect(child.challengesCompleted).toBe(original.challengesCompleted);
  });

  it('migrating from v0 (fresh install) produces valid state with children map entry', () => {
    const result = migrateStore(null, 0);
    expect(result.children).toBeDefined();
    expect(result.activeChildId).toBe('migration-test-uuid');
    const child = (result.children as Record<string, Record<string, unknown>>)[
      'migration-test-uuid'
    ];
    expect(child).toBeDefined();
    // Defaults from earlier migrations
    expect(child.childName).toBeNull();
    expect(child.skillStates).toEqual({});
    expect(child.xp).toBe(0);
  });

  it('sequential migration chain v0->v13 produces valid state', () => {
    const result = migrateStore(null, 0);
    // All expected top-level fields exist
    expect(result.children).toBeDefined();
    expect(result.activeChildId).toBeDefined();
    expect(result._needsMigrationPrompt).toBe(true);
    // Earlier migration fields are present on the flat state
    expect(result.tutorConsentGranted).toBe(true);
    expect(result.misconceptions).toEqual({});
    expect(result.earnedBadges).toEqual({});
    expect(result.challengeCompletions).toEqual({});
    expect(result.themeId).toBe('dark');
  });
});
