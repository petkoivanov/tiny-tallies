import { renderHook, act, waitFor } from '@testing-library/react-native';
import type { ChatOrchestrationParams } from '@/hooks/useChatOrchestration';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Mock appStore
const mockAddTutorMessage = jest.fn();
const mockIncrementWrongAnswerCount = jest.fn();
const mockSetVideoVote = jest.fn();
let mockTutorConsentGranted = true;
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: any) => {
    const state = {
      addTutorMessage: mockAddTutorMessage,
      incrementWrongAnswerCount: mockIncrementWrongAnswerCount,
      tutorConsentGranted: mockTutorConsentGranted,
      youtubeConsentGranted: false,
      videoVotes: {},
      setVideoVote: mockSetVideoVote,
    };
    return selector(state);
  },
}));

// Mock getBugDescription
const mockGetBugDescription = jest.fn();
jest.mock('@/services/tutor/bugLookup', () => ({
  getBugDescription: (...args: any[]) => mockGetBugDescription(...args),
}));

// Import after mocks
import { useChatOrchestration } from '@/hooks/useChatOrchestration';

// Mock functions for params
const mockRequestHint = jest.fn();
const mockRequestTutor = jest.fn();
const mockResetForProblem = jest.fn();
const mockHandleAnswer = jest.fn();
const mockSetLastWrongContext = jest.fn();

function createDefaultParams(
  overrides?: Partial<ChatOrchestrationParams>,
): ChatOrchestrationParams {
  return {
    tutor: {
      messages: [],
      loading: false,
      error: null,
      tutorMode: 'hint',
      hintLevel: 0,
      hasMoreHints: false,
      ladderExhausted: false,
      shouldExpandManipulative: false,
      manipulativeType: null,
      requestHint: mockRequestHint,
      requestTutor: mockRequestTutor,
      resetForProblem: mockResetForProblem,
    },
    currentProblem: {
      problem: {
        id: 'test-1',
        templateId: 'add-1d-1d',
        operation: 'addition',
        operands: [23, 45],
        correctAnswer: 68,
        questionText: '23 + 45 = ?',
        skillId: 'addition.single',
        standards: ['1.OA.1'],
        grade: 1,
        baseElo: 900,
        metadata: {
          digitCount: 2,
          requiresCarry: false,
          requiresBorrow: false,
        },
      },
      presentation: {
        problem: {} as any,
        format: 'multiple_choice',
        options: [
          { value: 68 },
          { value: 58, bugId: 'add_no_carry' },
          { value: 78 },
          { value: 63 },
        ],
        correctIndex: 0,
      },
      phase: 'warmup',
      skillId: 'addition.single',
      templateBaseElo: 900,
      studentElo: 1000,
    } as any,
    currentIndex: 0,
    correctAnswer: 68,
    feedbackState: null,
    sessionPhase: 'practice',
    isComplete: false,
    isOnline: true,
    handleAnswer: mockHandleAnswer,
    setLastWrongContext: mockSetLastWrongContext,
    ...overrides,
  };
}

describe('useChatOrchestration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTutorConsentGranted = true;
  });

  it('initializes with chatOpen=false, chatMinimized=false, shouldPulse=false', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams()),
    );
    expect(result.current.chatOpen).toBe(false);
    expect(result.current.chatMinimized).toBe(false);
    expect(result.current.shouldPulse).toBe(false);
  });

  it('handleHelpTap sets chatOpen=true, shows domain intro locally, does NOT call requestHint', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams()),
    );

    act(() => {
      result.current.handleHelpTap();
    });

    expect(result.current.chatOpen).toBe(true);
    expect(mockRequestHint).not.toHaveBeenCalled();
    expect(mockAddTutorMessage).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'tutor', id: expect.stringMatching(/^tutor-intro-/) }),
    );
  });

  it('handleHelpTap without consent: adds consent message, navigates to Consent, does NOT call requestHint', () => {
    mockTutorConsentGranted = false;
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams()),
    );

    act(() => {
      result.current.handleHelpTap();
    });

    expect(mockAddTutorMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'tutor',
        text: expect.stringContaining('grown-up'),
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('Consent');
    expect(mockRequestHint).not.toHaveBeenCalled();
  });

  it('handleResponse("understand") adds child message "I understand!"', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams()),
    );

    act(() => {
      result.current.handleResponse('understand');
    });

    expect(mockAddTutorMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'child',
        text: 'I understand!',
      }),
    );
  });

  it('handleResponse("more") adds child message and calls requestTutor', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams()),
    );

    act(() => {
      result.current.handleResponse('more');
    });

    expect(mockAddTutorMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'child',
        text: 'Tell me more',
      }),
    );
    expect(mockRequestTutor).toHaveBeenCalled();
  });

  it('handleResponse("gotit") adds child message "Got it!"', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams()),
    );

    act(() => {
      result.current.handleResponse('gotit');
    });

    expect(mockAddTutorMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'child',
        text: 'Got it!',
      }),
    );
  });

  it('handleCloseChat sets chatOpen=false', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams()),
    );

    // Open chat first
    act(() => {
      result.current.handleHelpTap();
    });
    expect(result.current.chatOpen).toBe(true);

    act(() => {
      result.current.handleCloseChat();
    });
    expect(result.current.chatOpen).toBe(false);
  });

  it('handleBannerTap sets chatOpen=true, chatMinimized=false', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams()),
    );

    act(() => {
      result.current.handleBannerTap();
    });

    expect(result.current.chatOpen).toBe(true);
    expect(result.current.chatMinimized).toBe(false);
  });

  it('responseMode returns "gotit" when tutorMode is "boost"', () => {
    const params = createDefaultParams();
    params.tutor = { ...params.tutor, tutorMode: 'boost' };

    const { result } = renderHook(() => useChatOrchestration(params));
    expect(result.current.responseMode).toBe('gotit');
  });

  it('responseMode returns "standard" when tutorMode is "hint"', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams()),
    );
    expect(result.current.responseMode).toBe('standard');
  });

  it('handleAnswerWithBoost calls handleAnswer with BOOST_SENTINEL when boost + correct answer', () => {
    const params = createDefaultParams();
    params.tutor = { ...params.tutor, tutorMode: 'boost' };

    const { result } = renderHook(() => useChatOrchestration(params));

    act(() => {
      result.current.handleAnswerWithBoost(68); // correct answer
    });

    expect(mockHandleAnswer).toHaveBeenCalledWith(-999999);
    expect(mockHandleAnswer).not.toHaveBeenCalledWith(68);
  });

  it('handleAnswerWithBoost passes through normally for wrong answers', () => {
    const params = createDefaultParams();
    params.tutor = { ...params.tutor, tutorMode: 'boost' };

    const { result } = renderHook(() => useChatOrchestration(params));

    act(() => {
      result.current.handleAnswerWithBoost(58); // wrong answer
    });

    expect(mockHandleAnswer).toHaveBeenCalledWith(58);
  });

  it('handleAnswerWithBoost calls incrementWrongAnswerCount and getBugDescription on wrong answer', () => {
    mockGetBugDescription.mockReturnValue('Forgot to carry');

    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams()),
    );

    act(() => {
      result.current.handleAnswerWithBoost(58);
    });

    expect(mockIncrementWrongAnswerCount).toHaveBeenCalled();
    expect(mockGetBugDescription).toHaveBeenCalledWith('add_no_carry');
    expect(mockSetLastWrongContext).toHaveBeenCalledWith({
      wrongAnswer: 58,
      bugDescription: 'Forgot to carry',
    });
  });

  it('showHelp is true during practice, chat closed, not minimized, not complete', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams()),
    );
    expect(result.current.showHelp).toBe(true);
  });

  it('showHelp is false during warmup phase', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams({ sessionPhase: 'warmup' })),
    );
    expect(result.current.showHelp).toBe(false);
  });

  it('showHelp is false when session is complete', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams({ isComplete: true })),
    );
    expect(result.current.showHelp).toBe(false);
  });

  it('per-problem reset: chat state resets when currentIndex changes', () => {
    const params = createDefaultParams();
    const { result, rerender } = renderHook(() =>
      useChatOrchestration(params),
    );

    // Open chat
    act(() => {
      result.current.handleHelpTap();
    });
    expect(result.current.chatOpen).toBe(true);

    // Change currentIndex to trigger reset
    params.currentIndex = 1;
    rerender(() => useChatOrchestration(params));

    expect(result.current.chatOpen).toBe(false);
    expect(result.current.chatMinimized).toBe(false);
    expect(result.current.shouldPulse).toBe(false);
    expect(mockResetForProblem).toHaveBeenCalled();
    expect(mockSetLastWrongContext).toHaveBeenCalledWith(null);
  });

  it('TEACH minimize: when shouldExpandManipulative + chatOpen, chat minimizes', () => {
    const params = createDefaultParams();
    params.tutor = { ...params.tutor, shouldExpandManipulative: true };

    const { result } = renderHook(() => useChatOrchestration(params));

    // Open chat
    act(() => {
      result.current.handleHelpTap();
    });

    // TEACH minimize effect should fire
    expect(result.current.chatMinimized).toBe(true);
    expect(result.current.chatOpen).toBe(false);
  });

  it('showCorrectAnswer becomes true 500ms after incorrect feedback', () => {
    jest.useFakeTimers();

    const params = createDefaultParams({
      feedbackState: { visible: true, correct: false },
    });

    const { result } = renderHook(() => useChatOrchestration(params));

    expect(result.current.showCorrectAnswer).toBe(false);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.showCorrectAnswer).toBe(true);

    jest.useRealTimers();
  });

  it('pulse: shouldPulse becomes true after wrong feedback when help not used', () => {
    const params = createDefaultParams();
    const { result, rerender } = renderHook(
      (p: ChatOrchestrationParams) => useChatOrchestration(p),
      { initialProps: params },
    );

    expect(result.current.shouldPulse).toBe(false);

    // Simulate wrong feedback arriving
    const updatedParams = {
      ...params,
      feedbackState: { visible: true, correct: false } as const,
    };
    rerender(updatedParams);

    expect(result.current.shouldPulse).toBe(true);
  });

  it('boostHighlightAnswer returns correctAnswer when boost mode active', () => {
    const params = createDefaultParams();
    params.tutor = { ...params.tutor, tutorMode: 'boost' };

    const { result } = renderHook(() => useChatOrchestration(params));
    expect(result.current.boostHighlightAnswer).toBe(68);
  });

  it('boostHighlightAnswer returns null when not in boost mode', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams()),
    );
    expect(result.current.boostHighlightAnswer).toBeNull();
  });

  it('handleResponse("retry") does not call requestTutor when offline', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams({ isOnline: false })),
    );

    act(() => {
      result.current.handleResponse('retry');
    });

    expect(mockRequestTutor).not.toHaveBeenCalled();
  });

  it('handleResponse("retry") calls requestTutor when online', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams()),
    );

    act(() => {
      result.current.handleResponse('retry');
    });

    expect(mockRequestTutor).toHaveBeenCalled();
  });

  it('bannerMessage returns latest tutor message text', () => {
    const params = createDefaultParams();
    params.tutor = {
      ...params.tutor,
      messages: [
        { id: '1', role: 'tutor', text: 'First hint', timestamp: 1 },
        { id: '2', role: 'child', text: 'Tell me more', timestamp: 2 },
        { id: '3', role: 'tutor', text: 'Second hint', timestamp: 3 },
      ],
    };

    const { result } = renderHook(() => useChatOrchestration(params));
    expect(result.current.bannerMessage).toBe('Second hint');
  });

  it('bannerMessage returns empty string when no tutor messages', () => {
    const { result } = renderHook(() =>
      useChatOrchestration(createDefaultParams()),
    );
    expect(result.current.bannerMessage).toBe('');
  });
});
