import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';

export interface SessionAnswer {
  problemId: string;
  answer: number;
  correct: boolean;
  /** Time in milliseconds to answer (for analytics). */
  timeMs?: number;
  /** Answer format used: multiple choice or free text input. */
  format?: 'mc' | 'free';
  /** Matched misconception bugId from distractor (for misconception tracking). */
  bugId?: string;
}

export interface SessionStateSlice {
  isSessionActive: boolean;
  currentProblemIndex: number;
  sessionScore: number;
  sessionXpEarned: number;
  sessionAnswers: SessionAnswer[];
  sessionStartTime: number | null;
  startSession: () => void;
  endSession: () => void;
  recordAnswer: (answer: SessionAnswer) => void;
}

export const createSessionStateSlice: StateCreator<
  AppState,
  [],
  [],
  SessionStateSlice
> = (set) => ({
  isSessionActive: false,
  currentProblemIndex: 0,
  sessionScore: 0,
  sessionXpEarned: 0,
  sessionAnswers: [],
  sessionStartTime: null,
  startSession: () =>
    set({
      isSessionActive: true,
      currentProblemIndex: 0,
      sessionScore: 0,
      sessionXpEarned: 0,
      sessionAnswers: [],
      sessionStartTime: Date.now(),
    }),
  endSession: () => set({ isSessionActive: false, sessionStartTime: null }),
  recordAnswer: (answer) =>
    set((state) => ({
      sessionAnswers: [...state.sessionAnswers, answer],
      sessionScore: answer.correct ? state.sessionScore + 1 : state.sessionScore,
      currentProblemIndex: state.currentProblemIndex + 1,
    })),
});
