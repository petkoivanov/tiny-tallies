import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';
import type { TutorMessage, TutorMode, HintLadder } from '@/services/tutor/types';

export interface TutorSlice {
  tutorMessages: TutorMessage[];
  tutorMode: TutorMode;
  hintLevel: number;
  hintLadder: HintLadder | null;
  tutorLoading: boolean;
  tutorError: string | null;
  problemCallCount: number;
  sessionCallCount: number;
  dailyCallCount: number;
  dailyCountDate: string;
  addTutorMessage: (message: TutorMessage) => void;
  setTutorMode: (mode: TutorMode) => void;
  incrementHintLevel: () => void;
  setHintLadder: (ladder: HintLadder | null) => void;
  advanceHintLadder: () => void;
  setTutorLoading: (loading: boolean) => void;
  setTutorError: (error: string | null) => void;
  wrongAnswerCount: number;
  resetProblemTutor: () => void;
  resetSessionTutor: () => void;
  incrementCallCount: () => void;
  incrementWrongAnswerCount: () => void;
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export const createTutorSlice: StateCreator<
  AppState,
  [],
  [],
  TutorSlice
> = (set) => ({
  tutorMessages: [],
  tutorMode: 'hint',
  hintLevel: 0,
  hintLadder: null,
  tutorLoading: false,
  tutorError: null,
  problemCallCount: 0,
  sessionCallCount: 0,
  dailyCallCount: 0,
  wrongAnswerCount: 0,
  dailyCountDate: getTodayDate(),
  addTutorMessage: (message) =>
    set((state) => ({
      tutorMessages: [...state.tutorMessages, message],
    })),
  setTutorMode: (mode) => set({ tutorMode: mode }),
  incrementHintLevel: () =>
    set((state) => ({ hintLevel: state.hintLevel + 1 })),
  setHintLadder: (ladder) => set({ hintLadder: ladder }),
  advanceHintLadder: () =>
    set((state) => {
      if (!state.hintLadder) return {};
      return {
        hintLadder: {
          ...state.hintLadder,
          nextIndex: state.hintLadder.nextIndex + 1,
        },
      };
    }),
  setTutorLoading: (loading) => set({ tutorLoading: loading }),
  setTutorError: (error) => set({ tutorError: error }),
  resetProblemTutor: () =>
    set({
      tutorMessages: [],
      tutorMode: 'hint',
      hintLevel: 0,
      hintLadder: null,
      tutorError: null,
      problemCallCount: 0,
      wrongAnswerCount: 0,
    }),
  resetSessionTutor: () =>
    set({
      tutorMessages: [],
      tutorMode: 'hint',
      hintLevel: 0,
      hintLadder: null,
      tutorError: null,
      problemCallCount: 0,
      wrongAnswerCount: 0,
      sessionCallCount: 0,
    }),
  incrementWrongAnswerCount: () =>
    set((state) => ({ wrongAnswerCount: state.wrongAnswerCount + 1 })),
  incrementCallCount: () =>
    set((state) => {
      const today = getTodayDate();
      if (state.dailyCountDate !== today) {
        return {
          problemCallCount: state.problemCallCount + 1,
          sessionCallCount: state.sessionCallCount + 1,
          dailyCallCount: 1,
          dailyCountDate: today,
        };
      }
      return {
        problemCallCount: state.problemCallCount + 1,
        sessionCallCount: state.sessionCallCount + 1,
        dailyCallCount: state.dailyCallCount + 1,
      };
    }),
});
