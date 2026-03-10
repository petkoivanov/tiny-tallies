import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { pushSync, queueDeltas, type ScoreDelta } from '../services/sync/syncService';
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
  CHALLENGE_SESSION_CONFIG,
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
import { evaluateBadges, getBadgeById } from '../services/achievement';
import { answerNumericValue } from '../services/mathEngine/types';
import type { BadgeEvaluationSnapshot, BadgeTier } from '../services/achievement';
import {
  getChallengeSkillIds,
  evaluateChallengeGoals,
  CHALLENGE_BONUS_XP,
  CHALLENGE_THEMES,
} from '../services/challenge';
import type { ChallengeCompletion } from '../services/challenge';

/** Commits challenge completion: evaluates goals, awards bonus XP, records to store. */
function commitChallengeCompletion(
  themeId: string, finalScore: number, totalProblems: number, maxStreak: number,
  dateKey: string, addXp: (amount: number) => void,
  completeChallenge: (dateKey: string, completion: ChallengeCompletion) => void,
): { isChallenge: boolean; challengeBonusXp: number; accuracyGoalMet: boolean; streakGoalMet: boolean } | undefined {
  const theme = CHALLENGE_THEMES.find((t) => t.id === themeId);
  if (!theme) return undefined;

  const goals = evaluateChallengeGoals(finalScore, totalProblems, maxStreak, theme);
  addXp(CHALLENGE_BONUS_XP);

  completeChallenge(dateKey, {
    themeId,
    score: finalScore,
    total: totalProblems,
    accuracyGoalMet: goals.accuracyGoalMet,
    streakGoalMet: goals.streakGoalMet,
    bonusXpAwarded: CHALLENGE_BONUS_XP,
    completedAt: new Date().toISOString(),
  });

  return {
    isChallenge: true,
    challengeBonusXp: CHALLENGE_BONUS_XP,
    accuracyGoalMet: goals.accuracyGoalMet,
    streakGoalMet: goals.streakGoalMet,
  };
}

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

/** Generates session queue synchronously during ref initialization. */
function initializeSession(
  skillStates: Record<string, SkillState>,
  misconceptions: Record<string, MisconceptionRecord>,
  mode: SessionMode = 'standard',
  remediationSkillIds?: readonly string[],
  challengeThemeId?: string,
): { queue: SessionProblem[]; startTime: number; challengeStartDate: string } {
  const seed = Date.now();
  const startTime = Date.now();

  const isRemediation = mode === 'remediation';
  const isChallenge = mode === 'challenge';

  const sessionConfig = isChallenge
    ? CHALLENGE_SESSION_CONFIG
    : isRemediation
      ? REMEDIATION_SESSION_CONFIG
      : DEFAULT_SESSION_CONFIG;

  const confirmedSkillIds: string[] = isChallenge && challengeThemeId
    ? (CHALLENGE_THEMES.find((t) => t.id === challengeThemeId)
        ? getChallengeSkillIds(CHALLENGE_THEMES.find((t) => t.id === challengeThemeId)!, skillStates) : [])
    : isRemediation && remediationSkillIds
      ? [...remediationSkillIds]
      : [...new Set(getConfirmedMisconceptions(misconceptions).map((r) => r.skillId))];

  const queue = generateSessionQueue(
    skillStates, sessionConfig, seed, null, confirmedSkillIds, isRemediation || isChallenge,
  );

  // Capture date key at init for date boundary safety
  const d = new Date();
  const challengeStartDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { queue, startTime, challengeStartDate };
}

/** Session lifecycle hook: queue, answer handling, feedback, Elo/XP, commit-on-complete. */
export function useSession(options?: {
  mode?: SessionMode;
  remediationSkillIds?: string[];
  challengeThemeId?: string;
}): UseSessionReturn {
  const mode = options?.mode ?? 'standard';
  const remediationSkillIds = options?.remediationSkillIds;
  const challengeThemeId = options?.challengeThemeId;
  const sessionConfig = mode === 'challenge'
    ? CHALLENGE_SESSION_CONFIG
    : mode === 'remediation'
      ? REMEDIATION_SESSION_CONFIG
      : DEFAULT_SESSION_CONFIG;

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
  const completeChallenge = useAppStore((s) => s.completeChallenge);

  // Synchronous init: queue available on first render
  const initializedRef = useRef(false);
  const sessionQueueRef = useRef<SessionProblem[]>([]);
  const sessionStartTimeRef = useRef(0);
  const pendingUpdatesRef = useRef<Map<string, PendingSkillUpdate>>(new Map());
  const totalXpEarnedRef = useRef(0);
  const frustrationStateRef = useRef<FrustrationState>(createFrustrationState());
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxStreakRef = useRef(0);
  const currentStreakRef = useRef(0);
  const challengeStartDateRef = useRef('');

  if (!initializedRef.current) {
    initializedRef.current = true;
    resetSessionDedup();
    const { queue, startTime, challengeStartDate } = initializeSession(
      skillStates, misconceptions, mode, remediationSkillIds, challengeThemeId,
    );
    sessionQueueRef.current = queue;
    sessionStartTimeRef.current = startTime;
    challengeStartDateRef.current = challengeStartDate;
  }

  // Mark session active in a layout effect to avoid setState-during-render warning
  useEffect(() => {
    startSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Cleanup feedback timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    };
  }, []);

  const currentProblem = isComplete ? null : (sessionQueueRef.current[currentIndex] ?? null);
  const sessionPhase = getSessionPhase(currentIndex, sessionConfig);
  const correctAnswer = currentProblem
    ? answerNumericValue(currentProblem.problem.correctAnswer)
    : null;

  const handleAnswer = useCallback(
    (selectedValue: number) => {
      const problem = sessionQueueRef.current[currentIndex];
      if (!problem || feedbackState !== null) return;

      const isCorrect = selectedValue === answerNumericValue(problem.problem.correctAnswer);

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

      // Track maxStreak and XP
      if (isCorrect) {
        currentStreakRef.current += 1;
        maxStreakRef.current = Math.max(maxStreakRef.current, currentStreakRef.current);
        totalXpEarnedRef.current += calculateXp(problem.templateBaseElo);
        setScore((prev) => prev + 1);
      } else {
        currentStreakRef.current = 0;
      }

      frustrationStateRef.current = updateFrustrationState(
        frustrationStateRef.current, problem.skillId, isCorrect);

      // Schedule auto-advance
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

          // Challenge completion: runs before badge eval so challengesCompleted is incremented
          const finalScore = isCorrect ? score + 1 : score;
          const challengeResult = mode === 'challenge' && challengeThemeId
            ? commitChallengeCompletion(
                challengeThemeId, finalScore, totalProblems, maxStreakRef.current,
                challengeStartDateRef.current, addXp, completeChallenge,
              )
            : undefined;

          // Badge evaluation: increment session counter, build snapshot, evaluate
          const currentState = useAppStore.getState();
          currentState.incrementSessionsCompleted();

          const badgeSnapshot: BadgeEvaluationSnapshot = {
            skillStates: useAppStore.getState().skillStates,
            weeklyStreak: useAppStore.getState().weeklyStreak,
            sessionsCompleted: useAppStore.getState().sessionsCompleted,
            misconceptions: useAppStore.getState().misconceptions,
            challengesCompleted: useAppStore.getState().challengesCompleted,
            lastChallengeScore: challengeResult
              ? { score: finalScore, total: totalProblems }
              : undefined,
            childGrade: useAppStore.getState().childGrade ?? 1,
          };
          const allNewBadges = evaluateBadges(badgeSnapshot, useAppStore.getState().earnedBadges);
          if (allNewBadges.length > 0) {
            useAppStore.getState().addEarnedBadges(allNewBadges);
          }
          // Show only the single highest-tier badge to avoid overwhelming the child.
          // All badges are still persisted above — only the popup/summary is limited.
          const TIER_RANK: Record<BadgeTier, number> = { bronze: 1, silver: 2, gold: 3 };
          const bestBadge = allNewBadges.length > 0
            ? allNewBadges.reduce((best, id) => {
                const bestTier = getBadgeById(best)?.tier ?? 'bronze';
                const curTier = getBadgeById(id)?.tier ?? 'bronze';
                return TIER_RANK[curTier] > TIER_RANK[bestTier] ? id : best;
              })
            : null;
          const newBadges = bestBadge ? [bestBadge] : [];

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
            totalNewBadges: allNewBadges.length,
            ...(challengeResult ?? {}),
          });

          // Cloud sync: queue deltas and trigger push
          const syncState = useAppStore.getState();
          if (syncState.activeChildId) {
            const now = Math.floor(Date.now() / 1000);
            const syncDeltas: ScoreDelta[] = [];
            pendingUpdatesRef.current.forEach((update, skillId) => {
              const original = getOrCreateSkillState(skillStates, skillId);
              syncDeltas.push({
                skillId,
                eloDelta: update.newElo - original.eloRating,
                xpDelta: totalXpEarnedRef.current,
                correct: update.correct,
                timestamp: now,
              });
            });
            const syncBadges = newBadges.map((id) => ({
              badgeId: id,
              earnedAt: now,
            }));
            queueDeltas(syncState.activeChildId, syncDeltas, syncBadges).then(
              () => pushSync(),
            );
          }
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
      challengeThemeId,
      completeChallenge,
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
