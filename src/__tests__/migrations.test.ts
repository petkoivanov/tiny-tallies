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

  it('migrateStore from version 2 returns state unchanged', () => {
    const input = { childName: 'Luna', xp: 100, skillStates: {} };
    const result = migrateStore(input, 2);
    expect(result).toEqual(input);
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
});
