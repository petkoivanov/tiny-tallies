import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { callGemini } from '@/services/tutor/geminiClient';
import {
  buildSystemInstruction,
  buildHintPrompt,
} from '@/services/tutor/promptTemplates';
import { checkRateLimit, getRateLimitMessage } from '@/services/tutor/rateLimiter';
import type { AgeBracket, TutorMessage } from '@/services/tutor/types';
import type { SessionProblem } from '@/services/session/sessionTypes';

/**
 * Derives the age bracket from child age for prompt templates.
 * Maps: 6 -> '6-7', 7 -> '6-7', 8 -> '7-8', 9 -> '8-9'
 */
function deriveAgeBracket(childAge: number | null): AgeBracket {
  if (childAge === null || childAge <= 7) return '6-7';
  if (childAge === 8) return '7-8';
  return '8-9';
}

export interface UseTutorReturn {
  messages: TutorMessage[];
  loading: boolean;
  error: string | null;
  tutorMode: string;
  hintLevel: number;
  requestHint: () => Promise<void>;
  resetForProblem: () => void;
}

/**
 * Composes Gemini client, prompt templates, rate limiter, and tutorSlice
 * into a single React hook for the Chat UI to consume.
 *
 * Accepts the current problem as a parameter (from useSession).
 * Reads childAge from the store (READ ONLY -- never writes session/skill state).
 * Implements AbortController lifecycle with defense-in-depth cleanup on unmount.
 */
export function useTutor(
  currentProblem: SessionProblem | null,
): UseTutorReturn {
  // AbortController ref for in-flight request tracking
  const abortRef = useRef<AbortController | null>(null);

  // Read from tutorSlice
  const messages = useAppStore((s) => s.tutorMessages);
  const loading = useAppStore((s) => s.tutorLoading);
  const error = useAppStore((s) => s.tutorError);
  const tutorMode = useAppStore((s) => s.tutorMode);
  const hintLevel = useAppStore((s) => s.hintLevel);
  const problemCallCount = useAppStore((s) => s.problemCallCount);
  const sessionCallCount = useAppStore((s) => s.sessionCallCount);
  const dailyCallCount = useAppStore((s) => s.dailyCallCount);

  // Read from childProfileSlice (READ ONLY)
  const childAge = useAppStore((s) => s.childAge);

  // Get tutor actions
  const addTutorMessage = useAppStore((s) => s.addTutorMessage);
  const setTutorLoading = useAppStore((s) => s.setTutorLoading);
  const setTutorError = useAppStore((s) => s.setTutorError);
  const incrementCallCount = useAppStore((s) => s.incrementCallCount);
  const resetProblemTutor = useAppStore((s) => s.resetProblemTutor);
  const incrementHintLevel = useAppStore((s) => s.incrementHintLevel);

  // Derive age bracket for prompts
  const ageBracket = deriveAgeBracket(childAge);

  // Defense-in-depth: abort on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const requestHint = useCallback(async () => {
    // Guard: prevent double-tap
    if (useAppStore.getState().tutorLoading) return;

    // Guard: no problem context
    if (!currentProblem) {
      setTutorError('No problem available for hints.');
      return;
    }

    // Check rate limits
    const rateState = {
      problemCallCount: useAppStore.getState().problemCallCount,
      sessionCallCount: useAppStore.getState().sessionCallCount,
      dailyCallCount: useAppStore.getState().dailyCallCount,
    };
    const limitKind = checkRateLimit(rateState);
    if (limitKind !== null) {
      const limitMessage = getRateLimitMessage(limitKind);
      addTutorMessage({
        id: `tutor-limit-${Date.now()}`,
        role: 'tutor',
        text: limitMessage,
        timestamp: Date.now(),
      });
      return;
    }

    // Abort previous request if any
    abortRef.current?.abort();

    // Create new AbortController
    const controller = new AbortController();
    abortRef.current = controller;

    // Set loading, clear error
    setTutorLoading(true);
    setTutorError(null);

    // Build prompts
    const promptParams = {
      ageBracket,
      cpaStage: 'concrete' as const, // Default; will be enhanced when CPA hook is wired
      problemText: currentProblem.problem.questionText,
      operation: currentProblem.problem.operation,
      tutorMode: useAppStore.getState().tutorMode,
      hintLevel: useAppStore.getState().hintLevel,
    };

    const systemInstruction = buildSystemInstruction(promptParams);
    const hintPrompt = buildHintPrompt(promptParams);

    try {
      const responseText = await callGemini({
        systemInstruction,
        userMessage: hintPrompt,
        abortSignal: controller.signal,
      });

      // Only update state if not aborted
      if (!controller.signal.aborted) {
        addTutorMessage({
          id: `tutor-${Date.now()}`,
          role: 'tutor',
          text: responseText,
          timestamp: Date.now(),
        });
        incrementCallCount();
        incrementHintLevel();
      }
    } catch (err) {
      // Silently ignore abort errors
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes('abort')
      ) {
        return;
      }

      // Set user-friendly error for non-abort failures
      if (!controller.signal.aborted) {
        setTutorError('Something went wrong. Please try again.');
      }
    } finally {
      // Only clear loading if not aborted/unmounted
      if (!controller.signal.aborted) {
        setTutorLoading(false);
      }
    }
  }, [
    currentProblem,
    ageBracket,
    addTutorMessage,
    setTutorLoading,
    setTutorError,
    incrementCallCount,
    incrementHintLevel,
  ]);

  const resetForProblem = useCallback(() => {
    abortRef.current?.abort();
    resetProblemTutor();
  }, [resetProblemTutor]);

  return {
    messages,
    loading,
    error,
    tutorMode,
    hintLevel,
    requestHint,
    resetForProblem,
  };
}
