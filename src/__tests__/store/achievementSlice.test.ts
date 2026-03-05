import { create, type StateCreator } from 'zustand';

// Import slices under test
import {
  type AchievementSlice,
  createAchievementSlice,
} from '@/store/slices/achievementSlice';
import {
  type GamificationSlice,
  createGamificationSlice,
} from '@/store/slices/gamificationSlice';

// Minimal test store for achievement slice (standalone).
// The cast is necessary because createAchievementSlice is typed for the full
// AppState context, but the slice is self-contained and works standalone.
function createAchievementTestStore() {
  return create<AchievementSlice>()(
    createAchievementSlice as unknown as StateCreator<AchievementSlice>,
  );
}

// Minimal test store for gamification slice (standalone).
function createGamificationTestStore() {
  return create<GamificationSlice>()(
    createGamificationSlice as unknown as StateCreator<GamificationSlice>,
  );
}

describe('achievementSlice', () => {
  it('initializes with empty earnedBadges record', () => {
    const store = createAchievementTestStore();
    expect(store.getState().earnedBadges).toEqual({});
  });

  it('addEarnedBadges with one badge ID adds it with an earnedAt timestamp', () => {
    const store = createAchievementTestStore();
    const before = new Date().toISOString();
    store.getState().addEarnedBadges(['mastery.add-single']);
    const after = new Date().toISOString();

    const badges = store.getState().earnedBadges;
    expect(badges['mastery.add-single']).toBeDefined();
    expect(badges['mastery.add-single'].earnedAt).toBeDefined();
    // Timestamp should be between before and after
    expect(badges['mastery.add-single'].earnedAt >= before).toBe(true);
    expect(badges['mastery.add-single'].earnedAt <= after).toBe(true);
  });

  it('addEarnedBadges with multiple badge IDs adds all with timestamps', () => {
    const store = createAchievementTestStore();
    store
      .getState()
      .addEarnedBadges([
        'mastery.add-single',
        'behavior.streak.bronze',
        'mastery.grade.1',
      ]);

    const badges = store.getState().earnedBadges;
    expect(Object.keys(badges)).toHaveLength(3);
    expect(badges['mastery.add-single']).toBeDefined();
    expect(badges['behavior.streak.bronze']).toBeDefined();
    expect(badges['mastery.grade.1']).toBeDefined();

    // All should have earnedAt timestamps
    for (const badge of Object.values(badges)) {
      expect(badge.earnedAt).toBeDefined();
      expect(typeof badge.earnedAt).toBe('string');
    }
  });

  it('addEarnedBadges does not overwrite existing earned badges (idempotent)', () => {
    const store = createAchievementTestStore();

    // Earn first badge
    store.getState().addEarnedBadges(['mastery.add-single']);
    const firstEarnedAt =
      store.getState().earnedBadges['mastery.add-single'].earnedAt;

    // Try to earn the same badge again (along with a new one)
    store
      .getState()
      .addEarnedBadges(['mastery.add-single', 'behavior.streak.bronze']);

    const badges = store.getState().earnedBadges;
    // Original timestamp preserved
    expect(badges['mastery.add-single'].earnedAt).toBe(firstEarnedAt);
    // New badge added
    expect(badges['behavior.streak.bronze']).toBeDefined();
  });

  it('addEarnedBadges with empty array is a no-op', () => {
    const store = createAchievementTestStore();

    // Earn a badge first
    store.getState().addEarnedBadges(['mastery.add-single']);
    const badgesBefore = store.getState().earnedBadges;

    // Call with empty array
    store.getState().addEarnedBadges([]);
    const badgesAfter = store.getState().earnedBadges;

    expect(badgesAfter).toEqual(badgesBefore);
  });
});

describe('gamificationSlice - sessionsCompleted', () => {
  it('initializes sessionsCompleted as 0', () => {
    const store = createGamificationTestStore();
    expect(store.getState().sessionsCompleted).toBe(0);
  });

  it('incrementSessionsCompleted increments by 1', () => {
    const store = createGamificationTestStore();
    store.getState().incrementSessionsCompleted();
    expect(store.getState().sessionsCompleted).toBe(1);
  });

  it('incrementSessionsCompleted called multiple times increments correctly', () => {
    const store = createGamificationTestStore();
    store.getState().incrementSessionsCompleted();
    store.getState().incrementSessionsCompleted();
    store.getState().incrementSessionsCompleted();
    expect(store.getState().sessionsCompleted).toBe(3);
  });
});
