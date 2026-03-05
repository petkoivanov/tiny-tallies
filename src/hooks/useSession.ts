import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import type { SkillState } from '../store/slices/skillStatesSlice';
import type { FrustrationState } from '../services/adaptive/types';
import {
  createFrustrationState,
  updateFrustrationState,
  calculateEloUpdate,
  calculateXp,
  updateBktMastery,
  getBktParams,
  applySoftMasteryLock,
  transitionBox,
  computeNextReviewDue,
} from '../services/adaptive';
import { advanceCpaStage } from '../services/cpa';
import {
  generateSessionQueue,
  getSessionPhase,
  commitSessionResults,
  DEFAULT_SESSION_CONFIG,
  REMEDIATION_SESSION_CONFIG,
} from '../services/session';
import type {
  SessionPhase,
  SessionMode,
  SessionProblem,
  SessionResult,
  SessionFeedback,
  PendingSkillUpdate,
} from '../services/session';
import type { CpaStage } from '../services/cpa/cpaTypes';
import { getOrCreateSkillState } from '../store/helpers/skillStateHelpers';
import type { MisconceptionRecord } from '../store/slices/misconceptionSlice';
import { getConfirmedMisconceptions } from '../store/slices/misconceptionSlice';
import { evaluateBadges } from '../services/achievement';
import type { BadgeEvaluationSnapshot } from '../services/achievement';

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
  sessionMode: SessionMode;
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
  misconceptions: Record<string, MisconceptionRecord>,
  mode: SessionMode = 'standard',
  remediationSkillIds?: readonly string[],
): { queue: SessionProblem[]; startTime: number } {
  startSession();
  const seed = Date.now();
  const startTime = Date.now();

  const isRemediation = mode === 'remediation';
  const sessionConfig = isRemediation ? REMEDIATION_SESSION_CONFIG : DEFAULT_SESSION_CONFIG;

  // For remediation mode, use provided skill IDs; for standard, read from store
  const confirmedSkillIds = isRemediation && remediationSkillIds
    ? [...remediationSkillIds]
    : [...new Set(getConfirmedMisconceptions(misconceptions).map((r) => r.skillId))];

  const queue = generateSessionQueue(
    skillStates, sessionConfig, seed, null, confirmedSkillIds, isRemediation,
  );
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
export function useSession(options?: {
  mode?: SessionMode;
  remediationSkillIds?: string[];
}): UseSessionReturn {
  const mode = options?.mode ?? 'standard';
  const remediationSkillIds = options?.remediationSkillIds;
  const sessionConfig = mode === 'remediation' ? REMEDIATION_SESSION_CONFIG : DEFAULT_SESSION_CONFIG;

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
  const childAge = useAppStore((s) => s.childAge);
  const recordMisconception = useAppStore((s) => s.recordMisconception);
  const recordRemediationCorrect = useAppStore((s) => s.recordRemediationCorrect);
  const resetSessionDedup = useAppStore((s) => s.resetSessionDedup);
  const misconceptions = useAppStore((s) => s.misconceptions);

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
    resetSessionDedup();
    const { queue, startTime } = initializeSession(
      skillStates, startSession, misconceptions, mode, remediationSkillIds,
    );
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
    sessionConfig.warmupCount +
    sessionConfig.practiceCount +
    sessionConfig.cooldownCount;

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
  const sessionPhase = getSessionPhase(currentIndex, sessionConfig);
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

      // Record misconception if wrong answer matched a Bug Library pattern
      if (!isCorrect && bugId) {
        recordMisconception(bugId, problem.skillId);
      }

      // Track remediation progress on correct answers during remediation sessions
      if (isCorrect && mode === 'remediation') {
        recordRemediationCorrect(problem.skillId);
      }

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

      // BKT mastery update (independent of Elo, per user decision)
      const bktParams = getBktParams(childAge);
      const currentPL = existing?.newMasteryPL ?? skillState.masteryProbability;
      const currentConsecutiveWrong = existing?.newConsecutiveWrong ?? skillState.consecutiveWrong;
      const currentMasteryLocked = existing?.newMasteryLocked ?? skillState.masteryLocked;

      const bktResult = updateBktMastery(currentPL, isCorrect, bktParams);
      const masteryResult = applySoftMasteryLock(
        bktResult,
        currentMasteryLocked,
        currentConsecutiveWrong,
        isCorrect,
      );

      // Leitner box transition
      const currentLeitnerBox = existing?.newLeitnerBox ?? skillState.leitnerBox;
      const currentConsecutiveCorrectInBox6 = existing?.newConsecutiveCorrectInBox6 ?? skillState.consecutiveCorrectInBox6;

      const leitnerResult = transitionBox(
        currentLeitnerBox,
        isCorrect,
        currentConsecutiveCorrectInBox6,
        childAge,
      );

      // BKT mastery auto-advance: if BKT declares mastery and box < 6, sync to Box 6
      let finalLeitnerBox = leitnerResult.newBox;
      let finalNextReviewDue = leitnerResult.nextReviewDue;
      let finalConsecutiveCorrectInBox6 = leitnerResult.consecutiveCorrectInBox6;

      if (masteryResult.masteryLocked && leitnerResult.newBox < 6) {
        finalLeitnerBox = 6;
        finalNextReviewDue = computeNextReviewDue(6, childAge);
        finalConsecutiveCorrectInBox6 = 0; // reset: didn't earn it via Box 6 streak
      }

      // CPA one-way advance: compute from current stage + new mastery
      const currentCpaLevel = existing?.newCpaLevel ?? skillState.cpaLevel ?? 'concrete';
      const newCpaLevel = advanceCpaStage(currentCpaLevel, masteryResult.masteryProbability);

      pendingUpdatesRef.current.set(problem.skillId, {
        skillId: problem.skillId,
        newElo: eloResult.newElo,
        attempts: currentAttempts + 1,
        correct: currentCorrect + (isCorrect ? 1 : 0),
        newMasteryPL: masteryResult.masteryProbability,
        newConsecutiveWrong: masteryResult.consecutiveWrong,
        newMasteryLocked: masteryResult.masteryLocked,
        newLeitnerBox: finalLeitnerBox,
        newNextReviewDue: finalNextReviewDue,
        newConsecutiveCorrectInBox6: finalConsecutiveCorrectInBox6,
        newCpaLevel,
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
          // Session complete -- snapshot pre-session CPA levels before commit
          const preSessionCpaLevels = new Map<string, CpaStage>();
          pendingUpdatesRef.current.forEach((_update, skillId) => {
            const original = getOrCreateSkillState(skillStates, skillId);
            preSessionCpaLevels.set(skillId, original.cpaLevel ?? 'concrete');
          });

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

          // Badge evaluation: increment session counter, build snapshot, evaluate
          const currentState = useAppStore.getState();
          currentState.incrementSessionsCompleted();

          const badgeSnapshot: BadgeEvaluationSnapshot = {
            skillStates: useAppStore.getState().skillStates,
            weeklyStreak: useAppStore.getState().weeklyStreak,
            sessionsCompleted: useAppStore.getState().sessionsCompleted,
            misconceptions: useAppStore.getState().misconceptions,
          };
          const newBadges = evaluateBadges(badgeSnapshot, useAppStore.getState().earnedBadges);
          if (newBadges.length > 0) {
            useAppStore.getState().addEarnedBadges(newBadges);
          }

          // Compute CPA advances by comparing snapshot with pending updates
          const cpaAdvances: Array<{ skillId: string; from: CpaStage; to: CpaStage }> = [];
          pendingUpdatesRef.current.forEach((update, skillId) => {
            const originalCpa = preSessionCpaLevels.get(skillId) ?? 'concrete';
            if (update.newCpaLevel && update.newCpaLevel !== originalCpa) {
              cpaAdvances.push({ skillId, from: originalCpa, to: update.newCpaLevel });
            }
          });

          // Merge cpaAdvances into feedback
          const feedbackWithCpa: SessionFeedback | null = feedback
            ? { ...feedback, cpaAdvances }
            : null;

          const durationMs = Date.now() - sessionStartTimeRef.current;
          setSessionResult({
            score: isCorrect ? score + 1 : score,
            total: totalProblems,
            xpEarned: totalXpEarnedRef.current,
            durationMs,
            pendingUpdates: new Map(pendingUpdatesRef.current),
            feedback: feedbackWithCpa,
            newBadges,
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
      childAge,
      recordMisconception,
      recordRemediationCorrect,
      mode,
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
    sessionMode: mode,
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
