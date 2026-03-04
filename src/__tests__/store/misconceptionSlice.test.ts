import { create, type StateCreator } from 'zustand';
import {
  type MisconceptionSlice,
  type MisconceptionRecord,
  createMisconceptionSlice,
  getMisconceptionsBySkill,
  getMisconceptionsByBugTag,
} from '@/store/slices/misconceptionSlice';

// Create a minimal test store with just the misconception slice.
// The cast is necessary because createMisconceptionSlice is typed for the full
// AppState context, but the slice is self-contained and works standalone.
function createTestStore() {
  return create<MisconceptionSlice>()(
    createMisconceptionSlice as unknown as StateCreator<MisconceptionSlice>,
  );
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
});
