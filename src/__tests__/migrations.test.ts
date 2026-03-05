import { migrateStore } from '@/store/migrations';

describe('store migrations', () => {
  it('migrateStore from version 1 fills defaults for all persisted fields', () => {
    const result = migrateStore({}, 1);

    // Child profile defaults
    expect(result.childName).toBeNull();
    expect(result.childAge).toBeNull();
    expect(result.childGrade).toBeNull();
    expect(result.avatarId).toBeNull();

    // Skill states default
    expect(result.skillStates).toEqual({});

    // Gamification defaults
    expect(result.xp).toBe(0);
    expect(result.level).toBe(1);
    expect(result.weeklyStreak).toBe(0);
    expect(result.lastSessionDate).toBeNull();
  });

  it('migrateStore from version 2 applies v3 migration (BKT defaults)', () => {
    const input = { childName: 'Luna', xp: 100, skillStates: {} };
    const result = migrateStore(input, 2);
    // Empty skillStates still empty after migration
    expect(result.skillStates).toEqual({});
    expect(result.childName).toBe('Luna');
    expect(result.xp).toBe(100);
  });

  it('migrateStore handles null persistedState', () => {
    const result = migrateStore(null, 0);

    expect(result.childName).toBeNull();
    expect(result.childAge).toBeNull();
    expect(result.childGrade).toBeNull();
    expect(result.avatarId).toBeNull();
    expect(result.skillStates).toEqual({});
    expect(result.xp).toBe(0);
    expect(result.level).toBe(1);
    expect(result.weeklyStreak).toBe(0);
    expect(result.lastSessionDate).toBeNull();
  });

  it('migrateStore preserves existing values during v1->v2 migration', () => {
    const input = { childName: 'Luna', xp: 50, level: 3 };
    const result = migrateStore(input, 1);

    // Existing values preserved
    expect(result.childName).toBe('Luna');
    expect(result.xp).toBe(50);
    expect(result.level).toBe(3);

    // Missing values filled with defaults
    expect(result.childAge).toBeNull();
    expect(result.childGrade).toBeNull();
    expect(result.avatarId).toBeNull();
    expect(result.skillStates).toEqual({});
    expect(result.weeklyStreak).toBe(0);
    expect(result.lastSessionDate).toBeNull();
  });

  it('migrateStore from version 2 adds BKT and Leitner defaults to existing skills', () => {
    const input = {
      skillStates: {
        'add-single': { eloRating: 1050, attempts: 10, correct: 8, lastPracticed: '2026-03-01' },
        'sub-single': { eloRating: 980, attempts: 5, correct: 3 },
      },
    };
    const result = migrateStore(input, 2);
    const skills = result.skillStates as Record<string, Record<string, unknown>>;

    // BKT defaults added (v3)
    expect(skills['add-single'].masteryProbability).toBe(0.1);
    expect(skills['add-single'].consecutiveWrong).toBe(0);
    expect(skills['add-single'].masteryLocked).toBe(false);

    expect(skills['sub-single'].masteryProbability).toBe(0.1);
    expect(skills['sub-single'].consecutiveWrong).toBe(0);
    expect(skills['sub-single'].masteryLocked).toBe(false);

    // Leitner defaults added (v4) -- P(L)=0.1 -> Box 1
    expect(skills['add-single'].leitnerBox).toBe(1);
    expect(skills['add-single'].nextReviewDue).toBeNull();
    expect(skills['add-single'].consecutiveCorrectInBox6).toBe(0);

    expect(skills['sub-single'].leitnerBox).toBe(1);
    expect(skills['sub-single'].nextReviewDue).toBeNull();
    expect(skills['sub-single'].consecutiveCorrectInBox6).toBe(0);

    // Existing values preserved
    expect(skills['add-single'].eloRating).toBe(1050);
    expect(skills['add-single'].attempts).toBe(10);
    expect(skills['add-single'].correct).toBe(8);
    expect(skills['add-single'].lastPracticed).toBe('2026-03-01');

    expect(skills['sub-single'].eloRating).toBe(980);
    expect(skills['sub-single'].attempts).toBe(5);
    expect(skills['sub-single'].correct).toBe(3);
  });

  it('migrateStore from version 2 handles empty skillStates', () => {
    const input = { skillStates: {} };
    const result = migrateStore(input, 2);
    expect(result.skillStates).toEqual({});
  });

  it('migrateStore from version 3 adds Leitner defaults with BKT-informed placement', () => {
    const input = {
      childName: 'Luna',
      skillStates: {
        'add-single': {
          eloRating: 1050, attempts: 10, correct: 8,
          masteryProbability: 0.85, consecutiveWrong: 0, masteryLocked: false,
        },
      },
    };
    const result = migrateStore(input, 3);
    const skills = result.skillStates as Record<string, Record<string, unknown>>;

    // P(L)=0.85 -> Box 5 (0.80 <= 0.85 < 0.95)
    expect(skills['add-single'].leitnerBox).toBe(5);
    expect(skills['add-single'].nextReviewDue).toBeNull();
    expect(skills['add-single'].consecutiveCorrectInBox6).toBe(0);

    // Existing values preserved
    expect(skills['add-single'].eloRating).toBe(1050);
    expect(skills['add-single'].masteryProbability).toBe(0.85);
    expect(result.childName).toBe('Luna');
  });

  it('v3->v4 migration with masteryProbability=0.96 gets leitnerBox=6', () => {
    const input = {
      skillStates: {
        'mastered-skill': {
          eloRating: 1200, attempts: 50, correct: 45,
          masteryProbability: 0.96, consecutiveWrong: 0, masteryLocked: true,
        },
      },
    };
    const result = migrateStore(input, 3);
    const skills = result.skillStates as Record<string, Record<string, unknown>>;
    expect(skills['mastered-skill'].leitnerBox).toBe(6);
  });

  it('v3->v4 migration with masteryProbability=0.1 gets leitnerBox=1', () => {
    const input = {
      skillStates: {
        'new-skill': {
          eloRating: 1000, attempts: 2, correct: 1,
          masteryProbability: 0.1, consecutiveWrong: 0, masteryLocked: false,
        },
      },
    };
    const result = migrateStore(input, 3);
    const skills = result.skillStates as Record<string, Record<string, unknown>>;
    expect(skills['new-skill'].leitnerBox).toBe(1);
  });

  it('v3->v4 migration handles empty skillStates cleanly', () => {
    const input = { skillStates: {} };
    const result = migrateStore(input, 3);
    expect(result.skillStates).toEqual({});
  });

  it('v3->v4 migration with missing masteryProbability defaults to 0.1 -> Box 1', () => {
    const input = {
      skillStates: {
        'incomplete-skill': {
          eloRating: 900, attempts: 3, correct: 1,
          consecutiveWrong: 0, masteryLocked: false,
        },
      },
    };
    const result = migrateStore(input, 3);
    const skills = result.skillStates as Record<string, Record<string, unknown>>;
    expect(skills['incomplete-skill'].leitnerBox).toBe(1);
    expect(skills['incomplete-skill'].nextReviewDue).toBeNull();
    expect(skills['incomplete-skill'].consecutiveCorrectInBox6).toBe(0);
  });

  it('v3->v4 migration places multiple skills with varied mastery levels', () => {
    const input = {
      skillStates: {
        'skill-low': { eloRating: 900, attempts: 5, correct: 2, masteryProbability: 0.15, consecutiveWrong: 0, masteryLocked: false },
        'skill-mid': { eloRating: 1050, attempts: 20, correct: 14, masteryProbability: 0.55, consecutiveWrong: 0, masteryLocked: false },
        'skill-high': { eloRating: 1200, attempts: 50, correct: 45, masteryProbability: 0.92, consecutiveWrong: 0, masteryLocked: true },
      },
    };
    const result = migrateStore(input, 3);
    const skills = result.skillStates as Record<string, Record<string, unknown>>;

    expect(skills['skill-low'].leitnerBox).toBe(1);   // 0.15 < 0.20
    expect(skills['skill-mid'].leitnerBox).toBe(3);   // 0.40 <= 0.55 < 0.60
    expect(skills['skill-high'].leitnerBox).toBe(5);   // 0.80 <= 0.92 < 0.95
  });

  it('migrateStore from version 4 adds cpaLevel with BKT-informed placement', () => {
    const input = {
      childName: 'Luna',
      skillStates: {
        'add-single': {
          eloRating: 1050, attempts: 10, correct: 8,
          masteryProbability: 0.85, consecutiveWrong: 0, masteryLocked: false,
          leitnerBox: 5, nextReviewDue: null, consecutiveCorrectInBox6: 0,
        },
      },
    };
    const result = migrateStore(input, 4);
    const skills = result.skillStates as Record<string, Record<string, unknown>>;
    // P(L)=0.85 >= 0.85 -> abstract
    expect(skills['add-single'].cpaLevel).toBe('abstract');
  });

  it('v4->v5 migration adds cpaLevel with BKT-informed placement', () => {
    const input = {
      skillStates: {
        'skill-low': {
          eloRating: 900, attempts: 5, correct: 2,
          masteryProbability: 0.15, consecutiveWrong: 0, masteryLocked: false,
          leitnerBox: 1, nextReviewDue: null, consecutiveCorrectInBox6: 0,
        },
        'skill-mid': {
          eloRating: 1050, attempts: 20, correct: 14,
          masteryProbability: 0.55, consecutiveWrong: 0, masteryLocked: false,
          leitnerBox: 3, nextReviewDue: null, consecutiveCorrectInBox6: 0,
        },
        'skill-high': {
          eloRating: 1200, attempts: 50, correct: 45,
          masteryProbability: 0.92, consecutiveWrong: 0, masteryLocked: true,
          leitnerBox: 5, nextReviewDue: null, consecutiveCorrectInBox6: 0,
        },
      },
    };
    const result = migrateStore(input, 4);
    const skills = result.skillStates as Record<string, Record<string, unknown>>;

    expect(skills['skill-low'].cpaLevel).toBe('concrete');     // 0.15 < 0.40
    expect(skills['skill-mid'].cpaLevel).toBe('pictorial');     // 0.40 <= 0.55 < 0.85
    expect(skills['skill-high'].cpaLevel).toBe('abstract');     // 0.92 >= 0.85
  });

  it('v4->v5 migration handles empty skillStates cleanly', () => {
    const input = { skillStates: {} };
    const result = migrateStore(input, 4);
    expect(result.skillStates).toEqual({});
  });

  it('v4->v5 migration with missing masteryProbability defaults to concrete', () => {
    const input = {
      skillStates: {
        'incomplete-skill': {
          eloRating: 900, attempts: 3, correct: 1,
          consecutiveWrong: 0, masteryLocked: false,
          leitnerBox: 1, nextReviewDue: null, consecutiveCorrectInBox6: 0,
        },
      },
    };
    const result = migrateStore(input, 4);
    const skills = result.skillStates as Record<string, Record<string, unknown>>;
    // Missing masteryProbability defaults to 0.1 -> concrete
    expect(skills['incomplete-skill'].cpaLevel).toBe('concrete');
  });

  it('migrateStore from version 5 adds tutorConsentGranted default false', () => {
    const input = { childName: 'Luna', xp: 200 };
    const result = migrateStore(input, 5);
    expect(result.tutorConsentGranted).toBe(false);
  });

  it('migrateStore from version 5 preserves existing tutorConsentGranted if present', () => {
    const input = { childName: 'Luna', xp: 200, tutorConsentGranted: true };
    const result = migrateStore(input, 5);
    expect(result.tutorConsentGranted).toBe(true);
  });

  it('migrateStore chains v1->v6 correctly', () => {
    const input = {
      childName: 'Max',
      skillStates: {
        'add-double': { eloRating: 1100, attempts: 20, correct: 15 },
      },
    };
    const result = migrateStore(input, 1);

    // v1->v2 defaults
    expect(result.childAge).toBeNull();
    expect(result.xp).toBe(0);

    // v2->v3 BKT defaults on existing skill
    const skills = result.skillStates as Record<string, Record<string, unknown>>;
    expect(skills['add-double'].masteryProbability).toBe(0.1);
    expect(skills['add-double'].consecutiveWrong).toBe(0);
    expect(skills['add-double'].masteryLocked).toBe(false);
    expect(skills['add-double'].eloRating).toBe(1100);

    // v3->v4 Leitner defaults (P(L)=0.1 -> Box 1)
    expect(skills['add-double'].leitnerBox).toBe(1);
    expect(skills['add-double'].nextReviewDue).toBeNull();
    expect(skills['add-double'].consecutiveCorrectInBox6).toBe(0);

    // v4->v5 CPA level (P(L)=0.1 -> concrete)
    expect(skills['add-double'].cpaLevel).toBe('concrete');

    // v5->v6 consent flag
    expect(result.tutorConsentGranted).toBe(false);
  });

  // v6->v7 migration tests (misconceptions)
  it('migrateStore from version 6 initializes misconceptions as empty object', () => {
    const input = { childName: 'Luna', xp: 300, tutorConsentGranted: true };
    const result = migrateStore(input, 6);
    expect(result.misconceptions).toEqual({});
  });

  it('migrateStore from version 6 preserves all existing v6 state', () => {
    const input = {
      childName: 'Luna',
      childAge: 7,
      childGrade: 2,
      avatarId: 'cat',
      tutorConsentGranted: true,
      xp: 500,
      level: 5,
      weeklyStreak: 3,
      lastSessionDate: '2026-03-01',
      exploredManipulatives: ['base-ten', 'number-line'],
      skillStates: {
        'add-single': {
          eloRating: 1100, attempts: 20, correct: 15,
          masteryProbability: 0.7, consecutiveWrong: 0, masteryLocked: false,
          leitnerBox: 3, nextReviewDue: null, consecutiveCorrectInBox6: 0,
          cpaLevel: 'pictorial',
        },
      },
    };
    const result = migrateStore(input, 6);

    // All v6 fields preserved
    expect(result.childName).toBe('Luna');
    expect(result.childAge).toBe(7);
    expect(result.childGrade).toBe(2);
    expect(result.avatarId).toBe('cat');
    expect(result.tutorConsentGranted).toBe(true);
    expect(result.xp).toBe(500);
    expect(result.level).toBe(5);
    expect(result.weeklyStreak).toBe(3);
    expect(result.lastSessionDate).toBe('2026-03-01');
    expect(result.exploredManipulatives).toEqual(['base-ten', 'number-line']);

    const skills = result.skillStates as Record<string, Record<string, unknown>>;
    expect(skills['add-single'].eloRating).toBe(1100);
    expect(skills['add-single'].cpaLevel).toBe('pictorial');

    // New v7 field
    expect(result.misconceptions).toEqual({});
  });

  it('migrateStore chains v1->v7 adds misconceptions field alongside all prior fields', () => {
    const input = {
      childName: 'Max',
      skillStates: {
        'add-double': { eloRating: 1100, attempts: 20, correct: 15 },
      },
    };
    const result = migrateStore(input, 1);

    // v1->v2 defaults
    expect(result.childAge).toBeNull();
    expect(result.xp).toBe(0);

    // v2->v3 BKT defaults
    const skills = result.skillStates as Record<string, Record<string, unknown>>;
    expect(skills['add-double'].masteryProbability).toBe(0.1);

    // v3->v4 Leitner defaults
    expect(skills['add-double'].leitnerBox).toBe(1);

    // v4->v5 CPA level
    expect(skills['add-double'].cpaLevel).toBe('concrete');

    // v5->v6 consent flag
    expect(result.tutorConsentGranted).toBe(false);

    // v6->v7 misconceptions
    expect(result.misconceptions).toEqual({});
  });

  // v8->v9 migration tests (achievement system)
  it('migrateStore from version 8 initializes earnedBadges as empty object and sessionsCompleted as 0', () => {
    const input = { childName: 'Luna', xp: 400, misconceptions: {} };
    const result = migrateStore(input, 8);
    expect(result.earnedBadges).toEqual({});
    expect(result.sessionsCompleted).toBe(0);
  });

  it('migrateStore from version 8 preserves existing earnedBadges if present', () => {
    const input = {
      childName: 'Luna',
      earnedBadges: {
        'mastery.add-single': { earnedAt: '2026-03-01T00:00:00.000Z' },
      },
      sessionsCompleted: 5,
    };
    const result = migrateStore(input, 8);
    expect(result.earnedBadges).toEqual({
      'mastery.add-single': { earnedAt: '2026-03-01T00:00:00.000Z' },
    });
    expect(result.sessionsCompleted).toBe(5);
  });

  it('migrateStore from version 8 preserves all existing v8 state', () => {
    const input = {
      childName: 'Luna',
      childAge: 7,
      childGrade: 2,
      avatarId: 'cat',
      tutorConsentGranted: true,
      xp: 500,
      level: 5,
      weeklyStreak: 3,
      lastSessionDate: '2026-03-01',
      exploredManipulatives: ['base-ten', 'number-line'],
      skillStates: {
        'add-single': {
          eloRating: 1100, attempts: 20, correct: 15,
          masteryProbability: 0.7, consecutiveWrong: 0, masteryLocked: false,
          leitnerBox: 3, nextReviewDue: null, consecutiveCorrectInBox6: 0,
          cpaLevel: 'pictorial',
        },
      },
      misconceptions: {
        'carry-error::add-double': {
          bugTag: 'carry-error', skillId: 'add-double',
          occurrenceCount: 2, status: 'suspected',
          firstSeen: '2026-03-01', lastSeen: '2026-03-02',
          remediationCorrectCount: 0,
        },
      },
    };
    const result = migrateStore(input, 8);

    // All v8 fields preserved
    expect(result.childName).toBe('Luna');
    expect(result.childAge).toBe(7);
    expect(result.childGrade).toBe(2);
    expect(result.avatarId).toBe('cat');
    expect(result.tutorConsentGranted).toBe(true);
    expect(result.xp).toBe(500);
    expect(result.level).toBe(5);
    expect(result.weeklyStreak).toBe(3);
    expect(result.lastSessionDate).toBe('2026-03-01');
    expect(result.exploredManipulatives).toEqual(['base-ten', 'number-line']);

    const skills = result.skillStates as Record<string, Record<string, unknown>>;
    expect(skills['add-single'].eloRating).toBe(1100);
    expect(skills['add-single'].cpaLevel).toBe('pictorial');

    const misconceptions = result.misconceptions as Record<string, Record<string, unknown>>;
    expect(misconceptions['carry-error::add-double'].bugTag).toBe('carry-error');
    expect(misconceptions['carry-error::add-double'].status).toBe('suspected');

    // New v9 fields
    expect(result.earnedBadges).toEqual({});
    expect(result.sessionsCompleted).toBe(0);
  });

  it('migrateStore chains v1->v9 correctly', () => {
    const input = {
      childName: 'Max',
      skillStates: {
        'add-double': { eloRating: 1100, attempts: 20, correct: 15 },
      },
    };
    const result = migrateStore(input, 1);

    // v1->v2 defaults
    expect(result.childAge).toBeNull();
    expect(result.xp).toBe(0);

    // v2->v3 BKT defaults
    const skills = result.skillStates as Record<string, Record<string, unknown>>;
    expect(skills['add-double'].masteryProbability).toBe(0.1);

    // v3->v4 Leitner defaults
    expect(skills['add-double'].leitnerBox).toBe(1);

    // v4->v5 CPA level
    expect(skills['add-double'].cpaLevel).toBe('concrete');

    // v5->v6 consent flag
    expect(result.tutorConsentGranted).toBe(false);

    // v6->v7 misconceptions
    expect(result.misconceptions).toEqual({});

    // v8->v9 achievement system
    expect(result.earnedBadges).toEqual({});
    expect(result.sessionsCompleted).toBe(0);
  });
});
