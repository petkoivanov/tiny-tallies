import { renderHook } from '@testing-library/react-native';

// Mock store state
let mockStoreState: Record<string, unknown> = {};
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

// Mock absence decay service
const mockCalculateAbsenceDecay = jest.fn();
const mockDaysSince = jest.fn();
const mockShouldSuggestReassessment = jest.fn();
jest.mock('@/services/cat/absenceDecay', () => ({
  calculateAbsenceDecay: (...args: unknown[]) =>
    mockCalculateAbsenceDecay(...args),
  daysSince: (...args: unknown[]) => mockDaysSince(...args),
  shouldSuggestReassessment: (...args: unknown[]) =>
    mockShouldSuggestReassessment(...args),
}));

import { useAbsenceCheck } from '@/hooks/useAbsenceCheck';

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    lastPracticeDate: null,
    placementComplete: false,
    skillStates: {},
    updateSkillState: jest.fn(),
    ...overrides,
  };
}

describe('useAbsenceCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockState();
    mockDaysSince.mockReturnValue(0);
    mockShouldSuggestReassessment.mockReturnValue(false);
  });

  it('returns no suggestion when lastPracticeDate is null', () => {
    const { result } = renderHook(() => useAbsenceCheck());

    expect(result.current.suggestReassessment).toBe(false);
    expect(result.current.decayedSkillCount).toBe(0);
    expect(result.current.daysSinceLastPractice).toBe(0);
  });

  it('returns no suggestion when within grace period (3 days)', () => {
    mockDaysSince.mockReturnValue(2);
    setMockState({
      lastPracticeDate: '2026-03-08T00:00:00Z',
      placementComplete: true,
      skillStates: {
        'add.single': {
          eloRating: 1100,
          masteryProbability: 0.9,
          leitnerBox: 4,
          masteryLocked: true,
          attempts: 10,
        },
      },
    });

    const { result } = renderHook(() => useAbsenceCheck());

    expect(result.current.suggestReassessment).toBe(false);
    expect(mockCalculateAbsenceDecay).not.toHaveBeenCalled();
  });

  it('returns no suggestion when placement not complete', () => {
    mockDaysSince.mockReturnValue(14);
    setMockState({
      lastPracticeDate: '2026-02-24T00:00:00Z',
      placementComplete: false,
      skillStates: {
        'add.single': {
          eloRating: 1100,
          masteryProbability: 0.9,
          leitnerBox: 4,
          masteryLocked: true,
          attempts: 10,
        },
      },
    });

    const { result } = renderHook(() => useAbsenceCheck());

    expect(result.current.suggestReassessment).toBe(false);
  });

  it('calculates decay for practiced skills when absent > 3 days', () => {
    mockDaysSince.mockReturnValue(10);
    mockCalculateAbsenceDecay.mockReturnValue({
      newElo: 1050,
      eloDecay: 50,
      newMasteryProbability: 0.8,
      breakMasteryLock: false,
      suggestReassessment: false,
    });
    mockShouldSuggestReassessment.mockReturnValue(false);

    setMockState({
      lastPracticeDate: '2026-02-28T00:00:00Z',
      placementComplete: true,
      skillStates: {
        'add.single': {
          eloRating: 1100,
          masteryProbability: 0.9,
          leitnerBox: 4,
          masteryLocked: true,
          attempts: 10,
        },
      },
    });

    const { result } = renderHook(() => useAbsenceCheck());

    expect(mockCalculateAbsenceDecay).toHaveBeenCalledWith({
      eloRating: 1100,
      masteryProbability: 0.9,
      leitnerBox: 4,
      masteryLocked: true,
      daysSinceLastPractice: 10,
    });
    expect(result.current.suggestReassessment).toBe(false);
  });

  it('returns true when shouldSuggestReassessment returns true', () => {
    mockDaysSince.mockReturnValue(30);
    mockCalculateAbsenceDecay.mockReturnValue({
      newElo: 920,
      eloDecay: 80,
      newMasteryProbability: 0.5,
      breakMasteryLock: true,
      suggestReassessment: true,
    });
    mockShouldSuggestReassessment.mockReturnValue(true);

    setMockState({
      lastPracticeDate: '2026-02-08T00:00:00Z',
      placementComplete: true,
      skillStates: {
        'add.single': { eloRating: 1100, masteryProbability: 0.9, leitnerBox: 2, masteryLocked: true, attempts: 10 },
        'sub.single': { eloRating: 1050, masteryProbability: 0.85, leitnerBox: 2, masteryLocked: true, attempts: 8 },
        'mul.single': { eloRating: 1000, masteryProbability: 0.8, leitnerBox: 1, masteryLocked: false, attempts: 5 },
      },
    });

    const { result } = renderHook(() => useAbsenceCheck());

    expect(result.current.suggestReassessment).toBe(true);
    expect(result.current.decayedSkillCount).toBe(3);
  });

  it('skips skills with zero attempts', () => {
    mockDaysSince.mockReturnValue(10);
    mockShouldSuggestReassessment.mockReturnValue(false);

    setMockState({
      lastPracticeDate: '2026-02-28T00:00:00Z',
      placementComplete: true,
      skillStates: {
        'add.single': { eloRating: 1000, masteryProbability: 0.1, leitnerBox: 1, masteryLocked: false, attempts: 0 },
      },
    });

    const { result } = renderHook(() => useAbsenceCheck());

    expect(mockCalculateAbsenceDecay).not.toHaveBeenCalled();
    expect(result.current.decayedSkillCount).toBe(0);
  });
});
