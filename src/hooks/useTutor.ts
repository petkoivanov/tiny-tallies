import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { callGemini } from '@/services/tutor/geminiClient';
import {
  buildSystemInstruction,
  buildHintPrompt,
  buildTeachPrompt,
  buildBoostPrompt,
} from '@/services/tutor/promptTemplates';
import { checkRateLimit, getRateLimitMessage } from '@/services/tutor/rateLimiter';
import {
  scrubOutboundPii,
  runSafetyPipeline,
  parseHintLadder,
  validateHintLadder,
} from '@/services/tutor/safetyFilter';
import { getCannedFallback } from '@/services/tutor/safetyConstants';
import { computeEscalation } from '@/services/tutor/escalationEngine';
import { getBugDescription } from '@/services/tutor/bugLookup';
import type {
  AgeBracket,
  ConfirmedMisconceptionContext,
  TutorMessage,
  TutorMode,
} from '@/services/tutor/types';
import { getMisconceptionsBySkill } from '@/store/slices/misconceptionSlice';
import type { SessionProblem } from '@/services/session/sessionTypes';
import type { CpaStage, ManipulativeType } from '@/services/cpa/cpaTypes';
import { answerNumericValue } from '@/services/mathEngine/types';

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
  tutorMode: TutorMode;
  hintLevel: number;
  hasMoreHints: boolean;
  /** True when the hint ladder has been loaded and all hints have been delivered */
  ladderExhausted: boolean;
  shouldExpandManipulative: boolean;
  manipulativeType: ManipulativeType | null;
  requestTutor: () => Promise<void>;
  requestHint: () => Promise<void>;
  resetForProblem: () => void;
}

/**
 * Multi-mode tutor orchestrator hook.
 *
 * Routes to the correct prompt builder (hint/teach/boost), runs escalation
 * checks after each delivery, and exposes ManipulativePanel coordination signals.
 *
 * Accepts the current problem as a parameter (from useSession).
 * Reads childAge from the store (READ ONLY -- never writes session/skill state).
 * Implements AbortController lifecycle with defense-in-depth cleanup on unmount.
 */
export function useTutor(
  currentProblem: SessionProblem | null,
  cpaInfo?: { stage: CpaStage; manipulativeType: ManipulativeType | null },
  lastWrongContext?: { wrongAnswer: number; bugDescription: string | null } | null,
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

  // Read from misconceptionSlice (READ ONLY)
  const misconceptions = useAppStore((s) => s.misconceptions);

  // Read from childProfileSlice (READ ONLY)
  const childAge = useAppStore((s) => s.childAge);
  const childName = useAppStore((s) => s.childName);
  const tutorConsentGranted = useAppStore((s) => s.tutorConsentGranted);

  // Get tutor actions
  const addTutorMessage = useAppStore((s) => s.addTutorMessage);
  const setTutorLoading = useAppStore((s) => s.setTutorLoading);
  const setTutorError = useAppStore((s) => s.setTutorError);
  const incrementCallCount = useAppStore((s) => s.incrementCallCount);
  const resetProblemTutor = useAppStore((s) => s.resetProblemTutor);
  const incrementHintLevel = useAppStore((s) => s.incrementHintLevel);
  const setTutorMode = useAppStore((s) => s.setTutorMode);
  const setHintLadder = useAppStore((s) => s.setHintLadder);
  const advanceHintLadder = useAppStore((s) => s.advanceHintLadder);

  // Derive age bracket for prompts
  const ageBracket = deriveAgeBracket(childAge);

  // Derive CPA values with backward-compatible defaults
  const cpaStage = cpaInfo?.stage ?? 'concrete';
  const manipulativeType = cpaInfo?.manipulativeType ?? null;

  // Compute shouldExpandManipulative: true only in teach mode with a manipulative
  const shouldExpandManipulative = tutorMode === 'teach' && manipulativeType !== null;

  // Read hint ladder for hasMoreHints derivation
  const hintLadder = useAppStore((s) => s.hintLadder);
  const hasMoreHints =
    tutorMode === 'hint' &&
    hintLadder !== null &&
    hintLadder.nextIndex < hintLadder.hints.length;

  const ladderExhausted =
    hintLadder !== null &&
    hintLadder.nextIndex >= hintLadder.hints.length;

  // Defense-in-depth: abort on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  /**
   * Delivers a hint from the pre-generated ladder and runs escalation.
   * Returns true if a hint was delivered, false if ladder is exhausted.
   */
  const deliverNextLadderHint = useCallback((): boolean => {
    const ladder = useAppStore.getState().hintLadder;
    if (!ladder || ladder.nextIndex >= ladder.hints.length) return false;

    const hint = ladder.hints[ladder.nextIndex];
    addTutorMessage({
      id: `tutor-${Date.now()}`,
      role: 'tutor',
      text: hint,
      timestamp: Date.now(),
    });
    advanceHintLadder();
    incrementHintLevel();

    // Run escalation check after delivery
    const escalation = computeEscalation({
      currentMode: useAppStore.getState().tutorMode,
      hintCount: useAppStore.getState().hintLevel,
      wrongAnswerCount: useAppStore.getState().wrongAnswerCount,
    });

    if (escalation.shouldTransition) {
      setTutorMode(escalation.nextMode);
      if (escalation.transitionMessage) {
        addTutorMessage({
          id: `tutor-transition-${Date.now()}`,
          role: 'tutor',
          text: escalation.transitionMessage,
          timestamp: Date.now(),
        });
      }
    }

    return true;
  }, [addTutorMessage, advanceHintLadder, incrementHintLevel, setTutorMode]);

  const requestTutor = useCallback(async () => {
    // Guard: consent required before AI tutor access
    if (!tutorConsentGranted) {
      setTutorError('consent_required');
      return;
    }

    // Guard: prevent double-tap
    if (useAppStore.getState().tutorLoading) return;

    // Guard: no problem context
    if (!currentProblem) {
      setTutorError('No problem available for hints.');
      return;
    }

    // Read current mode from store (may differ from subscribed value)
    const currentMode = useAppStore.getState().tutorMode;

    // HINT MODE with existing ladder: deliver next hint instantly (no API call)
    if (currentMode === 'hint') {
      const ladder = useAppStore.getState().hintLadder;
      if (ladder && ladder.nextIndex < ladder.hints.length) {
        deliverNextLadderHint();
        return;
      }
      // Ladder exists but exhausted: escalation already ran in deliverNextLadderHint.
      // If we're still in hint mode, fall through to API call for teach/boost.
      if (ladder && ladder.nextIndex >= ladder.hints.length) {
        // Force escalation to teach if not already triggered
        const escalation = computeEscalation({
          currentMode: useAppStore.getState().tutorMode,
          hintCount: useAppStore.getState().hintLevel,
          wrongAnswerCount: useAppStore.getState().wrongAnswerCount,
        });
        if (escalation.shouldTransition) {
          setTutorMode(escalation.nextMode);
          if (escalation.transitionMessage) {
            addTutorMessage({
              id: `tutor-transition-${Date.now()}`,
              role: 'tutor',
              text: escalation.transitionMessage,
              timestamp: Date.now(),
            });
          }
        }
        return;
      }
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

    // Assemble confirmed misconception context for this skill
    const skillId = currentProblem.problem.skillId;
    const skillMisconceptions = getMisconceptionsBySkill(misconceptions, skillId)
      .filter((r) => r.status === 'confirmed')
      .sort((a, b) => b.occurrenceCount - a.occurrenceCount)
      .slice(0, 3)
      .map((r): ConfirmedMisconceptionContext => ({
        bugTag: r.bugTag,
        description: getBugDescription(r.bugTag) ?? r.bugTag,
      }));

    // Build prompt params (shared across all modes)
    const promptParams = {
      ageBracket,
      cpaStage,
      problemText: currentProblem.problem.questionText,
      operation: currentProblem.problem.operation,
      tutorMode: currentMode,
      hintLevel: useAppStore.getState().hintLevel,
      wrongAnswer: lastWrongContext?.wrongAnswer,
      bugDescription: lastWrongContext?.bugDescription ?? undefined,
      ...(skillMisconceptions.length > 0 && {
        confirmedMisconceptions: skillMisconceptions,
      }),
    };

    // Select prompt builder based on tutorMode
    let userPrompt: string;
    switch (currentMode) {
      case 'teach':
        userPrompt = buildTeachPrompt(promptParams);
        break;
      case 'boost':
        userPrompt = buildBoostPrompt({
          ...promptParams,
          correctAnswer: answerNumericValue(currentProblem.problem.correctAnswer),
        });
        break;
      case 'hint':
      default:
        userPrompt = buildHintPrompt(promptParams);
        break;
    }

    const systemInstruction = buildSystemInstruction(promptParams);

    // Defense-in-depth: scrub PII from outbound prompts
    const scrubbed = scrubOutboundPii(
      systemInstruction,
      userPrompt,
      childName,
      childAge,
    );

    try {
      // HINT MODE: generate ladder with one retry on parse failure
      if (currentMode === 'hint') {
        const correctAnswer = answerNumericValue(currentProblem.problem.correctAnswer);

        for (let attempt = 0; attempt < 2; attempt++) {
          if (controller.signal.aborted) return;

          const responseText = await callGemini({
            systemInstruction: scrubbed.systemInstruction,
            userMessage: scrubbed.userMessage,
            abortSignal: controller.signal,
          });

          if (responseText === null) {
            if (!controller.signal.aborted) {
              addTutorMessage({
                id: `tutor-fallback-${Date.now()}`,
                role: 'tutor',
                text: getCannedFallback('safety_blocked'),
                timestamp: Date.now(),
              });
            }
            return;
          }

          const parsed = parseHintLadder(responseText);
          if (parsed && parsed.length >= 2) {
            const safeHints = validateHintLadder(parsed, correctAnswer, ageBracket);
            if (safeHints.length >= 1) {
              setHintLadder({ hints: safeHints, nextIndex: 1 });
              incrementCallCount();
              if (!controller.signal.aborted) {
                addTutorMessage({
                  id: `tutor-${Date.now()}`,
                  role: 'tutor',
                  text: safeHints[0],
                  timestamp: Date.now(),
                });
                incrementHintLevel();
              }
              return;
            }
            // Parsed OK but all hints failed safety validation
            console.warn(
              `[Tutor] attempt=${attempt + 1} parsed=${parsed.length} hints but safeHints=${safeHints.length} after validation. answer=${correctAnswer}`,
              parsed,
            );
          } else {
            // JSON parse failed
            console.warn(
              `[Tutor] attempt=${attempt + 1} JSON parse failed. response preview:`,
              responseText.slice(0, 300),
            );
          }

          // First attempt failed — retry once
        }

        // Both attempts failed — show error
        if (!controller.signal.aborted) {
          addTutorMessage({
            id: `tutor-fallback-${Date.now()}`,
            role: 'tutor',
            text: getCannedFallback('error'),
            timestamp: Date.now(),
          });
        }
        return;
      }

      // TEACH / BOOST: single call, standard safety pipeline
      const responseText = await callGemini({
        systemInstruction: scrubbed.systemInstruction,
        userMessage: scrubbed.userMessage,
        abortSignal: controller.signal,
      });

      if (responseText === null) {
        if (!controller.signal.aborted) {
          addTutorMessage({
            id: `tutor-fallback-${Date.now()}`,
            role: 'tutor',
            text: getCannedFallback('safety_blocked'),
            timestamp: Date.now(),
          });
        }
        return;
      }

      const safetyResult = runSafetyPipeline(
        responseText,
        answerNumericValue(currentProblem.problem.correctAnswer),
        ageBracket,
        currentMode,
      );

      if (!safetyResult.passed) {
        if (!controller.signal.aborted) {
          addTutorMessage({
            id: `tutor-fallback-${Date.now()}`,
            role: 'tutor',
            text: getCannedFallback(safetyResult.fallbackCategory),
            timestamp: Date.now(),
          });
        }
        return;
      }

      if (!controller.signal.aborted) {
        addTutorMessage({
          id: `tutor-${Date.now()}`,
          role: 'tutor',
          text: safetyResult.text,
          timestamp: Date.now(),
        });
        incrementCallCount();

        if (currentMode !== 'boost') {
          incrementHintLevel();
        }

        const escalation = computeEscalation({
          currentMode: useAppStore.getState().tutorMode,
          hintCount: useAppStore.getState().hintLevel,
          wrongAnswerCount: useAppStore.getState().wrongAnswerCount,
        });

        if (escalation.shouldTransition) {
          setTutorMode(escalation.nextMode);
          if (escalation.transitionMessage) {
            addTutorMessage({
              id: `tutor-transition-${Date.now()}`,
              role: 'tutor',
              text: escalation.transitionMessage,
              timestamp: Date.now(),
            });
          }
        }
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

      // Timeout detection: DOMException (non-abort) or timeout keyword
      const isTimeout =
        err instanceof DOMException ||
        (err instanceof Error &&
          err.message.toLowerCase().includes('timeout'));
      if (isTimeout && !controller.signal.aborted) {
        addTutorMessage({
          id: `tutor-fallback-${Date.now()}`,
          role: 'tutor',
          text: getCannedFallback('timeout'),
          timestamp: Date.now(),
        });
        setTutorError(null);
        setTutorLoading(false);
        return;
      }

      // Generic error: use categorized canned fallback instead of raw error string
      if (!controller.signal.aborted) {
        addTutorMessage({
          id: `tutor-fallback-${Date.now()}`,
          role: 'tutor',
          text: getCannedFallback('error'),
          timestamp: Date.now(),
        });
        setTutorError(null);
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
    cpaStage,
    lastWrongContext,
    misconceptions,
    tutorConsentGranted,
    childName,
    childAge,
    addTutorMessage,
    setTutorLoading,
    setTutorError,
    incrementCallCount,
    incrementHintLevel,
    setTutorMode,
    setHintLadder,
    deliverNextLadderHint,
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
    hasMoreHints,
    ladderExhausted,
    shouldExpandManipulative,
    manipulativeType,
    requestTutor,
    requestHint: requestTutor,
    resetForProblem,
  };
}
