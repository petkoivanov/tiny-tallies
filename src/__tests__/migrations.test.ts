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

  it('migrateStore from version 2 adds BKT defaults to existing skills', () => {
    const input = {
      skillStates: {
        'add-single': { eloRating: 1050, attempts: 10, correct: 8, lastPracticed: '2026-03-01' },
        'sub-single': { eloRating: 980, attempts: 5, correct: 3 },
      },
    };
    const result = migrateStore(input, 2);
    const skills = result.skillStates as Record<string, Record<string, unknown>>;

    // BKT defaults added
    expect(skills['add-single'].masteryProbability).toBe(0.1);
    expect(skills['add-single'].consecutiveWrong).toBe(0);
    expect(skills['add-single'].masteryLocked).toBe(false);

    expect(skills['sub-single'].masteryProbability).toBe(0.1);
    expect(skills['sub-single'].consecutiveWrong).toBe(0);
    expect(skills['sub-single'].masteryLocked).toBe(false);

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

  it('migrateStore from version 3 returns state unchanged', () => {
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
    expect(result).toEqual(input);
  });

  it('migrateStore chains v1->v3 correctly', () => {
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
  });
});
