/**
 * Cloud sync service for Tiny Tallies.
 *
 * Handles push/pull sync with the backend API.
 * Queues pending syncs in AsyncStorage when offline.
 * Triggered after session complete, badge earned, or sign-in.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '@/store/appStore';
import {
  syncPush,
  syncPull,
  OfflineError,
  type SyncPushPayload,
  type SyncPullChild,
} from '../api/apiClient';

const PENDING_DELTAS_KEY = 'sync-pending-deltas';
const DEVICE_ID_KEY = 'sync-device-id';

let deviceId: string | null = null;

async function getDeviceId(): Promise<string> {
  if (deviceId) return deviceId;
  let stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!stored) {
    stored = `dev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, stored);
  }
  deviceId = stored;
  return stored;
}

export interface ScoreDelta {
  skillId: string;
  eloDelta: number;
  xpDelta: number;
  correct: number;
  timestamp: number;
}

export interface PendingSync {
  childId: string;
  deltas: ScoreDelta[];
  badges: Array<{ badgeId: string; earnedAt: number }>;
  timestamp: number;
}

/**
 * Queue score deltas for a child to be synced later.
 * Called after commitSessionResults.
 */
export async function queueDeltas(
  childId: string,
  deltas: ScoreDelta[],
  newBadges: Array<{ badgeId: string; earnedAt: number }>,
): Promise<void> {
  const pending = await getPendingDeltas();
  pending.push({
    childId,
    deltas,
    badges: newBadges,
    timestamp: Date.now(),
  });
  await AsyncStorage.setItem(PENDING_DELTAS_KEY, JSON.stringify(pending));
}

async function getPendingDeltas(): Promise<PendingSync[]> {
  const raw = await AsyncStorage.getItem(PENDING_DELTAS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PendingSync[];
  } catch {
    return [];
  }
}

async function clearPendingDeltas(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_DELTAS_KEY);
}

/**
 * Push all pending and current child data to the backend.
 * Returns true on success, false if offline or failed.
 */
export async function pushSync(): Promise<boolean> {
  const state = useAppStore.getState();
  if (!state.isSignedIn || !state.userId || !state.activeChildId) {
    return false;
  }

  const childId = state.activeChildId;
  const devId = await getDeviceId();

  // Collect pending deltas
  const pending = await getPendingDeltas();
  const childPending = pending.filter((p) => p.childId === childId);
  const allDeltas = childPending.flatMap((p) => p.deltas);
  const allBadges = childPending.flatMap((p) => p.badges);

  // Collect current skill states
  const skillStates = Object.entries(state.skillStates).map(
    ([skillId, s]) => ({
      skillId,
      elo: s.eloRating,
      attempts: s.attempts,
      correctCount: s.correct,
      mastery: s.masteryProbability,
      leitnerBox: s.leitnerBox,
      updatedAt: Math.floor(Date.now() / 1000),
    }),
  );

  // Add current badges (local earnedAt is ISO string, API wants unix seconds)
  const currentBadges = Object.entries(state.earnedBadges).map(
    ([badgeId, b]) => ({
      badgeId,
      earnedAt: Math.floor(new Date(b.earnedAt).getTime() / 1000),
    }),
  );

  // Merge queued badges with current (dedup by badgeId)
  const badgeMap = new Map<string, { badgeId: string; earnedAt: number }>();
  for (const b of [...allBadges, ...currentBadges]) {
    if (!badgeMap.has(b.badgeId)) {
      badgeMap.set(b.badgeId, b);
    }
  }

  const payload: SyncPushPayload = {
    childId,
    profile: {
      childName: state.childName ?? 'Child',
      childAge: state.childAge ?? 7,
      childGrade: state.childGrade ?? 2,
      avatarId: state.avatarId ?? null,
      frameId: state.frameId ?? null,
      themeId: state.themeId,
    },
    scoreDeltas: allDeltas,
    badges: Array.from(badgeMap.values()),
    skillStates,
    deviceId: devId,
  };

  try {
    await syncPush(state.userId, payload);
    // Only clear deltas for this child
    const remaining = pending.filter((p) => p.childId !== childId);
    if (remaining.length === 0) {
      await clearPendingDeltas();
    } else {
      await AsyncStorage.setItem(
        PENDING_DELTAS_KEY,
        JSON.stringify(remaining),
      );
    }
    return true;
  } catch (e) {
    if (e instanceof OfflineError) {
      return false;
    }
    // Log but don't crash — sync failures shouldn't block the user
    console.warn('Sync push failed:', e);
    return false;
  }
}

/**
 * Pull merged state from the backend and update local store.
 * Returns true on success, false if offline or failed.
 */
export async function pullSync(): Promise<boolean> {
  const state = useAppStore.getState();
  if (!state.isSignedIn || !state.userId || !state.activeChildId) {
    return false;
  }

  try {
    const response = await syncPull(state.userId);
    const serverChild = response.children.find(
      (c: SyncPullChild) => c.childId === state.activeChildId,
    );

    if (!serverChild) return true; // No server data yet

    // Merge: take higher values
    const mergedXp = Math.max(state.xp, serverChild.xp);
    if (mergedXp > state.xp) {
      useAppStore.setState({ xp: mergedXp });
    }

    const mergedLevel = Math.max(state.level, serverChild.level);
    if (mergedLevel > state.level) {
      useAppStore.setState({ level: mergedLevel });
    }

    // Merge badges: union (server has unix seconds, local uses ISO strings)
    const localBadges = { ...state.earnedBadges };
    for (const badge of serverChild.badges) {
      if (!localBadges[badge.badgeId]) {
        localBadges[badge.badgeId] = {
          earnedAt: new Date(badge.earnedAt * 1000).toISOString(),
        };
      }
    }
    useAppStore.setState({ earnedBadges: localBadges });

    // Merge skill states: take higher elo, more attempts, higher mastery
    const localSkills = { ...state.skillStates };
    for (const ss of serverChild.skillStates) {
      const local = localSkills[ss.skillId];
      if (!local) {
        // Server has skill we don't — add it
        localSkills[ss.skillId] = {
          eloRating: ss.elo,
          attempts: ss.attempts,
          correct: ss.correctCount,
          masteryProbability: ss.mastery,
          leitnerBox: Math.min(Math.max(ss.leitnerBox, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6,
          nextReviewDue: null,
          consecutiveWrong: 0,
          masteryLocked: false,
          consecutiveCorrectInBox6: 0,
          cpaLevel: 'concrete',
        };
      } else {
        // Merge: take higher/max values
        if (ss.elo > local.eloRating) {
          localSkills[ss.skillId] = {
            ...local,
            eloRating: ss.elo,
          };
        }
        if (ss.attempts > local.attempts) {
          localSkills[ss.skillId] = {
            ...localSkills[ss.skillId],
            attempts: ss.attempts,
            correct: ss.correctCount,
          };
        }
        if (ss.mastery > local.masteryProbability) {
          localSkills[ss.skillId] = {
            ...localSkills[ss.skillId],
            masteryProbability: ss.mastery,
          };
        }
      }
    }
    useAppStore.setState({ skillStates: localSkills });

    return true;
  } catch (e) {
    if (e instanceof OfflineError) {
      return false;
    }
    console.warn('Sync pull failed:', e);
    return false;
  }
}

/**
 * Full sync: push first (to send local changes), then pull (to get remote changes).
 */
export async function fullSync(): Promise<boolean> {
  const pushOk = await pushSync();
  if (!pushOk) return false;
  return pullSync();
}

/**
 * Flush any pending deltas that were queued while offline.
 * Called when connectivity returns.
 */
export async function flushPendingSync(): Promise<boolean> {
  const pending = await getPendingDeltas();
  if (pending.length === 0) return true;
  return pushSync();
}

/**
 * Check if there are pending deltas to sync.
 */
export async function hasPendingSync(): Promise<boolean> {
  const pending = await getPendingDeltas();
  return pending.length > 0;
}
