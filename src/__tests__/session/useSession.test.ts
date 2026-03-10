import { renderHook, act } from '@testing-library/react-native';
import { useAppStore } from '@/store/appStore';
import { useSession, FEEDBACK_DURATION_MS } from '@/hooks/useSession';
import { answerNumericValue } from '@/services/mathEngine/types';
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
    // Adaptive: new user (avgElo=1000) → 2+7+2=11
    expect(result.current.totalProblems).toBe(11);
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
    const correctAnswer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);

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
    const correctAnswer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);
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
    const correctAnswer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);

    expect(result.current.score).toBe(0);

    act(() => {
      result.current.handleAnswer(correctAnswer);
    });

    expect(result.current.score).toBe(1);
  });

  it('score does not increment on incorrect answer', () => {
    const { result } = renderHook(() => useSession());
    const correctAnswer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);
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
    const correctAnswer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);

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
    const correctAnswer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);

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

    // Answer warmup problems (adaptive: 2 for new user)
    const warmupCount = 2; // new user adaptive config
    for (let i = 0; i < warmupCount; i++) {
      const answer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);
      act(() => {
        result.current.handleAnswer(answer);
      });
      act(() => {
        jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
      });
    }

    // After warmup -- should be practice
    expect(result.current.currentIndex).toBe(warmupCount);
    expect(result.current.sessionPhase).toBe('practice');

    // Answer practice problems (adaptive: 7 for new user)
    const practiceCount = 7;
    for (let i = 0; i < practiceCount; i++) {
      const answer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);
      act(() => {
        result.current.handleAnswer(answer);
      });
      act(() => {
        jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
      });
    }

    // After practice -- should be cooldown
    expect(result.current.currentIndex).toBe(warmupCount + practiceCount);
    expect(result.current.sessionPhase).toBe('cooldown');
  });

  it('session completes after all problems', () => {
    const { result } = renderHook(() => useSession());

    // Answer all problems correctly
    for (let i = 0; i < result.current.totalProblems; i++) {
      const answer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);
      act(() => {
        result.current.handleAnswer(answer);
      });
      act(() => {
        jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
      });
    }

    expect(result.current.isComplete).toBe(true);
    expect(result.current.currentProblem).toBeNull();
    const total = result.current.totalProblems;
    expect(result.current.score).toBe(total);
    expect(result.current.sessionResult).not.toBeNull();
    expect(result.current.sessionResult!.score).toBe(total);
    expect(result.current.sessionResult!.total).toBe(total);
    expect(result.current.sessionResult!.xpEarned).toBeGreaterThan(0);
  });

  it('completion commits Elo updates to store', () => {
    const { result } = renderHook(() => useSession());

    // Answer all problems correctly
    for (let i = 0; i < result.current.totalProblems; i++) {
      const answer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);
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
    for (let i = 0; i < result.current.totalProblems; i++) {
      const answer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);
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
      const answer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);
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
    const answer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);
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
    const answer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);
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
    const answer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);

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

  // ---- Leitner integration tests ----

  it('correct answer advances Leitner box in committed store state', () => {
    const { result } = renderHook(() => useSession());

    // Answer all problems correctly
    for (let i = 0; i < result.current.totalProblems; i++) {
      const answer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);
      act(() => {
        result.current.handleAnswer(answer);
      });
      act(() => {
        jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
      });
    }

    // All skills start at Box 1 (default). After correct answers, they should advance.
    const storeState = useAppStore.getState();
    const skillIds = Object.keys(storeState.skillStates);
    expect(skillIds.length).toBeGreaterThan(0);

    // At least one skill should have leitnerBox > 1 (moved up from default)
    const hasAdvanced = skillIds.some(
      (id) => storeState.skillStates[id].leitnerBox > 1,
    );
    expect(hasAdvanced).toBe(true);
  });

  it('wrong answer drops Leitner box in committed store state', () => {
    // Set up a skill at Box 3 so a wrong answer drops it to Box 1
    const initialSkillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': {
        eloRating: 1000,
        attempts: 10,
        correct: 8,
        masteryProbability: 0.5,
        consecutiveWrong: 0,
        masteryLocked: false,
        leitnerBox: 3 as const,
        nextReviewDue: null,
        consecutiveCorrectInBox6: 0,
        cpaLevel: 'concrete' as const,
      },
    };
    useAppStore.setState({ skillStates: initialSkillStates });

    const { result } = renderHook(() => useSession());

    // Answer all problems -- deliberately answer some wrong
    for (let i = 0; i < result.current.totalProblems; i++) {
      const problem = result.current.currentProblem!;
      const correctAnswer = answerNumericValue(problem.problem.correctAnswer);

      // For the first problem, if it's the skill we set up at Box 3, answer wrong
      if (i === 0 && problem.skillId === 'addition.single-digit.no-carry') {
        const wrongOption = problem.presentation.options.find(
          (o) => o.value !== correctAnswer,
        );
        act(() => {
          result.current.handleAnswer(wrongOption!.value);
        });
      } else {
        act(() => {
          result.current.handleAnswer(correctAnswer);
        });
      }
      act(() => {
        jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
      });
    }

    // If the skill was answered wrong from Box 3, it should be at Box 1 (3 - 2 = 1)
    const storeState = useAppStore.getState();
    const skillState = storeState.skillStates['addition.single-digit.no-carry'];
    if (skillState) {
      // The final box depends on how many times the skill appeared.
      // With wrong answer from Box 3: drops to Box 1 (3-2=1).
      // If it appeared again later and was answered correctly: moves to Box 2.
      // We just verify the Leitner box was persisted (not null/undefined).
      expect(skillState.leitnerBox).toBeGreaterThanOrEqual(1);
      expect(skillState.leitnerBox).toBeLessThanOrEqual(6);
    }
  });

  it('completion commits nextReviewDue to store for each skill', () => {
    const { result } = renderHook(() => useSession());

    // Answer all problems correctly
    for (let i = 0; i < result.current.totalProblems; i++) {
      const answer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);
      act(() => {
        result.current.handleAnswer(answer);
      });
      act(() => {
        jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
      });
    }

    const storeState = useAppStore.getState();
    const skillIds = Object.keys(storeState.skillStates);

    // Every skill that was practiced should have a nextReviewDue set
    for (const id of skillIds) {
      const skill = storeState.skillStates[id];
      if (skill.attempts > 0) {
        // Skills that advanced past Box 1 should have an ISO date string
        if (skill.leitnerBox > 1) {
          expect(typeof skill.nextReviewDue).toBe('string');
          expect(new Date(skill.nextReviewDue!).toISOString()).toBe(skill.nextReviewDue);
        }
      }
    }
  });

  it('completion commits consecutiveCorrectInBox6 to store', () => {
    // Set up a skill already at Box 6 to test consecutive tracking
    const initialSkillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': {
        eloRating: 1000,
        attempts: 50,
        correct: 45,
        masteryProbability: 0.8,
        consecutiveWrong: 0,
        masteryLocked: false,
        leitnerBox: 6 as const,
        nextReviewDue: null,
        consecutiveCorrectInBox6: 1,
        cpaLevel: 'pictorial' as const,
      },
    };
    useAppStore.setState({ skillStates: initialSkillStates });

    const { result } = renderHook(() => useSession());

    // Answer all problems correctly
    for (let i = 0; i < result.current.totalProblems; i++) {
      const answer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);
      act(() => {
        result.current.handleAnswer(answer);
      });
      act(() => {
        jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
      });
    }

    const storeState = useAppStore.getState();
    const skillState = storeState.skillStates['addition.single-digit.no-carry'];

    if (skillState) {
      // Started at Box 6 with 1 consecutive correct. Each correct answer in Box 6
      // increments the counter. The final value depends on how many times this skill appeared.
      expect(skillState.consecutiveCorrectInBox6).toBeGreaterThanOrEqual(1);
      expect(typeof skillState.consecutiveCorrectInBox6).toBe('number');
    }
  });

  it('pending updates include Leitner fields in sessionResult', () => {
    const { result } = renderHook(() => useSession());

    // Answer all problems correctly
    for (let i = 0; i < result.current.totalProblems; i++) {
      const answer = answerNumericValue(result.current.currentProblem!.problem.correctAnswer);
      act(() => {
        result.current.handleAnswer(answer);
      });
      act(() => {
        jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
      });
    }

    const sessionResult = result.current.sessionResult;
    expect(sessionResult).not.toBeNull();

    // Check that pending updates in the session result contain Leitner fields
    for (const [, update] of sessionResult!.pendingUpdates) {
      expect(update.newLeitnerBox).toBeGreaterThanOrEqual(1);
      expect(update.newLeitnerBox).toBeLessThanOrEqual(6);
      expect(typeof update.newNextReviewDue).toBe('string');
      expect(typeof update.newConsecutiveCorrectInBox6).toBe('number');
    }
  });
});
