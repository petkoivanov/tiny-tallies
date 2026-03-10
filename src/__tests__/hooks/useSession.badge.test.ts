import { renderHook, act } from '@testing-library/react-native';

// Mock evaluateBadges so we can control what badges are "earned"
const mockEvaluateBadges = jest.fn<string[], [unknown, unknown]>();
jest.mock('@/services/achievement', () => ({
  ...jest.requireActual('@/services/achievement'),
  evaluateBadges: (a: unknown, b: unknown) => mockEvaluateBadges(a, b),
}));

import { useAppStore } from '@/store/appStore';
import { useSession, FEEDBACK_DURATION_MS } from '@/hooks/useSession';
import { answerNumericValue } from '@/services/mathEngine/types';

jest.useFakeTimers();

/**
 * Helper: complete an entire session by answering all problems correctly.
 * After calling this, result.current.isComplete should be true.
 */
function completeSession(result: { current: ReturnType<typeof useSession> }) {
  const total = result.current.totalProblems;
  for (let i = 0; i < total; i++) {
    const problem = result.current.currentProblem;
    if (!problem) break;

    act(() => {
      result.current.handleAnswer(answerNumericValue(problem.problem.correctAnswer));
    });
    act(() => {
      jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
    });
  }
}

describe('useSession badge integration', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true);
    jest.clearAllTimers();
    mockEvaluateBadges.mockReset();
    mockEvaluateBadges.mockReturnValue([]);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('calls incrementSessionsCompleted before evaluateBadges on session complete', () => {
    const callOrder: string[] = [];

    // Track when incrementSessionsCompleted is called
    const originalState = useAppStore.getState();
    const origIncrement = originalState.incrementSessionsCompleted.bind(originalState);
    jest.spyOn(useAppStore.getState(), 'incrementSessionsCompleted');

    // Track call ordering via evaluateBadges mock
    mockEvaluateBadges.mockImplementation((snapshot) => {
      // At this point, sessionsCompleted should already be incremented
      callOrder.push(`evaluateBadges:sessions=${(snapshot as { sessionsCompleted: number }).sessionsCompleted}`);
      return [];
    });

    const sessionsBeforeSession = useAppStore.getState().sessionsCompleted;

    const { result } = renderHook(() => useSession());
    completeSession(result);

    // evaluateBadges was called
    expect(mockEvaluateBadges).toHaveBeenCalledTimes(1);

    // The snapshot passed to evaluateBadges should have the incremented value
    const snapshot = mockEvaluateBadges.mock.calls[0][0] as { sessionsCompleted: number };
    expect(snapshot.sessionsCompleted).toBe(sessionsBeforeSession + 1);
  });

  it('evaluateBadges receives a snapshot built from post-commit store state', () => {
    mockEvaluateBadges.mockReturnValue([]);

    const { result } = renderHook(() => useSession());
    completeSession(result);

    expect(mockEvaluateBadges).toHaveBeenCalledTimes(1);

    const snapshot = mockEvaluateBadges.mock.calls[0][0] as Record<string, unknown>;
    // Should contain expected snapshot fields
    expect(snapshot).toHaveProperty('skillStates');
    expect(snapshot).toHaveProperty('weeklyStreak');
    expect(snapshot).toHaveProperty('sessionsCompleted');
    expect(snapshot).toHaveProperty('misconceptions');
  });

  it('calls addEarnedBadges when evaluateBadges returns badge IDs', () => {
    mockEvaluateBadges.mockReturnValue(['behavior.sessions.bronze', 'behavior.streak.bronze']);

    const { result } = renderHook(() => useSession());
    completeSession(result);

    // Badges should be persisted in the store
    const { earnedBadges } = useAppStore.getState();
    expect(earnedBadges['behavior.sessions.bronze']).toBeDefined();
    expect(earnedBadges['behavior.sessions.bronze'].earnedAt).toBeTruthy();
    expect(earnedBadges['behavior.streak.bronze']).toBeDefined();
  });

  it('does NOT call addEarnedBadges when evaluateBadges returns empty array', () => {
    mockEvaluateBadges.mockReturnValue([]);

    // Pre-set earnedBadges to verify they are unchanged
    const initialBadges = useAppStore.getState().earnedBadges;

    const { result } = renderHook(() => useSession());
    completeSession(result);

    // earnedBadges should remain unchanged
    const { earnedBadges } = useAppStore.getState();
    expect(earnedBadges).toEqual(initialBadges);
  });

  it('sessionResult.newBadges contains the badge IDs returned by evaluateBadges', () => {
    const expectedBadges = ['mastery.addition.single-digit.no-carry'];
    mockEvaluateBadges.mockReturnValue(expectedBadges);

    const { result } = renderHook(() => useSession());
    completeSession(result);

    expect(result.current.sessionResult).not.toBeNull();
    expect(result.current.sessionResult!.newBadges).toEqual(expectedBadges);
  });

  it('sessionResult.newBadges is empty array when no badges earned', () => {
    mockEvaluateBadges.mockReturnValue([]);

    const { result } = renderHook(() => useSession());
    completeSession(result);

    expect(result.current.sessionResult).not.toBeNull();
    expect(result.current.sessionResult!.newBadges).toEqual([]);
  });
});
