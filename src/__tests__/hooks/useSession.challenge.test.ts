import { renderHook, act } from '@testing-library/react-native';

// Mock evaluateBadges
const mockEvaluateBadges = jest.fn<string[], [unknown, unknown]>();
jest.mock('@/services/achievement', () => ({
  ...jest.requireActual('@/services/achievement'),
  evaluateBadges: (a: unknown, b: unknown) => mockEvaluateBadges(a, b),
}));

// Mock challenge service
const mockGetChallengeSkillIds = jest.fn<string[], [unknown, unknown]>();
const mockEvaluateChallengeGoals = jest.fn();
jest.mock('@/services/challenge', () => ({
  ...jest.requireActual('@/services/challenge'),
  getChallengeSkillIds: (a: unknown, b: unknown) => mockGetChallengeSkillIds(a, b),
  evaluateChallengeGoals: (...args: unknown[]) => mockEvaluateChallengeGoals(...args),
}));

import { useAppStore } from '@/store/appStore';
import { useSession, FEEDBACK_DURATION_MS } from '@/hooks/useSession';
import type { SessionMode } from '@/services/session/sessionTypes';
import { CHALLENGE_SESSION_CONFIG } from '@/services/session/sessionTypes';

jest.useFakeTimers();

/**
 * Helper: answer all problems correctly in a session.
 */
function completeSessionCorrectly(result: { current: ReturnType<typeof useSession> }) {
  const total = result.current.totalProblems;
  for (let i = 0; i < total; i++) {
    const problem = result.current.currentProblem;
    if (!problem) break;

    act(() => {
      result.current.handleAnswer(problem.problem.correctAnswer);
    });
    act(() => {
      jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
    });
  }
}

/**
 * Helper: answer problems with specific correct/wrong pattern.
 * Pattern: array of booleans (true = correct, false = wrong).
 */
function completeSessionWithPattern(
  result: { current: ReturnType<typeof useSession> },
  pattern: boolean[],
) {
  for (let i = 0; i < pattern.length; i++) {
    const problem = result.current.currentProblem;
    if (!problem) break;

    const answer = pattern[i]
      ? problem.problem.correctAnswer
      : problem.presentation.options.find(
          (o) => o.value !== problem.problem.correctAnswer,
        )!.value;

    act(() => {
      result.current.handleAnswer(answer);
    });
    act(() => {
      jest.advanceTimersByTime(FEEDBACK_DURATION_MS);
    });
  }
}

describe('useSession challenge mode', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true);
    jest.clearAllTimers();
    mockEvaluateBadges.mockReset();
    mockEvaluateBadges.mockReturnValue([]);
    mockGetChallengeSkillIds.mockReset();
    mockGetChallengeSkillIds.mockReturnValue([
      'addition.single-digit.no-carry',
      'addition.within-20.no-carry',
    ]);
    mockEvaluateChallengeGoals.mockReset();
    mockEvaluateChallengeGoals.mockReturnValue({
      accuracyGoalMet: true,
      streakGoalMet: false,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('CHALLENGE_SESSION_CONFIG', () => {
    it('has 0 warmup + 10 practice + 0 cooldown', () => {
      expect(CHALLENGE_SESSION_CONFIG).toEqual({
        warmupCount: 0,
        practiceCount: 10,
        cooldownCount: 0,
      });
    });
  });

  describe('SessionMode', () => {
    it('accepts challenge as a valid mode', () => {
      const mode: SessionMode = 'challenge';
      expect(mode).toBe('challenge');
    });
  });

  describe('challenge session behavior', () => {
    it('generates 10 problems when mode is challenge', () => {
      const { result } = renderHook(() =>
        useSession({ mode: 'challenge', challengeThemeId: 'addition-adventure' }),
      );

      expect(result.current.totalProblems).toBe(10);
    });

    it('sessionMode reflects challenge', () => {
      const { result } = renderHook(() =>
        useSession({ mode: 'challenge', challengeThemeId: 'addition-adventure' }),
      );

      expect(result.current.sessionMode).toBe('challenge');
    });
  });

  describe('maxStreak tracking', () => {
    it('tracks maxStreak as longest consecutive correct run', () => {
      const { result } = renderHook(() =>
        useSession({ mode: 'challenge', challengeThemeId: 'addition-adventure' }),
      );

      // Answer pattern: correct, correct, correct, wrong, correct, correct, ...
      // maxStreak should be 3 (first 3 correct), then resets, then builds to whatever remains
      const pattern = [true, true, true, false, true, true, true, true, true, true];
      completeSessionWithPattern(result, pattern);

      expect(result.current.isComplete).toBe(true);
      // maxStreak should be 6 (the last 6 correct in a row)
      // We verify through the challenge goals evaluation call
      expect(mockEvaluateChallengeGoals).toHaveBeenCalledWith(
        9, // score (9 correct)
        10, // total
        6, // maxStreak
        expect.objectContaining({ id: 'addition-adventure' }),
      );
    });
  });

  describe('challenge completion flow', () => {
    it('calls completeChallenge on store when challenge session completes', () => {
      const { result } = renderHook(() =>
        useSession({ mode: 'challenge', challengeThemeId: 'addition-adventure' }),
      );

      completeSessionCorrectly(result);

      // challengeCompletions should have an entry
      const { challengeCompletions } = useAppStore.getState();
      const keys = Object.keys(challengeCompletions);
      expect(keys.length).toBe(1);

      const completion = challengeCompletions[keys[0]];
      expect(completion.themeId).toBe('addition-adventure');
      expect(completion.bonusXpAwarded).toBe(50);
    });

    it('awards CHALLENGE_BONUS_XP (50) bonus XP on challenge completion', () => {
      const xpBefore = useAppStore.getState().xp;

      const { result } = renderHook(() =>
        useSession({ mode: 'challenge', challengeThemeId: 'addition-adventure' }),
      );

      completeSessionCorrectly(result);

      const xpAfter = useAppStore.getState().xp;
      // XP should include both per-problem XP and the 50 bonus
      // The bonus portion can be verified through the completion record
      const completions = useAppStore.getState().challengeCompletions;
      const completion = Object.values(completions)[0];
      expect(completion.bonusXpAwarded).toBe(50);
      expect(xpAfter).toBeGreaterThan(xpBefore);
    });

    it('increments challengesCompleted in store', () => {
      const before = useAppStore.getState().challengesCompleted;

      const { result } = renderHook(() =>
        useSession({ mode: 'challenge', challengeThemeId: 'addition-adventure' }),
      );

      completeSessionCorrectly(result);

      expect(useAppStore.getState().challengesCompleted).toBe(before + 1);
    });

    it('includes challenge data in sessionResult', () => {
      const { result } = renderHook(() =>
        useSession({ mode: 'challenge', challengeThemeId: 'addition-adventure' }),
      );

      completeSessionCorrectly(result);

      expect(result.current.sessionResult).not.toBeNull();
      const sr = result.current.sessionResult!;
      expect(sr.isChallenge).toBe(true);
      expect(sr.challengeBonusXp).toBe(50);
      expect(sr.accuracyGoalMet).toBeDefined();
      expect(sr.streakGoalMet).toBeDefined();
    });
  });

  describe('badge snapshot includes challenge data', () => {
    it('passes challengesCompleted in badge evaluation snapshot', () => {
      const { result } = renderHook(() =>
        useSession({ mode: 'challenge', challengeThemeId: 'addition-adventure' }),
      );

      completeSessionCorrectly(result);

      expect(mockEvaluateBadges).toHaveBeenCalledTimes(1);
      const snapshot = mockEvaluateBadges.mock.calls[0][0] as {
        challengesCompleted: number;
        lastChallengeScore?: { score: number; total: number };
      };
      // challengesCompleted should reflect the just-completed challenge
      expect(snapshot.challengesCompleted).toBeGreaterThanOrEqual(1);
    });
  });

  describe('standard mode does not trigger challenge flow', () => {
    it('does NOT call completeChallenge for standard sessions', () => {
      const { result } = renderHook(() => useSession());

      completeSessionCorrectly(result);

      expect(useAppStore.getState().challengesCompleted).toBe(0);
      expect(Object.keys(useAppStore.getState().challengeCompletions)).toHaveLength(0);
    });
  });
});
