import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import type { SkillState } from '../store/slices/skillStatesSlice';
import type { FrustrationState } from '../services/adaptive/types';
import {
  createFrustrationState,
  updateFrustrationState,
  calculateEloUpdate,
  calculateXp,
} from '../services/adaptive';
import {
  generateSessionQueue,
  getSessionPhase,
  commitSessionResults,
  DEFAULT_SESSION_CONFIG,
} from '../services/session';
import type {
  SessionPhase,
  SessionProblem,
  SessionResult,
  SessionFeedback,
  PendingSkillUpdate,
} from '../services/session';
import { getOrCreateSkillState } from '../store/helpers/skillStateHelpers';

/** Duration in ms to show correct/incorrect feedback before auto-advancing */
export const FEEDBACK_DURATION_MS = 1500;

export interface FeedbackState {
  visible: boolean;
  correct: boolean;
}

export interface UseSessionReturn {
  currentProblem: SessionProblem | null;
  currentIndex: number;
  totalProblems: number;
  sessionPhase: SessionPhase;
  feedbackState: FeedbackState | null;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  isComplete: boolean;
  score: number;
  handleAnswer: (selectedValue: number) => void;
  handleQuit: () => void;
  sessionResult: SessionResult | null;
}

/**
 * Generates the initial session queue and marks the session as active in the store.
 * Extracted as a helper so it runs synchronously during ref initialization,
 * making the queue available on the very first render.
 */
function initializeSession(
  skillStates: Record<string, SkillState>,
  startSession: () => void,
): { queue: SessionProblem[]; startTime: number } {
  startSession();
  const seed = Date.now();
  const startTime = Date.now();
  const queue = generateSessionQueue(skillStates, DEFAULT_SESSION_CONFIG, seed);
  return { queue, startTime };
}

/**
 * Session lifecycle hook that composes the session orchestrator with store actions.
 *
 * Manages: problem queue, answer handling, feedback timing, Elo/XP accumulation,
 * and commit-on-complete semantics (quit discards all updates).
 *
 * State design:
 * - Problem queue stored in useRef (ephemeral, not in Zustand store)
 * - Elo/XP accumulate in refs during session, committed only on completion
 * - FrustrationState tracked in ref (session-scoped, not used for queue in v0.1)
 * - Feedback timer cleaned up on unmount (defense-in-depth)
 */
export function useSession(): UseSessionReturn {
  // Store selectors and actions
  const skillStates = useAppStore((s) => s.skillStates);
  const startSession = useAppStore((s) => s.startSession);
  const endSession = useAppStore((s) => s.endSession);
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const updateSkillState = useAppStore((s) => s.updateSkillState);
  const addXp = useAppStore((s) => s.addXp);
  const xp = useAppStore((s) => s.xp);
  const level = useAppStore((s) => s.level);
  const setLevel = useAppStore((s) => s.setLevel);
  const setLastSessionDate = useAppStore((s) => s.setLastSessionDate);
  const weeklyStreak = useAppStore((s) => s.weeklyStreak);
  const lastSessionDate = useAppStore((s) => s.lastSessionDate);
  const setWeeklyStreak = useAppStore((s) => s.setWeeklyStreak);

  // Synchronous initialization: generate queue on first render, not in useEffect.
  // This ensures currentProblem is available immediately.
  const initializedRef = useRef(false);
  const sessionQueueRef = useRef<SessionProblem[]>([]);
  const sessionStartTimeRef = useRef(0);
  const pendingUpdatesRef = useRef<Map<string, PendingSkillUpdate>>(new Map());
  const totalXpEarnedRef = useRef(0);
  const frustrationStateRef = useRef<FrustrationState>(createFrustrationState());
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!initializedRef.current) {
    initializedRef.current = true;
    const { queue, startTime } = initializeSession(skillStates, startSession);
    sessionQueueRef.current = queue;
    sessionStartTimeRef.current = startTime;
  }

  // React state (drives UI re-renders)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedbackState, setFeedbackState] = useState<FeedbackState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);

  const totalProblems =
    DEFAULT_SESSION_CONFIG.warmupCount +
    DEFAULT_SESSION_CONFIG.practiceCount +
    DEFAULT_SESSION_CONFIG.cooldownCount;

  // Cleanup feedback timer on unmount (defense-in-depth)
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    };
  }, []);

  // Derived values
  const currentProblem = isComplete ? null : (sessionQueueRef.current[currentIndex] ?? null);
  const sessionPhase = getSessionPhase(currentIndex, DEFAULT_SESSION_CONFIG);
  const correctAnswer = currentProblem?.problem.correctAnswer ?? null;

  const handleAnswer = useCallback(
    (selectedValue: number) => {
      const problem = sessionQueueRef.current[currentIndex];
      if (!problem || feedbackState !== null) return;

      const isCorrect = selectedValue === problem.problem.correctAnswer;

      // Track selected answer for button coloring
      setSelectedAnswer(selectedValue);

      // Show feedback
      setFeedbackState({ visible: true, correct: isCorrect });

      // Find bugId from selected choice if wrong
      let bugId: string | undefined;
      if (!isCorrect) {
        const selectedOption = problem.presentation.options.find(
          (o) => o.value === selectedValue,
        );
        bugId = selectedOption?.bugId;
      }

      // Record answer in store
      recordAnswer({
        problemId: problem.problem.id,
        answer: selectedValue,
        correct: isCorrect,
        format: 'mc',
        bugId,
      });

      // Update Elo in pending updates
      const skillState = getOrCreateSkillState(skillStates, problem.skillId);
      const existing = pendingUpdatesRef.current.get(problem.skillId);

      const currentElo = existing?.newElo ?? skillState.eloRating;
      const currentAttempts = existing?.attempts ?? skillState.attempts;
      const currentCorrect = existing?.correct ?? skillState.correct;

      const eloResult = calculateEloUpdate(
        currentElo,
        problem.templateBaseElo,
        isCorrect,
        currentAttempts,
      );

      pendingUpdatesRef.current.set(problem.skillId, {
        skillId: problem.skillId,
        newElo: eloResult.newElo,
        attempts: currentAttempts + 1,
        correct: currentCorrect + (isCorrect ? 1 : 0),
      });

      // Calculate XP if correct
      if (isCorrect) {
        totalXpEarnedRef.current += calculateXp(problem.templateBaseElo);
        setScore((prev) => prev + 1);
      }

      // Update frustration state
      frustrationStateRef.current = updateFrustrationState(
        frustrationStateRef.current,
        problem.skillId,
        isCorrect,
      );

      // Schedule auto-advance after feedback duration
      feedbackTimerRef.current = setTimeout(() => {
        feedbackTimerRef.current = null;
        setFeedbackState(null);
        setSelectedAnswer(null);

        const nextIndex = currentIndex + 1;
        if (nextIndex >= totalProblems) {
          // Session complete -- commit results
          setIsComplete(true);
          const feedback = commitSessionResults(
            pendingUpdatesRef.current,
            totalXpEarnedRef.current,
            updateSkillState,
            addXp,
            xp,
            level,
            setLevel,
            setLastSessionDate,
            weeklyStreak,
            lastSessionDate,
            setWeeklyStreak,
          );
          endSession();

          const durationMs = Date.now() - sessionStartTimeRef.current;
          setSessionResult({
            score: isCorrect ? score + 1 : score,
            total: totalProblems,
            xpEarned: totalXpEarnedRef.current,
            durationMs,
            pendingUpdates: new Map(pendingUpdatesRef.current),
            feedback,
          });
        } else {
          setCurrentIndex(nextIndex);
        }
      }, FEEDBACK_DURATION_MS);
    },
    [
      currentIndex,
      feedbackState,
      skillStates,
      score,
      totalProblems,
      recordAnswer,
      updateSkillState,
      addXp,
      xp,
      level,
      setLevel,
      setLastSessionDate,
      weeklyStreak,
      lastSessionDate,
      setWeeklyStreak,
      endSession,
    ],
  );

  const handleQuit = useCallback(() => {
    // Clear feedback timer if active
    if (feedbackTimerRef.current !== null) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    // Discard everything -- do NOT commit results
    endSession();

    // Reset local state
    setFeedbackState(null);
    setSelectedAnswer(null);
    setCurrentIndex(0);
    setScore(0);
    setIsComplete(false);
    setSessionResult(null);
    sessionQueueRef.current = [];
    pendingUpdatesRef.current = new Map();
    totalXpEarnedRef.current = 0;
  }, [endSession]);

  return {
    currentProblem,
    currentIndex,
    totalProblems,
    sessionPhase,
    feedbackState,
    selectedAnswer,
    correctAnswer,
    isComplete,
    score,
    handleAnswer,
    handleQuit,
    sessionResult,
  };
}
