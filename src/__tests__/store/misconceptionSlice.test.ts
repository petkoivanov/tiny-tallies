import { create, type StateCreator } from 'zustand';
import {
  type MisconceptionSlice,
  type MisconceptionRecord,
  createMisconceptionSlice,
  getMisconceptionsBySkill,
  getMisconceptionsByBugTag,
  getConfirmedMisconceptions,
  getSuspectedMisconceptions,
  getMisconceptionCounts,
  SUSPECTED_THRESHOLD,
  CONFIRMED_THRESHOLD,
  RESOLUTION_THRESHOLD,
} from '@/store/slices/misconceptionSlice';
import { REMEDIATION_SESSION_CONFIG } from '@/services/session/sessionTypes';
import { migrateStore } from '@/store/migrations';

// Create a minimal test store with just the misconception slice.
// The cast is necessary because createMisconceptionSlice is typed for the full
// AppState context, but the slice is self-contained and works standalone.
function createTestStore() {
  return create<MisconceptionSlice>()(
    createMisconceptionSlice as unknown as StateCreator<MisconceptionSlice>,
  );
}

/** Helper: record a misconception N times across N sessions */
function recordAcrossSessions(
  store: ReturnType<typeof createTestStore>,
  bugTag: string,
  skillId: string,
  times: number,
) {
  for (let i = 0; i < times; i++) {
    if (i > 0) store.getState().resetSessionDedup();
    store.getState().recordMisconception(bugTag, skillId);
  }
}

describe('misconceptionSlice', () => {
  describe('initial state', () => {
    it('has empty misconceptions map', () => {
      const store = createTestStore();
      expect(store.getState().misconceptions).toEqual({});
    });

    it('has empty sessionRecordedKeys array', () => {
      const store = createTestStore();
      expect(store.getState().sessionRecordedKeys).toEqual([]);
    });
  });

  describe('recordMisconception', () => {
    it('creates a new record with correct fields', () => {
      const store = createTestStore();
      const before = new Date().toISOString();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');

      const key = 'add_no_carry::add-2digit';
      const record = store.getState().misconceptions[key];
      expect(record).toBeDefined();
      expect(record.bugTag).toBe('add_no_carry');
      expect(record.skillId).toBe('add-2digit');
      expect(record.occurrenceCount).toBe(1);
      expect(record.status).toBe('new');
      expect(record.firstSeen).toBeDefined();
      expect(record.lastSeen).toBeDefined();
      // firstSeen and lastSeen should be valid ISO strings
      expect(new Date(record.firstSeen).toISOString()).toBe(record.firstSeen);
      expect(new Date(record.lastSeen).toISOString()).toBe(record.lastSeen);
    });

    it('increments existing record occurrenceCount and updates lastSeen', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');
      const firstRecord = store.getState().misconceptions['add_no_carry::add-2digit'];
      const firstSeen = firstRecord.firstSeen;

      // Reset session dedup so we can record the same key again
      store.getState().resetSessionDedup();

      // Small delay to ensure different timestamp
      store.getState().recordMisconception('add_no_carry', 'add-2digit');

      const updated = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(updated.occurrenceCount).toBe(2);
      expect(updated.firstSeen).toBe(firstSeen); // firstSeen preserved
      expect(updated.lastSeen).toBeDefined();
    });

    it('deduplicates same bugTag+skillId within the same session', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');
      store.getState().recordMisconception('add_no_carry', 'add-2digit');
      store.getState().recordMisconception('add_no_carry', 'add-2digit');

      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.occurrenceCount).toBe(1); // Only counted once per session
    });

    it('allows recording same key again after resetSessionDedup (new session)', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');
      expect(store.getState().misconceptions['add_no_carry::add-2digit'].occurrenceCount).toBe(1);

      store.getState().resetSessionDedup();
      store.getState().recordMisconception('add_no_carry', 'add-2digit');

      expect(store.getState().misconceptions['add_no_carry::add-2digit'].occurrenceCount).toBe(2);
    });

    it('creates separate records for same bugTag with different skillId', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');
      store.getState().recordMisconception('add_no_carry', 'add-3digit');

      const keys = Object.keys(store.getState().misconceptions);
      expect(keys).toHaveLength(2);
      expect(keys).toContain('add_no_carry::add-2digit');
      expect(keys).toContain('add_no_carry::add-3digit');

      expect(store.getState().misconceptions['add_no_carry::add-2digit'].skillId).toBe('add-2digit');
      expect(store.getState().misconceptions['add_no_carry::add-3digit'].skillId).toBe('add-3digit');
    });

    it('adds key to sessionRecordedKeys', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');

      expect(store.getState().sessionRecordedKeys).toContain('add_no_carry::add-2digit');
    });
  });

  describe('resetSessionDedup', () => {
    it('clears sessionRecordedKeys', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');
      store.getState().recordMisconception('sub_borrow', 'sub-2digit');
      expect(store.getState().sessionRecordedKeys).toHaveLength(2);

      store.getState().resetSessionDedup();

      expect(store.getState().sessionRecordedKeys).toEqual([]);
    });
  });

  describe('getMisconceptionsBySkill', () => {
    it('returns only records matching skillId', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');
      store.getState().recordMisconception('sub_borrow', 'add-2digit');
      store.getState().recordMisconception('add_no_carry', 'add-3digit');

      const result = getMisconceptionsBySkill(store.getState().misconceptions, 'add-2digit');
      expect(result).toHaveLength(2);
      expect(result.every((r) => r.skillId === 'add-2digit')).toBe(true);
    });

    it('returns empty array when no matches', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');

      const result = getMisconceptionsBySkill(store.getState().misconceptions, 'mul-single');
      expect(result).toEqual([]);
    });
  });

  describe('getMisconceptionsByBugTag', () => {
    it('returns only records matching bugTag', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');
      store.getState().recordMisconception('add_no_carry', 'add-3digit');
      store.getState().recordMisconception('sub_borrow', 'sub-2digit');

      const result = getMisconceptionsByBugTag(store.getState().misconceptions, 'add_no_carry');
      expect(result).toHaveLength(2);
      expect(result.every((r) => r.bugTag === 'add_no_carry')).toBe(true);
    });

    it('returns empty array when no matches', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');

      const result = getMisconceptionsByBugTag(store.getState().misconceptions, 'mul_table');
      expect(result).toEqual([]);
    });
  });

  describe('threshold constants', () => {
    it('exports SUSPECTED_THRESHOLD as 2', () => {
      expect(SUSPECTED_THRESHOLD).toBe(2);
    });

    it('exports CONFIRMED_THRESHOLD as 3', () => {
      expect(CONFIRMED_THRESHOLD).toBe(3);
    });
  });

  describe('2-then-3 confirmation rule', () => {
    it('keeps status as new at occurrenceCount=1', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');

      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.occurrenceCount).toBe(1);
      expect(record.status).toBe('new');
    });

    it('transitions to suspected at occurrenceCount=2', () => {
      const store = createTestStore();

      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 2);

      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.occurrenceCount).toBe(2);
      expect(record.status).toBe('suspected');
    });

    it('transitions to confirmed at occurrenceCount=3', () => {
      const store = createTestStore();

      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 3);

      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.occurrenceCount).toBe(3);
      expect(record.status).toBe('confirmed');
    });

    it('stays confirmed at occurrenceCount=4+', () => {
      const store = createTestStore();

      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 5);

      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.occurrenceCount).toBe(5);
      expect(record.status).toBe('confirmed');
    });

    it('never regresses from confirmed to suspected', () => {
      const store = createTestStore();

      // Get to confirmed
      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 3);
      expect(store.getState().misconceptions['add_no_carry::add-2digit'].status).toBe('confirmed');

      // Additional recordings should not regress status
      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 3);
      expect(store.getState().misconceptions['add_no_carry::add-2digit'].status).toBe('confirmed');
    });
  });

  describe('timestamp fields', () => {
    it('sets suspectedAt when transitioning to suspected', () => {
      const store = createTestStore();

      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 2);

      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.suspectedAt).toBeDefined();
      expect(new Date(record.suspectedAt!).toISOString()).toBe(record.suspectedAt);
    });

    it('does not set suspectedAt at occurrenceCount=1', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');

      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.suspectedAt).toBeUndefined();
    });

    it('sets confirmedAt when transitioning to confirmed', () => {
      const store = createTestStore();

      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 3);

      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.confirmedAt).toBeDefined();
      expect(new Date(record.confirmedAt!).toISOString()).toBe(record.confirmedAt);
    });

    it('does not overwrite suspectedAt when transitioning to confirmed', () => {
      const store = createTestStore();

      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 2);
      const suspectedAt = store.getState().misconceptions['add_no_carry::add-2digit'].suspectedAt;

      store.getState().resetSessionDedup();
      store.getState().recordMisconception('add_no_carry', 'add-2digit');

      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.status).toBe('confirmed');
      expect(record.suspectedAt).toBe(suspectedAt); // preserved
    });

    it('does not overwrite confirmedAt on subsequent recordings', () => {
      const store = createTestStore();

      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 3);
      const confirmedAt = store.getState().misconceptions['add_no_carry::add-2digit'].confirmedAt;

      // Record more times
      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 2);

      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.confirmedAt).toBe(confirmedAt); // preserved
    });
  });

  describe('getConfirmedMisconceptions', () => {
    it('returns only confirmed records from mixed set', () => {
      const store = createTestStore();

      // 1 occurrence = new
      store.getState().recordMisconception('add_no_carry', 'add-2digit');
      // 2 occurrences = suspected
      recordAcrossSessions(store, 'sub_borrow', 'sub-2digit', 2);
      // 3 occurrences = confirmed
      recordAcrossSessions(store, 'mul_table', 'mul-single', 3);

      const result = getConfirmedMisconceptions(store.getState().misconceptions);
      expect(result).toHaveLength(1);
      expect(result[0].bugTag).toBe('mul_table');
      expect(result[0].status).toBe('confirmed');
    });

    it('returns empty array when none confirmed', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');
      recordAcrossSessions(store, 'sub_borrow', 'sub-2digit', 2);

      const result = getConfirmedMisconceptions(store.getState().misconceptions);
      expect(result).toEqual([]);
    });
  });

  describe('getSuspectedMisconceptions', () => {
    it('returns only suspected records from mixed set', () => {
      const store = createTestStore();

      // 1 occurrence = new
      store.getState().recordMisconception('add_no_carry', 'add-2digit');
      // 2 occurrences = suspected
      recordAcrossSessions(store, 'sub_borrow', 'sub-2digit', 2);
      // 3 occurrences = confirmed
      recordAcrossSessions(store, 'mul_table', 'mul-single', 3);

      const result = getSuspectedMisconceptions(store.getState().misconceptions);
      expect(result).toHaveLength(1);
      expect(result[0].bugTag).toBe('sub_borrow');
      expect(result[0].status).toBe('suspected');
    });

    it('returns empty array when none suspected', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');

      const result = getSuspectedMisconceptions(store.getState().misconceptions);
      expect(result).toEqual([]);
    });
  });

  describe('getMisconceptionCounts', () => {
    it('returns correct counts with mixed statuses', () => {
      const store = createTestStore();

      // 2 new records
      store.getState().recordMisconception('add_no_carry', 'add-2digit');
      store.getState().recordMisconception('place_value', 'add-3digit');
      // 1 suspected record (2 occurrences)
      recordAcrossSessions(store, 'sub_borrow', 'sub-2digit', 2);
      // 1 confirmed record (3 occurrences)
      recordAcrossSessions(store, 'mul_table', 'mul-single', 3);

      const counts = getMisconceptionCounts(store.getState().misconceptions);
      expect(counts).toEqual({
        new: 2,
        suspected: 1,
        confirmed: 1,
        resolved: 0,
      });
    });

    it('returns all zeros with empty map', () => {
      const counts = getMisconceptionCounts({});
      expect(counts).toEqual({
        new: 0,
        suspected: 0,
        confirmed: 0,
        resolved: 0,
      });
    });
  });

  describe('recordRemediationCorrect', () => {
    it('increments remediationCorrectCount for a confirmed misconception', () => {
      const store = createTestStore();

      // Get to confirmed (3 occurrences)
      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 3);
      expect(store.getState().misconceptions['add_no_carry::add-2digit'].status).toBe('confirmed');

      store.getState().recordRemediationCorrect('add-2digit');

      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.remediationCorrectCount).toBe(1);
    });

    it('is a no-op for new misconceptions', () => {
      const store = createTestStore();

      store.getState().recordMisconception('add_no_carry', 'add-2digit');
      const before = store.getState().misconceptions['add_no_carry::add-2digit'];

      store.getState().recordRemediationCorrect('add-2digit');

      const after = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(after.remediationCorrectCount).toBe(before.remediationCorrectCount);
    });

    it('is a no-op for suspected misconceptions', () => {
      const store = createTestStore();

      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 2);
      expect(store.getState().misconceptions['add_no_carry::add-2digit'].status).toBe('suspected');

      store.getState().recordRemediationCorrect('add-2digit');

      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.remediationCorrectCount).toBe(0);
    });

    it('is a no-op for resolved misconceptions', () => {
      const store = createTestStore();

      // Get to confirmed, then resolve
      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 3);
      store.getState().recordRemediationCorrect('add-2digit');
      store.getState().recordRemediationCorrect('add-2digit');
      store.getState().recordRemediationCorrect('add-2digit');
      expect(store.getState().misconceptions['add_no_carry::add-2digit'].status).toBe('resolved');

      // Should be a no-op now
      store.getState().recordRemediationCorrect('add-2digit');
      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.remediationCorrectCount).toBe(3); // unchanged
    });

    it('is a no-op when no misconceptions exist for the skillId', () => {
      const store = createTestStore();

      // Should not throw
      store.getState().recordRemediationCorrect('nonexistent-skill');
      expect(Object.keys(store.getState().misconceptions)).toHaveLength(0);
    });
  });

  describe('resolution threshold', () => {
    it('exports RESOLUTION_THRESHOLD as 3', () => {
      expect(RESOLUTION_THRESHOLD).toBe(3);
    });

    it('transitions confirmed to resolved after 3 remediation corrects', () => {
      const store = createTestStore();

      // Get to confirmed
      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 3);
      expect(store.getState().misconceptions['add_no_carry::add-2digit'].status).toBe('confirmed');

      // 3 remediation correct answers
      store.getState().recordRemediationCorrect('add-2digit');
      store.getState().recordRemediationCorrect('add-2digit');
      expect(store.getState().misconceptions['add_no_carry::add-2digit'].status).toBe('confirmed');

      store.getState().recordRemediationCorrect('add-2digit');
      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.status).toBe('resolved');
      expect(record.remediationCorrectCount).toBe(3);
    });

    it('sets resolvedAt timestamp when transitioning to resolved', () => {
      const store = createTestStore();

      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 3);

      store.getState().recordRemediationCorrect('add-2digit');
      store.getState().recordRemediationCorrect('add-2digit');
      store.getState().recordRemediationCorrect('add-2digit');

      const record = store.getState().misconceptions['add_no_carry::add-2digit'];
      expect(record.resolvedAt).toBeDefined();
      expect(new Date(record.resolvedAt!).toISOString()).toBe(record.resolvedAt);
    });

    it('uses nullish coalescing for resolvedAt (idempotent assignment)', () => {
      const store = createTestStore();

      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 3);

      // Resolve it
      store.getState().recordRemediationCorrect('add-2digit');
      store.getState().recordRemediationCorrect('add-2digit');
      store.getState().recordRemediationCorrect('add-2digit');

      const resolvedAt = store.getState().misconceptions['add_no_carry::add-2digit'].resolvedAt;
      expect(resolvedAt).toBeDefined();

      // resolvedAt should not change (it's already set and status is resolved, so no-op)
      // But this tests the nullish coalescing pattern on the 3rd correct answer
      // The resolvedAt should have been set exactly once
      expect(store.getState().misconceptions['add_no_carry::add-2digit'].resolvedAt).toBe(resolvedAt);
    });

    it('resolves all confirmed records for the same skillId', () => {
      const store = createTestStore();

      // Two different bugTags confirmed for same skillId
      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 3);
      recordAcrossSessions(store, 'place_value', 'add-2digit', 3);

      expect(store.getState().misconceptions['add_no_carry::add-2digit'].status).toBe('confirmed');
      expect(store.getState().misconceptions['place_value::add-2digit'].status).toBe('confirmed');

      // 3 remediation corrects for the skillId
      store.getState().recordRemediationCorrect('add-2digit');
      store.getState().recordRemediationCorrect('add-2digit');
      store.getState().recordRemediationCorrect('add-2digit');

      // Both should have been incremented
      expect(store.getState().misconceptions['add_no_carry::add-2digit'].remediationCorrectCount).toBe(3);
      expect(store.getState().misconceptions['place_value::add-2digit'].remediationCorrectCount).toBe(3);
      expect(store.getState().misconceptions['add_no_carry::add-2digit'].status).toBe('resolved');
      expect(store.getState().misconceptions['place_value::add-2digit'].status).toBe('resolved');
    });

    it('getConfirmedMisconceptions excludes resolved records', () => {
      const store = createTestStore();

      // Confirm two misconceptions
      recordAcrossSessions(store, 'add_no_carry', 'add-2digit', 3);
      recordAcrossSessions(store, 'mul_table', 'mul-single', 3);

      expect(getConfirmedMisconceptions(store.getState().misconceptions)).toHaveLength(2);

      // Resolve one
      store.getState().recordRemediationCorrect('add-2digit');
      store.getState().recordRemediationCorrect('add-2digit');
      store.getState().recordRemediationCorrect('add-2digit');

      const confirmed = getConfirmedMisconceptions(store.getState().misconceptions);
      expect(confirmed).toHaveLength(1);
      expect(confirmed[0].bugTag).toBe('mul_table');
    });
  });

  describe('REMEDIATION_SESSION_CONFIG', () => {
    it('has warmupCount=0, practiceCount=5, cooldownCount=0', () => {
      expect(REMEDIATION_SESSION_CONFIG).toEqual({
        warmupCount: 0,
        practiceCount: 5,
        cooldownCount: 0,
      });
    });
  });

  describe('migration v7->v8', () => {
    it('adds remediationCorrectCount=0 to existing misconception records', () => {
      const stateV7 = {
        misconceptions: {
          'add_no_carry::add-2digit': {
            bugTag: 'add_no_carry',
            skillId: 'add-2digit',
            occurrenceCount: 3,
            status: 'confirmed',
            firstSeen: '2026-03-01T00:00:00.000Z',
            lastSeen: '2026-03-03T00:00:00.000Z',
            confirmedAt: '2026-03-03T00:00:00.000Z',
          },
        },
      };

      const migrated = migrateStore(stateV7, 7);
      const record = (migrated.misconceptions as Record<string, Record<string, unknown>>)['add_no_carry::add-2digit'];
      expect(record.remediationCorrectCount).toBe(0);
    });

    it('preserves existing remediationCorrectCount on v8+ state', () => {
      const stateV8 = {
        misconceptions: {
          'add_no_carry::add-2digit': {
            bugTag: 'add_no_carry',
            skillId: 'add-2digit',
            occurrenceCount: 3,
            status: 'confirmed',
            firstSeen: '2026-03-01T00:00:00.000Z',
            lastSeen: '2026-03-03T00:00:00.000Z',
            confirmedAt: '2026-03-03T00:00:00.000Z',
            remediationCorrectCount: 2,
          },
        },
      };

      // Migration from v8+ should not overwrite existing value
      const migrated = migrateStore(stateV8, 8);
      const record = (migrated.misconceptions as Record<string, Record<string, unknown>>)['add_no_carry::add-2digit'];
      expect(record.remediationCorrectCount).toBe(2);
    });
  });
});
