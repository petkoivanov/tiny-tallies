import { create } from 'zustand';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';

// Import slice under test
import {
  type SandboxSlice,
  createSandboxSlice,
} from '@/store/slices/sandboxSlice';

// Create a minimal test store with just the sandbox slice
function createTestStore() {
  return create<SandboxSlice>()((...a) => ({
    ...createSandboxSlice(...a),
  }));
}

describe('sandboxSlice', () => {
  it('starts with empty exploredManipulatives array', () => {
    const store = createTestStore();
    expect(store.getState().exploredManipulatives).toEqual([]);
  });

  it('markExplored adds a manipulative type to exploredManipulatives', () => {
    const store = createTestStore();
    store.getState().markExplored('counters');
    expect(store.getState().exploredManipulatives).toContain('counters');
  });

  it('markExplored does not duplicate an already-explored type', () => {
    const store = createTestStore();
    store.getState().markExplored('counters');
    store.getState().markExplored('counters');
    expect(
      store.getState().exploredManipulatives.filter((t) => t === 'counters'),
    ).toHaveLength(1);
  });

  it('markExplored for all 6 types results in array of length 6', () => {
    const store = createTestStore();
    const allTypes: ManipulativeType[] = [
      'counters',
      'ten_frame',
      'base_ten_blocks',
      'number_line',
      'fraction_strips',
      'bar_model',
    ];
    allTypes.forEach((t) => store.getState().markExplored(t));
    expect(store.getState().exploredManipulatives).toHaveLength(6);
  });

  it('isExplored returns false initially and true after markExplored', () => {
    const store = createTestStore();
    expect(store.getState().exploredManipulatives.includes('counters')).toBe(
      false,
    );
    store.getState().markExplored('counters');
    expect(store.getState().exploredManipulatives.includes('counters')).toBe(
      true,
    );
  });
});
