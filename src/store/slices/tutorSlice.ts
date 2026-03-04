import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';
import type { TutorMessage, TutorMode } from '@/services/tutor/types';

export interface TutorSlice {
  tutorMessages: TutorMessage[];
  tutorMode: TutorMode;
  hintLevel: number;
  tutorLoading: boolean;
  tutorError: string | null;
  problemCallCount: number;
  sessionCallCount: number;
  dailyCallCount: number;
  dailyCountDate: string;
  addTutorMessage: (message: TutorMessage) => void;
  setTutorMode: (mode: TutorMode) => void;
  incrementHintLevel: () => void;
  setTutorLoading: (loading: boolean) => void;
  setTutorError: (error: string | null) => void;
  resetProblemTutor: () => void;
  resetSessionTutor: () => void;
  incrementCallCount: () => void;
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
  tutorLoading: false,
  tutorError: null,
  problemCallCount: 0,
  sessionCallCount: 0,
  dailyCallCount: 0,
  dailyCountDate: getTodayDate(),
  addTutorMessage: (message) =>
    set((state) => ({
      tutorMessages: [...state.tutorMessages, message],
    })),
  setTutorMode: (mode) => set({ tutorMode: mode }),
  incrementHintLevel: () =>
    set((state) => ({ hintLevel: state.hintLevel + 1 })),
  setTutorLoading: (loading) => set({ tutorLoading: loading }),
  setTutorError: (error) => set({ tutorError: error }),
  resetProblemTutor: () =>
    set({
      tutorMessages: [],
      tutorMode: 'hint',
      hintLevel: 0,
      tutorError: null,
      problemCallCount: 0,
    }),
  resetSessionTutor: () =>
    set({
      tutorMessages: [],
      tutorMode: 'hint',
      hintLevel: 0,
      tutorError: null,
      problemCallCount: 0,
      sessionCallCount: 0,
    }),
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
