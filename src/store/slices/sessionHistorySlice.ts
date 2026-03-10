import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';

/** Summary of a completed session, stored for parent reports. */
export interface SessionHistoryEntry {
  /** ISO timestamp when session completed */
  completedAt: string;
  /** Number of correct answers */
  score: number;
  /** Total number of problems */
  total: number;
  /** XP earned this session */
  xpEarned: number;
  /** Duration in milliseconds */
  durationMs: number;
  /** Session mode */
  mode: 'standard' | 'remediation' | 'challenge';
  /** Distinct skill IDs practiced */
  skillIds: string[];
}

/** Maximum number of session history entries to keep per child. */
const MAX_SESSION_HISTORY = 50;

export interface SessionHistorySlice {
  sessionHistory: SessionHistoryEntry[];
  addSessionHistory: (entry: SessionHistoryEntry) => void;
}

export const createSessionHistorySlice: StateCreator<
  AppState,
  [],
  [],
  SessionHistorySlice
> = (set) => ({
  sessionHistory: [],
  addSessionHistory: (entry) =>
    set((state) => ({
      sessionHistory: [entry, ...state.sessionHistory].slice(
        0,
        MAX_SESSION_HISTORY,
      ),
    })),
});
