import { useAppStore } from '@/store/appStore';
import type { SessionHistoryEntry } from '@/store/slices/sessionHistorySlice';

function makeEntry(overrides: Partial<SessionHistoryEntry> = {}): SessionHistoryEntry {
  return {
    completedAt: '2026-03-10T10:00:00.000Z',
    score: 8,
    total: 10,
    xpEarned: 120,
    durationMs: 90000,
    mode: 'standard',
    skillIds: ['addition.single-digit.no-carry'],
    ...overrides,
  };
}

describe('sessionHistorySlice', () => {
  beforeEach(() => {
    useAppStore.setState({ sessionHistory: [] });
  });

  it('starts with empty session history', () => {
    expect(useAppStore.getState().sessionHistory).toEqual([]);
  });

  it('adds a session history entry', () => {
    const entry = makeEntry();
    useAppStore.getState().addSessionHistory(entry);

    const history = useAppStore.getState().sessionHistory;
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(entry);
  });

  it('prepends newest entries first', () => {
    const entry1 = makeEntry({ completedAt: '2026-03-08T10:00:00.000Z' });
    const entry2 = makeEntry({ completedAt: '2026-03-09T10:00:00.000Z' });
    const entry3 = makeEntry({ completedAt: '2026-03-10T10:00:00.000Z' });

    useAppStore.getState().addSessionHistory(entry1);
    useAppStore.getState().addSessionHistory(entry2);
    useAppStore.getState().addSessionHistory(entry3);

    const history = useAppStore.getState().sessionHistory;
    expect(history).toHaveLength(3);
    expect(history[0].completedAt).toBe('2026-03-10T10:00:00.000Z');
    expect(history[1].completedAt).toBe('2026-03-09T10:00:00.000Z');
    expect(history[2].completedAt).toBe('2026-03-08T10:00:00.000Z');
  });

  it('caps history at 50 entries', () => {
    // Add 52 entries
    for (let i = 0; i < 52; i++) {
      useAppStore.getState().addSessionHistory(
        makeEntry({ completedAt: `2026-03-${String(i + 1).padStart(2, '0')}T10:00:00.000Z` }),
      );
    }

    const history = useAppStore.getState().sessionHistory;
    expect(history).toHaveLength(50);
    // Newest should be first
    expect(history[0].completedAt).toContain('52');
  });

  it('preserves all entry fields', () => {
    const entry = makeEntry({
      score: 5,
      total: 7,
      xpEarned: 80,
      durationMs: 45000,
      mode: 'challenge',
      skillIds: ['addition.single-digit.no-carry', 'subtraction.single-digit.no-borrow'],
    });

    useAppStore.getState().addSessionHistory(entry);

    const stored = useAppStore.getState().sessionHistory[0];
    expect(stored.score).toBe(5);
    expect(stored.total).toBe(7);
    expect(stored.xpEarned).toBe(80);
    expect(stored.durationMs).toBe(45000);
    expect(stored.mode).toBe('challenge');
    expect(stored.skillIds).toEqual([
      'addition.single-digit.no-carry',
      'subtraction.single-digit.no-borrow',
    ]);
  });
});
