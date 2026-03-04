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
} from '@/store/slices/misconceptionSlice';

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
});
