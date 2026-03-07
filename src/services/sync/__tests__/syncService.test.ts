import AsyncStorage from '@react-native-async-storage/async-storage';

const mockSyncPush = jest.fn();
const mockSyncPull = jest.fn();

jest.mock('@/services/api/apiClient', () => ({
  syncPush: (...args: unknown[]) => mockSyncPush(...args),
  syncPull: (...args: unknown[]) => mockSyncPull(...args),
  OfflineError: class OfflineError extends Error {
    name = 'OfflineError';
  },
}));

// Mock store with auth state
const mockGetState = jest.fn();
const mockSetState = jest.fn();

jest.mock('@/store/appStore', () => ({
  useAppStore: {
    getState: () => mockGetState(),
    setState: (...args: unknown[]) => mockSetState(...args),
  },
}));

import {
  queueDeltas,
  pushSync,
  pullSync,
  hasPendingSync,
  flushPendingSync,
} from '../syncService';

function createMockState(overrides: Record<string, unknown> = {}) {
  return {
    isSignedIn: true,
    userId: 'u-1',
    activeChildId: 'c-1',
    childName: 'Alex',
    childAge: 7,
    childGrade: 2,
    avatarId: 'cat',
    frameId: null,
    themeId: 'dark',
    xp: 100,
    level: 3,
    skillStates: {
      'add-single': {
        eloRating: 1050,
        attempts: 10,
        correct: 8,
        masteryProbability: 0.5,
        leitnerBox: 3,
        consecutiveWrong: 0,
        masteryLocked: false,
        nextReviewDue: null,
        consecutiveCorrectInBox6: 0,
        cpaLevel: 'pictorial',
      },
    },
    earnedBadges: {
      'first-session': { earnedAt: '2026-01-01T00:00:00.000Z' },
    },
    ...overrides,
  };
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  mockGetState.mockReturnValue(createMockState());
  mockSyncPush.mockResolvedValue({ success: true });
});

describe('syncService', () => {
  describe('queueDeltas', () => {
    it('stores deltas in AsyncStorage', async () => {
      await queueDeltas(
        'c-1',
        [{ skillId: 'add-single', eloDelta: 15, xpDelta: 10, correct: 1, timestamp: 1000 }],
        [{ badgeId: 'streak-3', earnedAt: 1000 }],
      );

      expect(await hasPendingSync()).toBe(true);
    });

    it('appends to existing pending deltas', async () => {
      await queueDeltas('c-1', [{ skillId: 's1', eloDelta: 5, xpDelta: 5, correct: 1, timestamp: 1 }], []);
      await queueDeltas('c-1', [{ skillId: 's2', eloDelta: -3, xpDelta: 5, correct: 0, timestamp: 2 }], []);

      const raw = await AsyncStorage.getItem('sync-pending-deltas');
      const pending = JSON.parse(raw!);
      expect(pending).toHaveLength(2);
    });
  });

  describe('pushSync', () => {
    it('returns false when not signed in', async () => {
      mockGetState.mockReturnValue(createMockState({ isSignedIn: false }));
      expect(await pushSync()).toBe(false);
    });

    it('pushes current state to backend', async () => {
      await pushSync();

      expect(mockSyncPush).toHaveBeenCalledTimes(1);
      const [userId, payload] = mockSyncPush.mock.calls[0];
      expect(userId).toBe('u-1');
      expect(payload.childId).toBe('c-1');
      expect(payload.profile.childName).toBe('Alex');
      expect(payload.skillStates).toHaveLength(1);
      expect(payload.badges).toHaveLength(1);
    });

    it('includes queued deltas in push', async () => {
      await queueDeltas('c-1', [
        { skillId: 'add-single', eloDelta: 10, xpDelta: 5, correct: 1, timestamp: 100 },
      ], []);

      await pushSync();

      const [, payload] = mockSyncPush.mock.calls[0];
      expect(payload.scoreDeltas).toHaveLength(1);
      expect(payload.scoreDeltas[0].eloDelta).toBe(10);
    });

    it('clears pending deltas on success', async () => {
      await queueDeltas('c-1', [
        { skillId: 's1', eloDelta: 5, xpDelta: 5, correct: 1, timestamp: 1 },
      ], []);

      await pushSync();

      expect(await hasPendingSync()).toBe(false);
    });

    it('keeps pending deltas for other children', async () => {
      await queueDeltas('c-other', [
        { skillId: 's1', eloDelta: 5, xpDelta: 5, correct: 1, timestamp: 1 },
      ], []);

      await pushSync();

      expect(await hasPendingSync()).toBe(true);
    });
  });

  describe('pullSync', () => {
    it('returns false when not signed in', async () => {
      mockGetState.mockReturnValue(createMockState({ isSignedIn: false }));
      expect(await pullSync()).toBe(false);
    });

    it('returns true when no server data', async () => {
      mockSyncPull.mockResolvedValue({ children: [] });
      expect(await pullSync()).toBe(true);
    });

    it('merges higher XP from server', async () => {
      mockGetState.mockReturnValue(createMockState({ xp: 50 }));
      mockSyncPull.mockResolvedValue({
        children: [{
          childId: 'c-1',
          xp: 200,
          level: 5,
          badges: [],
          skillStates: [],
        }],
      });

      await pullSync();

      expect(mockSetState).toHaveBeenCalledWith({ xp: 200 });
    });

    it('does not downgrade XP from server', async () => {
      mockGetState.mockReturnValue(createMockState({ xp: 500 }));
      mockSyncPull.mockResolvedValue({
        children: [{
          childId: 'c-1',
          xp: 100,
          level: 2,
          badges: [],
          skillStates: [],
        }],
      });

      await pullSync();

      // setState should NOT be called with lower XP
      const xpCalls = mockSetState.mock.calls.filter(
        (c: unknown[]) => (c[0] as Record<string, unknown>).xp !== undefined,
      );
      expect(xpCalls).toHaveLength(0);
    });

    it('merges new badges from server', async () => {
      mockSyncPull.mockResolvedValue({
        children: [{
          childId: 'c-1',
          xp: 50,
          level: 1,
          badges: [
            { badgeId: 'new-badge', earnedAt: 1000 },
            { badgeId: 'first-session', earnedAt: 500 },
          ],
          skillStates: [],
        }],
      });

      await pullSync();

      const badgeCall = mockSetState.mock.calls.find(
        (c: unknown[]) => (c[0] as Record<string, unknown>).earnedBadges !== undefined,
      );
      expect(badgeCall).toBeDefined();
      const badges = (badgeCall![0] as Record<string, unknown>).earnedBadges as Record<string, unknown>;
      expect(badges['new-badge']).toBeDefined();
      // Original badge should not be overwritten
      expect(badges['first-session']).toEqual({ earnedAt: '2026-01-01T00:00:00.000Z' });
    });
  });

  describe('flushPendingSync', () => {
    it('returns true when no pending deltas', async () => {
      expect(await flushPendingSync()).toBe(true);
    });

    it('pushes when there are pending deltas', async () => {
      await queueDeltas('c-1', [
        { skillId: 's1', eloDelta: 5, xpDelta: 5, correct: 1, timestamp: 1 },
      ], []);

      await flushPendingSync();

      expect(mockSyncPush).toHaveBeenCalledTimes(1);
    });
  });
});
