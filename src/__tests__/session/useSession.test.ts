import { renderHook, act } from '@testing-library/react-native';
import { useAppStore } from '@/store/appStore';
import { useSession, FEEDBACK_DURATION_MS } from '@/hooks/useSession';
import type { SkillState } from '@/store/slices/skillStatesSlice';

// Use fake timers for feedback timeout control
jest.useFakeTimers();

describe('useSession', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAppStore.setState(useAppStore.getInitialState(), true);
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('initializes with first problem from queue', () => {
    const { result } = renderHook(() => useSession());

    expect(result.current.currentProblem).not.toBeNull();
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.totalProblems).toBe(15);
    expect(result.current.sessionPhase).toBe('warmup');
    expect(result.current.isComplete).toBe(false);
    expect(result.current.score).toBe(0);
    expect(result.current.feedbackState).toBeNull();
    expect(result.current.sessionResult).toBeNull();
  });

  it('calls startSession on store when initialized', () => {
    renderHook(() => useSession());
    expect(useAppStore.getState().isSessionActive).toBe(true);
  });

  it('handleAnswer sets feedbackState for correct answer', () => {
    const { result } = renderHook(() => useSession());
    const correctAnswer = result.current.currentProblem!.problem.correctAnswer;

    act(() => {
      result.current.handleAnswer(correctAnswer);
    });

    expect(result.current.feedbackState).toEqual({
      visible: true,
      correct: true,
    });
  });

  it('handleAnswer sets feedbackState for incorrect answer', () => {
    const { result } = renderHook(() => useSession());
    const correctAnswer = result.current.currentProblem!.problem.correctAnswer;
    // Pick a wrong answer from the options
    const wrongOption = result.current.currentProblem!.presentation.options.find(
      (o) => o.value !== correctAnswer,
    );

    act(() => {
      result.current.handleAnswer(wrongOption!.value);
    });

    expect(result.current.feedbackState).toEqual({
      visible: true,
      correct: false,
    });
  });

  it('score increments on correct answer', () => {
    const { result } = renderHook(() => useSession());
    const correctAnswer = result.current.currentProblem!.problem.correctAnswer;

    expect(result.current.score).toBe(0);

    act(() => {
      result.current.handleAnswer(correctAnswer);
    });

    expect(result.current.score).toBe(1);
  });

  it('score does not increment on incorrect answer', () => {
    const { result } = renderHook(() => useSession());
    const correctAnswer = result.current.currentProblem!.problem.correctAnswer;
    const wrongOption = result.current.currentProblem!.presentation.options.find(
      (o) => o.value !== correctAnswer,
    );

    act(() => {
      result.current.handleAnswer(wrongOption!.value);
    });

    expect(result.current.score).toBe(0);
  });

  it('after feedback timeout, advances to next problem', () => {
    const { result } = renderHook(() => useSession());
    const correctAnswer = result.current.currentProblem!.problem.correctAnswer;

    act(() => {
      result.current.handleAnswer(correctAnswer);
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.feedbackState).not.toBeNull();

    // Advance past feedback duration
    act(() => {
      jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.feedbackState).toBeNull();
    expect(result.current.currentProblem).not.toBeNull();
  });

  it('records answer in store via recordAnswer', () => {
    const { result } = renderHook(() => useSession());
    const correctAnswer = result.current.currentProblem!.problem.correctAnswer;

    act(() => {
      result.current.handleAnswer(correctAnswer);
    });

    const answers = useAppStore.getState().sessionAnswers;
    expect(answers).toHaveLength(1);
    expect(answers[0].correct).toBe(true);
    expect(answers[0].format).toBe('mc');
  });

  it('sessionPhase transitions through warmup -> practice -> cooldown', () => {
    const { result } = renderHook(() => useSession());

    // Initially warmup (index 0)
    expect(result.current.sessionPhase).toBe('warmup');

    // Answer first 3 (warmup) problems
    for (let i = 0; i < 3; i++) {
      const answer = result.current.currentProblem!.problem.correctAnswer;
      act(() => {
        result.current.handleAnswer(answer);
      });
      act(() => {
        jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
      });
    }

    // Now at index 3 -- should be practice
    expect(result.current.currentIndex).toBe(3);
    expect(result.current.sessionPhase).toBe('practice');

    // Answer next 9 (practice) problems
    for (let i = 0; i < 9; i++) {
      const answer = result.current.currentProblem!.problem.correctAnswer;
      act(() => {
        result.current.handleAnswer(answer);
      });
      act(() => {
        jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
      });
    }

    // Now at index 12 -- should be cooldown
    expect(result.current.currentIndex).toBe(12);
    expect(result.current.sessionPhase).toBe('cooldown');
  });

  it('session completes after all 15 problems', () => {
    const { result } = renderHook(() => useSession());

    // Answer all 15 problems correctly
    for (let i = 0; i < 15; i++) {
      const answer = result.current.currentProblem!.problem.correctAnswer;
      act(() => {
        result.current.handleAnswer(answer);
      });
      act(() => {
        jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
      });
    }

    expect(result.current.isComplete).toBe(true);
    expect(result.current.currentProblem).toBeNull();
    expect(result.current.score).toBe(15);
    expect(result.current.sessionResult).not.toBeNull();
    expect(result.current.sessionResult!.score).toBe(15);
    expect(result.current.sessionResult!.total).toBe(15);
    expect(result.current.sessionResult!.xpEarned).toBeGreaterThan(0);
  });

  it('completion commits Elo updates to store', () => {
    const { result } = renderHook(() => useSession());

    // Answer all 15 problems correctly
    for (let i = 0; i < 15; i++) {
      const answer = result.current.currentProblem!.problem.correctAnswer;
      act(() => {
        result.current.handleAnswer(answer);
      });
      act(() => {
        jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
      });
    }

    // Elo updates should have been committed to store
    const storeState = useAppStore.getState();
    const skillIds = Object.keys(storeState.skillStates);
    expect(skillIds.length).toBeGreaterThan(0);

    // At least one skill should have attempts > 0
    const hasAttempts = skillIds.some(
      (id) => storeState.skillStates[id].attempts > 0,
    );
    expect(hasAttempts).toBe(true);
  });

  it('completion adds XP to store', () => {
    const { result } = renderHook(() => useSession());

    const xpBefore = useAppStore.getState().xp;

    // Answer all 15 correctly
    for (let i = 0; i < 15; i++) {
      const answer = result.current.currentProblem!.problem.correctAnswer;
      act(() => {
        result.current.handleAnswer(answer);
      });
      act(() => {
        jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
      });
    }

    const xpAfter = useAppStore.getState().xp;
    expect(xpAfter).toBeGreaterThan(xpBefore);
  });

  it('handleQuit resets session state without committing', () => {
    const { result } = renderHook(() => useSession());

    // Answer a few problems
    for (let i = 0; i < 3; i++) {
      const answer = result.current.currentProblem!.problem.correctAnswer;
      act(() => {
        result.current.handleAnswer(answer);
      });
      act(() => {
        jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
      });
    }

    expect(result.current.score).toBe(3);

    // Quit
    act(() => {
      result.current.handleQuit();
    });

    // Local state reset
    expect(result.current.score).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.feedbackState).toBeNull();
    expect(result.current.sessionResult).toBeNull();

    // Store should NOT have Elo updates committed
    const storeState = useAppStore.getState();
    expect(storeState.isSessionActive).toBe(false);
    expect(storeState.xp).toBe(0);
    expect(Object.keys(storeState.skillStates)).toHaveLength(0);
  });

  it('handleQuit clears active feedback timer', () => {
    const { result } = renderHook(() => useSession());

    // Answer a problem (starts feedback timer)
    const answer = result.current.currentProblem!.problem.correctAnswer;
    act(() => {
      result.current.handleAnswer(answer);
    });

    expect(result.current.feedbackState).not.toBeNull();

    // Quit before timer fires
    act(() => {
      result.current.handleQuit();
    });

    expect(result.current.feedbackState).toBeNull();

    // Advance time -- timer should NOT fire (no state change)
    act(() => {
      jest.advanceTimersByTime(FEEDBACK_DURATION_MS * 2);
    });

    // Still reset
    expect(result.current.score).toBe(0);
  });

  it('cleanup clears feedback timer on unmount', () => {
    const { result, unmount } = renderHook(() => useSession());

    // Answer a problem (starts feedback timer)
    const answer = result.current.currentProblem!.problem.correctAnswer;
    act(() => {
      result.current.handleAnswer(answer);
    });

    // Unmount while timer is pending
    unmount();

    // Timer should be cleared -- advance time should cause no errors
    act(() => {
      jest.advanceTimersByTime(FEEDBACK_DURATION_MS * 2);
    });
  });

  it('ignores answer during active feedback', () => {
    const { result } = renderHook(() => useSession());
    const answer = result.current.currentProblem!.problem.correctAnswer;

    act(() => {
      result.current.handleAnswer(answer);
    });

    expect(result.current.feedbackState).not.toBeNull();

    // Try answering again during feedback -- should be ignored
    act(() => {
      result.current.handleAnswer(answer);
    });

    // Should still only have 1 answer recorded
    expect(useAppStore.getState().sessionAnswers).toHaveLength(1);
  });
});
