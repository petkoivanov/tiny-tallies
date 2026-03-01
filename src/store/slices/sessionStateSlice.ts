import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';

export interface SessionAnswer {
  problemId: string;
  answer: number;
  correct: boolean;
}

export interface SessionStateSlice {
  isSessionActive: boolean;
  currentProblemIndex: number;
  sessionScore: number;
  sessionXpEarned: number;
  sessionAnswers: SessionAnswer[];
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
  startSession: () =>
    set({
      isSessionActive: true,
      currentProblemIndex: 0,
      sessionScore: 0,
      sessionXpEarned: 0,
      sessionAnswers: [],
    }),
  endSession: () => set({ isSessionActive: false }),
  recordAnswer: (answer) =>
    set((state) => ({
      sessionAnswers: [...state.sessionAnswers, answer],
      sessionScore: answer.correct ? state.sessionScore + 1 : state.sessionScore,
      currentProblemIndex: state.currentProblemIndex + 1,
    })),
});
