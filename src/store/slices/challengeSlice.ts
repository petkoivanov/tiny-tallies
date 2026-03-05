import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';
import type { ChallengeCompletion } from '../../services/challenge/challengeTypes';

export interface ChallengeSlice {
  /** Challenge completions keyed by date string (YYYY-MM-DD) — persisted via partialize */
  challengeCompletions: Record<string, ChallengeCompletion>;
  /** Total number of challenges completed — persisted via partialize */
  challengesCompleted: number;
  /** Records a challenge completion for the given date */
  completeChallenge: (dateKey: string, completion: ChallengeCompletion) => void;
}

export const createChallengeSlice: StateCreator<
  AppState,
  [],
  [],
  ChallengeSlice
> = (set) => ({
  challengeCompletions: {},
  challengesCompleted: 0,

  completeChallenge: (dateKey, completion) =>
    set((state) => ({
      challengeCompletions: {
        ...state.challengeCompletions,
        [dateKey]: completion,
      },
      challengesCompleted: state.challengesCompleted + 1,
    })),
});
