import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';

/** Status progression: new -> suspected -> confirmed -> resolved */
export type MisconceptionStatus = 'new' | 'suspected' | 'confirmed' | 'resolved';

/** Cross-session occurrence count to transition from new to suspected */
export const SUSPECTED_THRESHOLD = 2;
/** Cross-session occurrence count to transition from suspected to confirmed */
export const CONFIRMED_THRESHOLD = 3;
/** Remediation correct answers needed to resolve a confirmed misconception */
export const RESOLUTION_THRESHOLD = 3;

/** Aggregate record per bugTag+skillId composite key */
export interface MisconceptionRecord {
  readonly bugTag: string;
  readonly skillId: string;
  occurrenceCount: number;
  status: MisconceptionStatus;
  readonly firstSeen: string; // ISO string
  lastSeen: string; // ISO string
  suspectedAt?: string; // ISO string, set when status transitions to 'suspected'
  confirmedAt?: string; // ISO string, set when status transitions to 'confirmed'
  remediationCorrectCount: number; // correct answers in remediation sessions
  resolvedAt?: string; // ISO string, set when status transitions to 'resolved'
}

export interface MisconceptionSlice {
  /** Keyed by composite `${bugTag}::${skillId}` */
  misconceptions: Record<string, MisconceptionRecord>;
  /** Ephemeral session dedup — NOT persisted */
  sessionRecordedKeys: string[];
  recordMisconception: (bugTag: string, skillId: string) => void;
  recordRemediationCorrect: (skillId: string) => void;
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

      const base: MisconceptionRecord = existing
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
            remediationCorrectCount: 0,
          };

      // 2-then-3 confirmation rule: check confirmed FIRST so a record
      // jumping from new to count=3 goes straight to confirmed
      let record = base;
      if (
        record.occurrenceCount >= CONFIRMED_THRESHOLD &&
        record.status !== 'confirmed'
      ) {
        record = {
          ...record,
          status: 'confirmed',
          confirmedAt: record.confirmedAt ?? now,
        };
      } else if (
        record.occurrenceCount >= SUSPECTED_THRESHOLD &&
        record.status === 'new'
      ) {
        record = {
          ...record,
          status: 'suspected',
          suspectedAt: record.suspectedAt ?? now,
        };
      }

      return {
        misconceptions: {
          ...state.misconceptions,
          [key]: record,
        },
        sessionRecordedKeys: [...state.sessionRecordedKeys, key],
      };
    }),

  recordRemediationCorrect: (skillId) =>
    set((state) => {
      const updatedMisconceptions = { ...state.misconceptions };
      let changed = false;

      for (const key of Object.keys(updatedMisconceptions)) {
        const record = updatedMisconceptions[key];
        if (record.skillId !== skillId || record.status !== 'confirmed') continue;

        changed = true;
        const now = new Date().toISOString();
        const newCount = record.remediationCorrectCount + 1;

        if (newCount >= RESOLUTION_THRESHOLD) {
          updatedMisconceptions[key] = {
            ...record,
            remediationCorrectCount: newCount,
            status: 'resolved',
            resolvedAt: record.resolvedAt ?? now,
          };
        } else {
          updatedMisconceptions[key] = {
            ...record,
            remediationCorrectCount: newCount,
          };
        }
      }

      return changed ? { misconceptions: updatedMisconceptions } : state;
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

/** Selector: returns only confirmed misconception records */
export function getConfirmedMisconceptions(
  misconceptions: Record<string, MisconceptionRecord>,
): MisconceptionRecord[] {
  return Object.values(misconceptions).filter(
    (r) => r.status === 'confirmed',
  );
}

/** Selector: returns only suspected misconception records */
export function getSuspectedMisconceptions(
  misconceptions: Record<string, MisconceptionRecord>,
): MisconceptionRecord[] {
  return Object.values(misconceptions).filter(
    (r) => r.status === 'suspected',
  );
}

/** Selector: returns counts per status category */
export function getMisconceptionCounts(
  misconceptions: Record<string, MisconceptionRecord>,
): Record<MisconceptionStatus, number> {
  const counts = { new: 0, suspected: 0, confirmed: 0, resolved: 0 };
  for (const record of Object.values(misconceptions)) {
    counts[record.status]++;
  }
  return counts;
}
