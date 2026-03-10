import { migrateStore } from '../../store/migrations';

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid-chain',
}));

jest.mock('../../services/adaptive/leitnerCalculator', () => ({
  mapPLToInitialBox: (p: number) => (p > 0.5 ? 3 : 1),
}));

jest.mock('../../services/cpa/cpaMappingService', () => ({
  deriveCpaStage: (p: number) => (p > 0.5 ? 'abstract' : 'concrete'),
}));

describe('Migration chain v13 → v14 → v15', () => {
  /** Create a valid v13 state (post multi-child migration) */
  function makeV13State(): Record<string, unknown> {
    return {
      children: {
        'child-uuid-1': {
          childName: 'Bob',
          childAge: 8,
          childGrade: 3,
          avatarId: 'cat',
          frameId: null,
          themeId: 'dark',
          tutorConsentGranted: true,
          skillStates: {
            'addition.single-digit.no-carry': {
              eloRating: 1050,
              masteryProbability: 0.9,
              consecutiveWrong: 0,
              masteryLocked: true,
              leitnerBox: 5,
              nextReviewDue: null,
              consecutiveCorrectInBox6: 0,
              cpaLevel: 'abstract',
            },
          },
          xp: 500,
          level: 4,
          weeklyStreak: 3,
          lastSessionDate: '2026-03-08',
          exploredManipulatives: [],
          misconceptions: {},
          earnedBadges: { 'first-session': { earnedAt: '2026-03-01' } },
          sessionsCompleted: 20,
          challengeCompletions: {},
          challengesCompleted: 0,
        },
      },
      activeChildId: 'child-uuid-1',
      _needsMigrationPrompt: false,
      tutorConsentGranted: true,
      misconceptions: {},
      earnedBadges: {},
      challengeCompletions: {},
      themeId: 'dark',
    };
  }

  it('v13 → v14 adds auth fields with defaults', () => {
    const state = makeV13State();
    const result = migrateStore(state, 13);

    expect(result.userId).toBeNull();
    expect(result.authProvider).toBeNull();
    expect(result.userEmail).toBeNull();
    expect(result.userDisplayName).toBeNull();
    expect(result.isSignedIn).toBe(false);
  });

  it('v13 → v14 preserves all existing data', () => {
    const state = makeV13State();
    const result = migrateStore(state, 13);

    // Children map preserved
    const children = result.children as Record<string, Record<string, unknown>>;
    expect(children['child-uuid-1']).toBeDefined();
    expect(children['child-uuid-1'].childName).toBe('Bob');
    expect(children['child-uuid-1'].xp).toBe(500);
    expect(result.activeChildId).toBe('child-uuid-1');
  });

  it('v14 → v15 adds session history', () => {
    const state = { ...makeV13State(), userId: null, authProvider: null, userEmail: null, userDisplayName: null, isSignedIn: false };
    const result = migrateStore(state, 14);

    expect(result.sessionHistory).toEqual([]);
  });

  it('v14 → v15 preserves auth fields', () => {
    const state = {
      ...makeV13State(),
      userId: 'user-123',
      authProvider: 'google',
      userEmail: 'bob@example.com',
      userDisplayName: 'Bob',
      isSignedIn: true,
    };
    const result = migrateStore(state, 14);

    expect(result.userId).toBe('user-123');
    expect(result.authProvider).toBe('google');
    expect(result.userEmail).toBe('bob@example.com');
    expect(result.isSignedIn).toBe(true);
    expect(result.sessionHistory).toEqual([]);
  });

  it('full chain v0 → v15 produces complete state', () => {
    const result = migrateStore(null, 0);

    // v2 defaults
    expect(result.childName).toBeNull();
    expect(result.skillStates).toEqual({});
    expect(result.xp).toBe(0);

    // v6 tutor consent
    expect(result.tutorConsentGranted).toBe(true);

    // v7 misconceptions
    expect(result.misconceptions).toEqual({});

    // v9 achievements
    expect(result.earnedBadges).toEqual({});
    expect(result.sessionsCompleted).toBe(0);

    // v10 challenges
    expect(result.challengeCompletions).toEqual({});

    // v11 frames
    expect(result.frameId).toBeNull();

    // v12 theme
    expect(result.themeId).toBe('dark');

    // v13 multi-child
    expect(result.children).toBeDefined();
    expect(result.activeChildId).toBe('test-uuid-chain');

    // v14 auth
    expect(result.userId).toBeNull();
    expect(result.isSignedIn).toBe(false);

    // v15 session history
    expect(result.sessionHistory).toEqual([]);
  });

  it('v13 → v15 skips already-present fields', () => {
    const state = {
      ...makeV13State(),
      // Already has v14 fields
      userId: 'existing-user',
      authProvider: 'apple',
      userEmail: 'test@test.com',
      userDisplayName: 'Test',
      isSignedIn: true,
      // Already has v15 field
      sessionHistory: [{ completedAt: '2026-03-09' }],
    };
    const result = migrateStore(state, 13);

    // Existing values should NOT be overwritten by ??= defaults
    expect(result.userId).toBe('existing-user');
    expect(result.authProvider).toBe('apple');
    expect(result.isSignedIn).toBe(true);
    expect(result.sessionHistory).toEqual([{ completedAt: '2026-03-09' }]);
  });

  it('migrating with skill states preserves BKT and Leitner fields', () => {
    // Start from v2 state with skill states that need v3/v4/v5 migrations
    const state: Record<string, unknown> = {
      childName: 'Tina',
      childAge: 7,
      childGrade: 2,
      avatarId: null,
      skillStates: {
        'addition.single-digit.no-carry': {
          eloRating: 900,
          attempts: 10,
          correct: 7,
        },
      },
      xp: 100,
      level: 2,
      weeklyStreak: 1,
      lastSessionDate: '2026-03-01',
    };

    const result = migrateStore(state, 2);

    // v3 BKT fields added
    const children = result.children as Record<string, Record<string, unknown>>;
    const childSkills = children['test-uuid-chain'].skillStates as Record<string, Record<string, unknown>>;
    // Note: skills are also on the flat state since v13 preserves flat fields
    const flatSkills = result.skillStates as Record<string, Record<string, unknown>>;
    const skill = flatSkills['addition.single-digit.no-carry'];

    expect(skill.masteryProbability).toBeDefined();
    expect(skill.consecutiveWrong).toBe(0);
    expect(skill.masteryLocked).toBe(false);

    // v4 Leitner fields added
    expect(skill.leitnerBox).toBeDefined();
    expect(skill.nextReviewDue).toBeNull();
    expect(skill.consecutiveCorrectInBox6).toBe(0);

    // v5 CPA level added
    expect(skill.cpaLevel).toBeDefined();

    // v14/v15 additions
    expect(result.userId).toBeNull();
    expect(result.sessionHistory).toEqual([]);
  });
});
