import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';

/** A single wrong answer record for parent review. */
export interface WrongAnswerRecord {
  /** ISO timestamp when the wrong answer was given */
  timestamp: string;
  /** The question text shown to the child */
  questionText: string;
  /** What the child answered */
  childAnswer: number;
  /** The correct answer */
  correctAnswer: number;
  /** Skill ID for grouping */
  skillId: string;
  /** Human-readable skill name */
  skillName: string;
}

/** Maximum wrong answer records to keep per child. */
const MAX_WRONG_ANSWERS = 50;

/** Only show mistakes from the last 30 days. */
export const WRONG_ANSWER_RETENTION_DAYS = 30;

export interface WrongAnswerHistorySlice {
  wrongAnswerHistory: WrongAnswerRecord[];
  addWrongAnswer: (record: WrongAnswerRecord) => void;
}

export const createWrongAnswerHistorySlice: StateCreator<
  AppState,
  [],
  [],
  WrongAnswerHistorySlice
> = (set) => ({
  wrongAnswerHistory: [],
  addWrongAnswer: (record) =>
    set((state) => ({
      wrongAnswerHistory: [record, ...state.wrongAnswerHistory].slice(
        0,
        MAX_WRONG_ANSWERS,
      ),
    })),
});
