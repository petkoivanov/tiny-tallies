/**
 * Tests for useTimeControls hook — pure utility functions and hook behavior.
 */

import { renderHook } from '@testing-library/react-native';

// Pure function tests (no mocks needed)
import {
  getTodayMinutes,
  isInBedtime,
  shouldShowBreak,
} from '@/hooks/useTimeControls';

// Mock store state for hook tests
let mockStoreState: Record<string, unknown> = {};
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

import { useTimeControls } from '@/hooks/useTimeControls';

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    dailyLimitMinutes: 0,
    bedtimeWindow: null,
    breakReminderMinutes: 0,
    sessionHistory: [],
    ...overrides,
  };
}

describe('getTodayMinutes', () => {
  it('returns 0 for empty history', () => {
    expect(getTodayMinutes([])).toBe(0);
  });

  it('sums durations for today only', () => {
    const now = new Date('2026-03-10T14:00:00Z');
    const history = [
      { completedAt: '2026-03-10T12:00:00Z', durationMs: 600_000, score: 5, total: 5, xpEarned: 10, mode: 'standard' as const, skillIds: [] },
      { completedAt: '2026-03-10T13:00:00Z', durationMs: 300_000, score: 3, total: 5, xpEarned: 6, mode: 'standard' as const, skillIds: [] },
      { completedAt: '2026-03-09T12:00:00Z', durationMs: 900_000, score: 4, total: 5, xpEarned: 8, mode: 'standard' as const, skillIds: [] },
    ];
    // 600_000 + 300_000 = 900_000ms = 15 minutes
    expect(getTodayMinutes(history, now)).toBe(15);
  });

  it('floors partial minutes', () => {
    const now = new Date('2026-03-10T14:00:00Z');
    const history = [
      { completedAt: '2026-03-10T12:00:00Z', durationMs: 90_000, score: 1, total: 1, xpEarned: 2, mode: 'standard' as const, skillIds: [] },
    ];
    // 90_000ms = 1.5 min → floor to 1
    expect(getTodayMinutes(history, now)).toBe(1);
  });
});

describe('isInBedtime', () => {
  it('returns false when no window', () => {
    expect(isInBedtime(null)).toBe(false);
  });

  it('detects overnight window (e.g. 20:00–07:00)', () => {
    const window = { start: '20:00', end: '07:00' };
    // 21:00 is in bedtime
    expect(isInBedtime(window, new Date('2026-03-10T21:00:00'))).toBe(true);
    // 23:59 is in bedtime
    expect(isInBedtime(window, new Date('2026-03-10T23:59:00'))).toBe(true);
    // 06:30 is in bedtime
    expect(isInBedtime(window, new Date('2026-03-10T06:30:00'))).toBe(true);
    // 12:00 is NOT in bedtime
    expect(isInBedtime(window, new Date('2026-03-10T12:00:00'))).toBe(false);
    // 07:00 is NOT in bedtime (end is exclusive)
    expect(isInBedtime(window, new Date('2026-03-10T07:00:00'))).toBe(false);
  });

  it('detects same-day window (e.g. 13:00–15:00)', () => {
    const window = { start: '13:00', end: '15:00' };
    expect(isInBedtime(window, new Date('2026-03-10T14:00:00'))).toBe(true);
    expect(isInBedtime(window, new Date('2026-03-10T12:00:00'))).toBe(false);
    expect(isInBedtime(window, new Date('2026-03-10T15:00:00'))).toBe(false);
  });
});

describe('shouldShowBreak', () => {
  it('returns false when disabled (0 minutes)', () => {
    expect(shouldShowBreak(0, 900_000)).toBe(false);
  });

  it('returns false before first interval', () => {
    // 15 min reminder, 14 min elapsed
    expect(shouldShowBreak(15, 14 * 60_000)).toBe(false);
  });

  it('returns true at first interval', () => {
    // 15 min reminder, 15 min elapsed
    expect(shouldShowBreak(15, 15 * 60_000)).toBe(true);
  });

  it('returns true at second interval', () => {
    // 10 min reminder, 20 min elapsed
    expect(shouldShowBreak(10, 20 * 60_000)).toBe(true);
  });
});

describe('useTimeControls hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockState();
  });

  it('allows session when no limits configured', () => {
    const { result } = renderHook(() => useTimeControls());
    expect(result.current.canStartSession).toBe(true);
    expect(result.current.blockReason).toBeNull();
    expect(result.current.blockMessage).toBeNull();
  });

  it('blocks session when daily limit exceeded', () => {
    setMockState({
      dailyLimitMinutes: 30,
      sessionHistory: [
        { completedAt: new Date().toISOString(), durationMs: 1_800_000, score: 5, total: 5, xpEarned: 10, mode: 'standard', skillIds: [] },
      ],
    });
    const { result } = renderHook(() => useTimeControls());
    expect(result.current.canStartSession).toBe(false);
    expect(result.current.blockReason).toBe('daily_limit');
    expect(result.current.dailyMinutesRemaining).toBe(0);
  });

  it('allows session when under daily limit', () => {
    setMockState({
      dailyLimitMinutes: 30,
      sessionHistory: [
        { completedAt: new Date().toISOString(), durationMs: 600_000, score: 5, total: 5, xpEarned: 10, mode: 'standard', skillIds: [] },
      ],
    });
    const { result } = renderHook(() => useTimeControls());
    expect(result.current.canStartSession).toBe(true);
    expect(result.current.dailyMinutesRemaining).toBe(20);
  });

  it('returns null dailyMinutesRemaining when no limit set', () => {
    const { result } = renderHook(() => useTimeControls());
    expect(result.current.dailyMinutesRemaining).toBeNull();
  });

  it('reports correct todayMinutesUsed', () => {
    setMockState({
      sessionHistory: [
        { completedAt: new Date().toISOString(), durationMs: 900_000, score: 5, total: 5, xpEarned: 10, mode: 'standard', skillIds: [] },
      ],
    });
    const { result } = renderHook(() => useTimeControls());
    expect(result.current.todayMinutesUsed).toBe(15);
  });
});
