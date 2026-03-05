import { create, type StateCreator } from 'zustand';
import {
  type ChallengeSlice,
  createChallengeSlice,
} from '@/store/slices/challengeSlice';
import { migrateStore } from '@/store/migrations';
import type { ChallengeCompletion } from '@/services/challenge';

function createTestStore() {
  return create<ChallengeSlice>()(
    createChallengeSlice as unknown as StateCreator<ChallengeSlice>,
  );
}

describe('challengeSlice', () => {
  it('starts with empty challengeCompletions and zero challengesCompleted', () => {
    const store = createTestStore();
    expect(store.getState().challengeCompletions).toEqual({});
    expect(store.getState().challengesCompleted).toBe(0);
  });

  it('completeChallenge stores a ChallengeCompletion keyed by date string', () => {
    const store = createTestStore();
    const completion: ChallengeCompletion = {
      themeId: 'addition-adventure',
      score: 8,
      total: 10,
      accuracyGoalMet: true,
      streakGoalMet: false,
      bonusXpAwarded: 50,
      completedAt: '2026-03-05T12:00:00Z',
    };

    store.getState().completeChallenge('2026-03-05', completion);
    expect(store.getState().challengeCompletions['2026-03-05']).toEqual(
      completion,
    );
  });

  it('completeChallenge increments challengesCompleted counter', () => {
    const store = createTestStore();
    const completion: ChallengeCompletion = {
      themeId: 'addition-adventure',
      score: 8,
      total: 10,
      accuracyGoalMet: true,
      streakGoalMet: false,
      bonusXpAwarded: 50,
      completedAt: '2026-03-05T12:00:00Z',
    };

    store.getState().completeChallenge('2026-03-05', completion);
    expect(store.getState().challengesCompleted).toBe(1);

    store.getState().completeChallenge('2026-03-06', {
      ...completion,
      completedAt: '2026-03-06T12:00:00Z',
    });
    expect(store.getState().challengesCompleted).toBe(2);
  });
});

describe('store migration v9->v10', () => {
  it('adds challengeCompletions and challengesCompleted', () => {
    const v9State = {
      childName: 'Test',
      earnedBadges: {},
      sessionsCompleted: 5,
    };
    const migrated = migrateStore(v9State, 9);
    expect(migrated.challengeCompletions).toEqual({});
    expect(migrated.challengesCompleted).toBe(0);
  });

  it('preserves existing data during migration', () => {
    const v9State = {
      childName: 'Test',
      earnedBadges: { 'mastery.grade.1': { earnedAt: '2026-01-01' } },
      sessionsCompleted: 10,
    };
    const migrated = migrateStore(v9State, 9);
    expect(migrated.childName).toBe('Test');
    expect(migrated.earnedBadges).toEqual({
      'mastery.grade.1': { earnedAt: '2026-01-01' },
    });
    expect(migrated.sessionsCompleted).toBe(10);
  });

  it('v7->v10 migration chain applies all intermediate steps', () => {
    const v7State = {
      childName: 'Chain',
      misconceptions: { 'bug-1': { status: 'active' } },
    };
    const migrated = migrateStore(v7State, 7);
    // v8: remediationCorrectCount added to misconceptions
    expect(
      (migrated.misconceptions as Record<string, Record<string, unknown>>)[
        'bug-1'
      ].remediationCorrectCount,
    ).toBe(0);
    // v9: earnedBadges + sessionsCompleted
    expect(migrated.earnedBadges).toEqual({});
    expect(migrated.sessionsCompleted).toBe(0);
    // v10: challenge fields
    expect(migrated.challengeCompletions).toEqual({});
    expect(migrated.challengesCompleted).toBe(0);
  });
});
