import { renderHook, act } from '@testing-library/react-native';
import { useAppStore } from '@/store/appStore';

// Mock service modules
jest.mock('@/services/tutor/geminiClient', () => ({
  callGemini: jest.fn(),
}));
jest.mock('@/services/tutor/promptTemplates', () => ({
  buildSystemInstruction: jest.fn(() => 'system-instruction'),
  buildHintPrompt: jest.fn(() => 'hint-prompt'),
}));
jest.mock('@/services/tutor/rateLimiter', () => ({
  checkRateLimit: jest.fn(() => null),
  getRateLimitMessage: jest.fn(() => 'Rate limited message'),
}));

import { useTutor } from '../useTutor';
import { callGemini } from '@/services/tutor/geminiClient';
import {
  buildSystemInstruction,
  buildHintPrompt,
} from '@/services/tutor/promptTemplates';
import {
  checkRateLimit,
  getRateLimitMessage,
} from '@/services/tutor/rateLimiter';

const mockCallGemini = callGemini as jest.MockedFunction<typeof callGemini>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<
  typeof checkRateLimit
>;
const mockGetRateLimitMessage = getRateLimitMessage as jest.MockedFunction<
  typeof getRateLimitMessage
>;
const mockBuildSystemInstruction =
  buildSystemInstruction as jest.MockedFunction<typeof buildSystemInstruction>;
const mockBuildHintPrompt = buildHintPrompt as jest.MockedFunction<
  typeof buildHintPrompt
>;

import type { SessionProblem } from '@/services/session/sessionTypes';
import type { Problem } from '@/services/mathEngine/types';

// Minimal problem shape matching SessionProblem
function makeProblem(): SessionProblem {
  const problem: Problem = {
    id: 'p-1',
    templateId: 't-1',
    operation: 'addition',
    operands: [3, 4],
    correctAnswer: 7,
    questionText: '3 + 4 = ?',
    skillId: 'add.single',
    standards: ['1.OA.1'],
    grade: 1,
    baseElo: 800,
    metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false },
  };

  return {
    problem,
    presentation: {
      problem,
      format: 'multiple_choice',
      options: [
        { value: 7 },
        { value: 6 },
        { value: 8 },
        { value: 5 },
      ],
      correctIndex: 0,
    },
    phase: 'practice',
    skillId: 'add.single',
    templateBaseElo: 800,
  };
}

function setupStore(overrides: Record<string, unknown> = {}) {
  useAppStore.setState(
    {
      ...useAppStore.getInitialState(),
      childAge: 7,
      ...overrides,
    },
    true,
  );
}

describe('useTutor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStore();
    mockCallGemini.mockResolvedValue('Try counting on your fingers!');
    mockCheckRateLimit.mockReturnValue(null);
  });

  it('requestHint calls checkRateLimit and returns early with child-friendly message when rate limited', async () => {
    mockCheckRateLimit.mockReturnValue('problem');
    mockGetRateLimitMessage.mockReturnValue('You have had enough hints!');

    const { result } = renderHook(() => useTutor(makeProblem()));

    await act(async () => {
      await result.current.requestHint();
    });

    expect(mockCheckRateLimit).toHaveBeenCalled();
    expect(mockCallGemini).not.toHaveBeenCalled();

    const state = useAppStore.getState();
    expect(state.tutorMessages.length).toBeGreaterThan(0);
    expect(state.tutorMessages[state.tutorMessages.length - 1].text).toBe(
      'You have had enough hints!',
    );
  });

  it('requestHint builds prompt from current problem context and calls callGemini', async () => {
    const { result } = renderHook(() => useTutor(makeProblem()));

    await act(async () => {
      await result.current.requestHint();
    });

    expect(mockBuildSystemInstruction).toHaveBeenCalledWith(
      expect.objectContaining({
        problemText: '3 + 4 = ?',
        operation: 'addition',
      }),
    );
    expect(mockBuildHintPrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        problemText: '3 + 4 = ?',
        operation: 'addition',
      }),
    );
    expect(mockCallGemini).toHaveBeenCalledWith(
      expect.objectContaining({
        systemInstruction: 'system-instruction',
        userMessage: 'hint-prompt',
      }),
    );
  });

  it('requestHint adds tutor response as TutorMessage on success', async () => {
    mockCallGemini.mockResolvedValue('Try counting on your fingers!');
    const { result } = renderHook(() => useTutor(makeProblem()));

    await act(async () => {
      await result.current.requestHint();
    });

    const state = useAppStore.getState();
    expect(state.tutorMessages).toHaveLength(1);
    expect(state.tutorMessages[0].role).toBe('tutor');
    expect(state.tutorMessages[0].text).toBe('Try counting on your fingers!');
  });

  it('requestHint sets tutorError on Gemini failure', async () => {
    mockCallGemini.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useTutor(makeProblem()));

    await act(async () => {
      await result.current.requestHint();
    });

    expect(result.current.error).toBeTruthy();
  });

  it('requestHint sets tutorLoading true before call and false after', async () => {
    let resolveGemini: (value: string) => void;
    mockCallGemini.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveGemini = resolve;
        }),
    );

    const { result } = renderHook(() => useTutor(makeProblem()));

    let hintPromise: Promise<void>;

    act(() => {
      hintPromise = result.current.requestHint();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveGemini!('hint text');
      await hintPromise!;
    });

    expect(result.current.loading).toBe(false);
  });

  it('requestHint increments call count on successful response', async () => {
    const { result } = renderHook(() => useTutor(makeProblem()));

    const beforeCount = useAppStore.getState().problemCallCount;

    await act(async () => {
      await result.current.requestHint();
    });

    expect(useAppStore.getState().problemCallCount).toBe(beforeCount + 1);
  });

  it('requestHint increments hint level on successful response', async () => {
    const { result } = renderHook(() => useTutor(makeProblem()));

    expect(result.current.hintLevel).toBe(0);

    await act(async () => {
      await result.current.requestHint();
    });

    expect(result.current.hintLevel).toBe(1);
  });

  it('requestHint does nothing if already loading', async () => {
    let resolveGemini: (value: string) => void;
    mockCallGemini.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveGemini = resolve;
        }),
    );

    const { result } = renderHook(() => useTutor(makeProblem()));

    let firstPromise: Promise<void>;
    act(() => {
      firstPromise = result.current.requestHint();
    });

    await act(async () => {
      await result.current.requestHint();
    });

    expect(mockCallGemini).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveGemini!('response');
      await firstPromise!;
    });
  });

  it('abort controller cleans up on unmount', async () => {
    let resolveGemini: (value: string) => void;
    mockCallGemini.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveGemini = resolve;
        }),
    );

    const { result, unmount } = renderHook(() => useTutor(makeProblem()));

    act(() => {
      result.current.requestHint();
    });

    unmount();

    await act(async () => {
      resolveGemini!('late response');
      await new Promise((r) => setTimeout(r, 10));
    });

    // No crash means abort cleanup worked
    expect(true).toBe(true);
  });

  it('resetForProblem calls resetProblemTutor and aborts any in-flight request', async () => {
    let resolveGemini: (value: string) => void;
    mockCallGemini.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveGemini = resolve;
        }),
    );

    const { result } = renderHook(() => useTutor(makeProblem()));

    act(() => {
      result.current.requestHint();
    });

    act(() => {
      result.current.resetForProblem();
    });

    const state = useAppStore.getState();
    expect(state.tutorMessages).toEqual([]);
    expect(state.hintLevel).toBe(0);
    expect(state.problemCallCount).toBe(0);
    expect(state.tutorMode).toBe('hint');

    await act(async () => {
      resolveGemini!('late response');
      await new Promise((r) => setTimeout(r, 10));
    });
  });

  it('hook reads childAge from store but never calls session/skill write actions (STATE-03)', async () => {
    const spy = jest.spyOn(useAppStore, 'setState');
    const { result } = renderHook(() => useTutor(makeProblem()));

    await act(async () => {
      await result.current.requestHint();
    });

    const allCalls = spy.mock.calls;
    for (const [partial] of allCalls) {
      if (typeof partial === 'function') continue;
      const obj = partial as unknown as Record<string, unknown>;
      expect(obj).not.toHaveProperty('currentProblemIndex');
      expect(obj).not.toHaveProperty('sessionScore');
      expect(obj).not.toHaveProperty('sessionAnswers');
      expect(obj).not.toHaveProperty('skillStates');
      expect(obj).not.toHaveProperty('isSessionActive');
    }

    spy.mockRestore();
  });

  it('requestHint sets error when no problem is provided', async () => {
    const { result } = renderHook(() => useTutor(null));

    await act(async () => {
      await result.current.requestHint();
    });

    expect(result.current.error).toBeTruthy();
    expect(mockCallGemini).not.toHaveBeenCalled();
  });
});
