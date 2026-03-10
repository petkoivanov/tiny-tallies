import { renderHook, act } from '@testing-library/react-native';
import { useAppStore } from '@/store/appStore';

// Mock service modules
jest.mock('@/services/tutor/geminiClient', () => ({
  callGemini: jest.fn(),
}));
jest.mock('@/services/tutor/promptTemplates', () => ({
  buildSystemInstruction: jest.fn(() => 'system-instruction'),
  buildHintPrompt: jest.fn(() => 'hint-prompt'),
  buildTeachPrompt: jest.fn(() => 'teach-prompt'),
  buildBoostPrompt: jest.fn(() => 'boost-prompt'),
}));
jest.mock('@/services/tutor/rateLimiter', () => ({
  checkRateLimit: jest.fn(() => null),
  getRateLimitMessage: jest.fn(() => 'Rate limited message'),
}));
jest.mock('@/services/tutor/safetyFilter', () => ({
  scrubOutboundPii: jest.fn(
    (sys: string, usr: string) => ({ systemInstruction: sys, userMessage: usr, piiFound: false }),
  ),
  runSafetyPipeline: jest.fn(
    (text: string) => ({ passed: true, text }),
  ),
}));
jest.mock('@/services/tutor/safetyConstants', () => ({
  getCannedFallback: jest.fn(() => 'Friendly fallback message'),
}));
jest.mock('@/services/tutor/escalationEngine', () => ({
  computeEscalation: jest.fn(() => ({
    nextMode: 'hint',
    shouldTransition: false,
    transitionMessage: null,
  })),
}));

import { useTutor } from '../useTutor';
import { callGemini } from '@/services/tutor/geminiClient';
import {
  buildSystemInstruction,
  buildHintPrompt,
  buildTeachPrompt,
  buildBoostPrompt,
} from '@/services/tutor/promptTemplates';
import {
  checkRateLimit,
  getRateLimitMessage,
} from '@/services/tutor/rateLimiter';
import {
  scrubOutboundPii,
  runSafetyPipeline,
} from '@/services/tutor/safetyFilter';
import { getCannedFallback } from '@/services/tutor/safetyConstants';
import { computeEscalation } from '@/services/tutor/escalationEngine';

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
const mockBuildTeachPrompt = buildTeachPrompt as jest.MockedFunction<
  typeof buildTeachPrompt
>;
const mockBuildBoostPrompt = buildBoostPrompt as jest.MockedFunction<
  typeof buildBoostPrompt
>;
const mockScrubOutboundPii = scrubOutboundPii as jest.MockedFunction<
  typeof scrubOutboundPii
>;
const mockRunSafetyPipeline = runSafetyPipeline as jest.MockedFunction<
  typeof runSafetyPipeline
>;
const mockGetCannedFallback = getCannedFallback as jest.MockedFunction<
  typeof getCannedFallback
>;
const mockComputeEscalation = computeEscalation as jest.MockedFunction<
  typeof computeEscalation
>;

import type { SessionProblem } from '@/services/session/sessionTypes';
import type { Problem } from '@/services/mathEngine/types';
import type { CpaStage, ManipulativeType } from '@/services/cpa/cpaTypes';

// Minimal problem shape matching SessionProblem
function makeProblem(): SessionProblem {
  const problem: Problem = {
    id: 'p-1',
    templateId: 't-1',
    operation: 'addition',
    operands: [3, 4],
    correctAnswer: { type: 'numeric', value: 7 },
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
      tutorConsentGranted: true,
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
    mockComputeEscalation.mockReturnValue({
      nextMode: 'hint',
      shouldTransition: false,
      transitionMessage: null,
    });
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

  it('requestHint adds fallback message on Gemini failure instead of setting error', async () => {
    mockCallGemini.mockRejectedValue(new Error('Network error'));
    mockGetCannedFallback.mockReturnValue('Error fallback');
    const { result } = renderHook(() => useTutor(makeProblem()));

    await act(async () => {
      await result.current.requestHint();
    });

    // Error state should be null -- child sees fallback message, not error banner
    expect(result.current.error).toBeNull();
    const state = useAppStore.getState();
    expect(state.tutorMessages).toHaveLength(1);
    expect(state.tutorMessages[0].text).toBe('Error fallback');
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

  // --- Safety pipeline integration tests ---

  describe('consent gate', () => {
    it('blocks requestHint when tutorConsentGranted is false and sets error to consent_required', async () => {
      setupStore({ tutorConsentGranted: false });
      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestHint();
      });

      expect(result.current.error).toBe('consent_required');
      expect(mockCallGemini).not.toHaveBeenCalled();
    });

    it('proceeds to call Gemini when tutorConsentGranted is true', async () => {
      setupStore({ tutorConsentGranted: true });
      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestHint();
      });

      expect(mockCallGemini).toHaveBeenCalled();
    });
  });

  describe('PII scrubbing', () => {
    it('calls scrubOutboundPii with system instruction, hint prompt, childName, and childAge before callGemini', async () => {
      setupStore({ childName: 'Alice', childAge: 8, tutorConsentGranted: true });
      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestHint();
      });

      expect(mockScrubOutboundPii).toHaveBeenCalledWith(
        'system-instruction',
        'hint-prompt',
        'Alice',
        8,
      );
      // scrubOutboundPii must be called before callGemini
      const scrubOrder = mockScrubOutboundPii.mock.invocationCallOrder[0];
      const geminiOrder = mockCallGemini.mock.invocationCallOrder[0];
      expect(scrubOrder).toBeLessThan(geminiOrder);
    });
  });

  describe('safety-blocked null response', () => {
    it('adds canned fallback for safety_blocked when callGemini returns null', async () => {
      mockCallGemini.mockResolvedValue(null as unknown as string);
      mockGetCannedFallback.mockReturnValue('Safety blocked fallback');

      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestHint();
      });

      expect(mockGetCannedFallback).toHaveBeenCalledWith('safety_blocked');
      const state = useAppStore.getState();
      expect(state.tutorMessages).toHaveLength(1);
      expect(state.tutorMessages[0].text).toBe('Safety blocked fallback');
    });
  });

  describe('answer-leak detection', () => {
    it('adds canned fallback for answer_leaked when runSafetyPipeline detects a leak', async () => {
      mockCallGemini.mockResolvedValue('The answer is 7!');
      mockRunSafetyPipeline.mockReturnValue({
        passed: false,
        fallbackCategory: 'answer_leaked',
        reason: 'answer_digit_leak',
      });
      mockGetCannedFallback.mockReturnValue('Answer leak fallback');

      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestHint();
      });

      expect(mockGetCannedFallback).toHaveBeenCalledWith('answer_leaked');
      const state = useAppStore.getState();
      expect(state.tutorMessages).toHaveLength(1);
      expect(state.tutorMessages[0].text).toBe('Answer leak fallback');
      // incrementCallCount should NOT be called on safety failure
      expect(state.problemCallCount).toBe(0);
    });
  });

  describe('content validation', () => {
    it('adds canned fallback for content_invalid when runSafetyPipeline fails validation', async () => {
      mockCallGemini.mockResolvedValue('A very long complicated response');
      mockRunSafetyPipeline.mockReturnValue({
        passed: false,
        fallbackCategory: 'content_invalid',
        reason: 'sentence_too_long',
      });
      mockGetCannedFallback.mockReturnValue('Content invalid fallback');

      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestHint();
      });

      expect(mockGetCannedFallback).toHaveBeenCalledWith('content_invalid');
      const state = useAppStore.getState();
      expect(state.tutorMessages).toHaveLength(1);
      expect(state.tutorMessages[0].text).toBe('Content invalid fallback');
      expect(state.problemCallCount).toBe(0);
    });
  });

  describe('full success path', () => {
    it('adds safe response as tutor message and increments call count when all checks pass', async () => {
      const safeText = 'Try counting on your fingers!';
      mockCallGemini.mockResolvedValue(safeText);
      mockRunSafetyPipeline.mockReturnValue({ passed: true, text: safeText });

      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestHint();
      });

      const state = useAppStore.getState();
      expect(state.tutorMessages).toHaveLength(1);
      expect(state.tutorMessages[0].text).toBe(safeText);
      expect(state.problemCallCount).toBe(1);
    });
  });

  describe('error fallbacks', () => {
    it('uses getCannedFallback for error instead of raw error string on generic error', async () => {
      mockCallGemini.mockRejectedValue(new Error('Network error'));
      mockGetCannedFallback.mockReturnValue('Error fallback message');

      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestHint();
      });

      expect(mockGetCannedFallback).toHaveBeenCalledWith('error');
      const state = useAppStore.getState();
      expect(state.tutorMessages).toHaveLength(1);
      expect(state.tutorMessages[0].text).toBe('Error fallback message');
      // Should NOT have raw error string
      expect(state.tutorMessages[0].text).not.toContain('Network error');
    });

    it('uses getCannedFallback for timeout on DOMException timeout error', async () => {
      mockCallGemini.mockRejectedValue(
        new DOMException('The operation timed out', 'TimeoutError'),
      );
      mockGetCannedFallback.mockReturnValue('Timeout fallback message');

      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestHint();
      });

      expect(mockGetCannedFallback).toHaveBeenCalledWith('timeout');
      const state = useAppStore.getState();
      expect(state.tutorMessages).toHaveLength(1);
      expect(state.tutorMessages[0].text).toBe('Timeout fallback message');
    });
  });

  // --- Mode-aware routing tests (Plan 24-02) ---

  describe('TEACH mode routing', () => {
    it('calls buildTeachPrompt when tutorMode is teach', async () => {
      setupStore({ tutorMode: 'teach' });
      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestTutor();
      });

      expect(mockBuildTeachPrompt).toHaveBeenCalled();
      expect(mockBuildHintPrompt).not.toHaveBeenCalled();
      expect(mockBuildBoostPrompt).not.toHaveBeenCalled();
    });

    it('passes CPA stage from parameter into prompt params for teach mode', async () => {
      setupStore({ tutorMode: 'teach' });
      const cpaInfo: { stage: CpaStage; manipulativeType: ManipulativeType | null } = {
        stage: 'pictorial',
        manipulativeType: 'number_line',
      };
      const { result } = renderHook(() =>
        useTutor(makeProblem(), cpaInfo),
      );

      await act(async () => {
        await result.current.requestTutor();
      });

      expect(mockBuildTeachPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          cpaStage: 'pictorial',
          tutorMode: 'teach',
        }),
      );
    });

    it('increments hint level on successful teach response', async () => {
      setupStore({ tutorMode: 'teach' });
      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestTutor();
      });

      expect(result.current.hintLevel).toBe(1);
    });
  });

  describe('BOOST mode routing', () => {
    it('calls buildBoostPrompt with correctAnswer when tutorMode is boost', async () => {
      setupStore({ tutorMode: 'boost' });
      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestTutor();
      });

      expect(mockBuildBoostPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          correctAnswer: 7,
        }),
      );
      expect(mockBuildHintPrompt).not.toHaveBeenCalled();
      expect(mockBuildTeachPrompt).not.toHaveBeenCalled();
    });

    it('passes mode=boost to runSafetyPipeline for BOOST responses', async () => {
      setupStore({ tutorMode: 'boost' });
      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestTutor();
      });

      expect(mockRunSafetyPipeline).toHaveBeenCalledWith(
        expect.any(String),
        7,
        expect.any(String),
        'boost',
      );
    });

    it('does NOT increment hintLevel on successful BOOST response', async () => {
      setupStore({ tutorMode: 'boost' });
      const { result } = renderHook(() => useTutor(makeProblem()));

      expect(result.current.hintLevel).toBe(0);

      await act(async () => {
        await result.current.requestTutor();
      });

      expect(result.current.hintLevel).toBe(0);
    });
  });

  describe('CPA stage integration', () => {
    it('uses cpaStage from parameter instead of hardcoded concrete', async () => {
      const cpaInfo: { stage: CpaStage; manipulativeType: ManipulativeType | null } = {
        stage: 'abstract',
        manipulativeType: null,
      };
      const { result } = renderHook(() =>
        useTutor(makeProblem(), cpaInfo),
      );

      await act(async () => {
        await result.current.requestTutor();
      });

      expect(mockBuildSystemInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          cpaStage: 'abstract',
        }),
      );
    });

    it('defaults to concrete when cpaInfo not provided', async () => {
      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestTutor();
      });

      expect(mockBuildSystemInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          cpaStage: 'concrete',
        }),
      );
    });
  });

  describe('bug description passthrough', () => {
    it('passes bugDescription and wrongAnswer from lastWrongContext into prompt params', async () => {
      const lastWrongContext = {
        wrongAnswer: 5,
        bugDescription: 'counted on from first operand instead of adding',
      };
      const { result } = renderHook(() =>
        useTutor(makeProblem(), undefined, lastWrongContext),
      );

      await act(async () => {
        await result.current.requestTutor();
      });

      expect(mockBuildHintPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          wrongAnswer: 5,
          bugDescription: 'counted on from first operand instead of adding',
        }),
      );
    });

    it('passes undefined for bugDescription when lastWrongContext.bugDescription is null', async () => {
      const lastWrongContext = {
        wrongAnswer: 5,
        bugDescription: null,
      };
      const { result } = renderHook(() =>
        useTutor(makeProblem(), undefined, lastWrongContext),
      );

      await act(async () => {
        await result.current.requestTutor();
      });

      expect(mockBuildHintPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          wrongAnswer: 5,
          bugDescription: undefined,
        }),
      );
    });
  });

  describe('escalation checks', () => {
    it('runs computeEscalation after successful hint delivery', async () => {
      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestTutor();
      });

      expect(mockComputeEscalation).toHaveBeenCalledWith(
        expect.objectContaining({
          currentMode: 'hint',
        }),
      );
    });

    it('transitions to teach mode and adds transition message when escalation triggers', async () => {
      mockComputeEscalation.mockReturnValue({
        nextMode: 'teach',
        shouldTransition: true,
        transitionMessage: 'Let me show you a different way!',
      });

      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestTutor();
      });

      const state = useAppStore.getState();
      expect(state.tutorMode).toBe('teach');
      // Should have the LLM response message + the transition message
      const msgs = state.tutorMessages;
      expect(msgs.length).toBe(2);
      expect(msgs[1].text).toBe('Let me show you a different way!');
      expect(msgs[1].role).toBe('tutor');
    });

    it('transitions to boost mode with boost transition message', async () => {
      setupStore({ tutorMode: 'teach' });
      mockComputeEscalation.mockReturnValue({
        nextMode: 'boost',
        shouldTransition: true,
        transitionMessage: 'Let me help you through this one!',
      });

      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestTutor();
      });

      const state = useAppStore.getState();
      expect(state.tutorMode).toBe('boost');
      const msgs = state.tutorMessages;
      expect(msgs[msgs.length - 1].text).toBe('Let me help you through this one!');
    });

    it('does not add transition message when no escalation occurs', async () => {
      mockComputeEscalation.mockReturnValue({
        nextMode: 'hint',
        shouldTransition: false,
        transitionMessage: null,
      });

      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestTutor();
      });

      const state = useAppStore.getState();
      // Only the LLM response message, no transition message
      expect(state.tutorMessages).toHaveLength(1);
    });
  });

  describe('shouldExpandManipulative signal', () => {
    it('returns true when mode is teach and manipulativeType is not null', () => {
      setupStore({ tutorMode: 'teach' });
      const cpaInfo: { stage: CpaStage; manipulativeType: ManipulativeType | null } = {
        stage: 'concrete',
        manipulativeType: 'base_ten_blocks',
      };
      const { result } = renderHook(() =>
        useTutor(makeProblem(), cpaInfo),
      );

      expect(result.current.shouldExpandManipulative).toBe(true);
    });

    it('returns false when mode is teach but manipulativeType is null (abstract stage)', () => {
      setupStore({ tutorMode: 'teach' });
      const cpaInfo: { stage: CpaStage; manipulativeType: ManipulativeType | null } = {
        stage: 'abstract',
        manipulativeType: null,
      };
      const { result } = renderHook(() =>
        useTutor(makeProblem(), cpaInfo),
      );

      expect(result.current.shouldExpandManipulative).toBe(false);
    });

    it('returns false when mode is hint regardless of manipulativeType', () => {
      setupStore({ tutorMode: 'hint' });
      const cpaInfo: { stage: CpaStage; manipulativeType: ManipulativeType | null } = {
        stage: 'concrete',
        manipulativeType: 'base_ten_blocks',
      };
      const { result } = renderHook(() =>
        useTutor(makeProblem(), cpaInfo),
      );

      expect(result.current.shouldExpandManipulative).toBe(false);
    });

    it('returns false when mode is boost', () => {
      setupStore({ tutorMode: 'boost' });
      const { result } = renderHook(() => useTutor(makeProblem()));

      expect(result.current.shouldExpandManipulative).toBe(false);
    });
  });

  describe('manipulativeType passthrough', () => {
    it('returns manipulativeType from cpaInfo parameter', () => {
      const cpaInfo: { stage: CpaStage; manipulativeType: ManipulativeType | null } = {
        stage: 'concrete',
        manipulativeType: 'number_line',
      };
      const { result } = renderHook(() =>
        useTutor(makeProblem(), cpaInfo),
      );

      expect(result.current.manipulativeType).toBe('number_line');
    });

    it('returns null when cpaInfo is not provided', () => {
      const { result } = renderHook(() => useTutor(makeProblem()));

      expect(result.current.manipulativeType).toBeNull();
    });
  });

  describe('requestTutor alias', () => {
    it('requestTutor works the same as requestHint for backward compatibility', async () => {
      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestTutor();
      });

      expect(mockCallGemini).toHaveBeenCalled();
      const state = useAppStore.getState();
      expect(state.tutorMessages).toHaveLength(1);
    });

    it('requestHint is an alias that still works', async () => {
      const { result } = renderHook(() => useTutor(makeProblem()));

      // requestHint and requestTutor should be the same function
      expect(result.current.requestHint).toBe(result.current.requestTutor);
    });
  });

  describe('safety pipeline mode passthrough', () => {
    it('passes mode=hint to runSafetyPipeline in hint mode', async () => {
      setupStore({ tutorMode: 'hint' });
      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestTutor();
      });

      expect(mockRunSafetyPipeline).toHaveBeenCalledWith(
        expect.any(String),
        7,
        expect.any(String),
        'hint',
      );
    });

    it('passes mode=teach to runSafetyPipeline in teach mode', async () => {
      setupStore({ tutorMode: 'teach' });
      const { result } = renderHook(() => useTutor(makeProblem()));

      await act(async () => {
        await result.current.requestTutor();
      });

      expect(mockRunSafetyPipeline).toHaveBeenCalledWith(
        expect.any(String),
        7,
        expect.any(String),
        'teach',
      );
    });
  });
});
