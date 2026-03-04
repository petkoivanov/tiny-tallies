import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';

/** Status progression: new -> suspected -> confirmed (Phase 27+ upgrades status) */
export type MisconceptionStatus = 'new' | 'suspected' | 'confirmed';

/** Aggregate record per bugTag+skillId composite key */
export interface MisconceptionRecord {
  readonly bugTag: string;
  readonly skillId: string;
  occurrenceCount: number;
  status: MisconceptionStatus;
  readonly firstSeen: string; // ISO string
  lastSeen: string; // ISO string
}

export interface MisconceptionSlice {
  /** Keyed by composite `${bugTag}::${skillId}` */
  misconceptions: Record<string, MisconceptionRecord>;
  /** Ephemeral session dedup — NOT persisted */
  sessionRecordedKeys: string[];
  recordMisconception: (bugTag: string, skillId: string) => void;
  resetSessionDedup: () => void;
}

/** Composite key format for misconception records */
function compositeKey(bugTag: string, skillId: string): string {
  return `${bugTag}::${skillId}`;
}

export const createMisconceptionSlice: StateCreator<
  AppState,
  [],
  [],
  MisconceptionSlice
> = (set) => ({
  misconceptions: {},
  sessionRecordedKeys: [],

  recordMisconception: (bugTag, skillId) =>
    set((state) => {
      const key = compositeKey(bugTag, skillId);

      // Session deduplication: same bugTag+skillId counted at most once per session
      if (state.sessionRecordedKeys.includes(key)) {
        return state;
      }

      const now = new Date().toISOString();
      const existing = state.misconceptions[key];

      const record: MisconceptionRecord = existing
        ? {
            ...existing,
            occurrenceCount: existing.occurrenceCount + 1,
            lastSeen: now,
          }
        : {
            bugTag,
            skillId,
            occurrenceCount: 1,
            status: 'new',
            firstSeen: now,
            lastSeen: now,
          };

      return {
        misconceptions: {
          ...state.misconceptions,
          [key]: record,
        },
        sessionRecordedKeys: [...state.sessionRecordedKeys, key],
      };
    }),

  resetSessionDedup: () => set({ sessionRecordedKeys: [] }),
});

/** Selector: returns all records for a given skillId */
export function getMisconceptionsBySkill(
  misconceptions: Record<string, MisconceptionRecord>,
  skillId: string,
): MisconceptionRecord[] {
  return Object.values(misconceptions).filter((r) => r.skillId === skillId);
}

/** Selector: returns all records for a given bugTag */
export function getMisconceptionsByBugTag(
  misconceptions: Record<string, MisconceptionRecord>,
  bugTag: string,
): MisconceptionRecord[] {
  return Object.values(misconceptions).filter((r) => r.bugTag === bugTag);
}
