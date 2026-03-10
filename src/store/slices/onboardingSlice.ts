/**
 * Onboarding slice — tracks placement test completion and onboarding state.
 *
 * Persisted per-child via the child data helpers system.
 */

import type { StateCreator } from 'zustand';

export interface OnboardingSlice {
  /** Whether the placement test has been completed */
  placementComplete: boolean;
  /** Estimated grade from placement test (1-8) */
  placementGrade: number | null;
  /** Theta estimate from CAT session */
  placementTheta: number | null;
  /** ISO timestamp of last placement test */
  lastPlacementDate: string | null;
  /** ISO timestamp of last practice session (for absence decay) */
  lastPracticeDate: string | null;

  /** Mark placement test as complete */
  completePlacement: (grade: number, theta: number) => void;
  /** Record practice session timestamp */
  recordPractice: () => void;
  /** Reset onboarding state */
  resetOnboarding: () => void;
}

const INITIAL_STATE = {
  placementComplete: false,
  placementGrade: null,
  placementTheta: null,
  lastPlacementDate: null,
  lastPracticeDate: null,
};

export const createOnboardingSlice: StateCreator<
  OnboardingSlice,
  [],
  [],
  OnboardingSlice
> = (set) => ({
  ...INITIAL_STATE,
  completePlacement: (grade, theta) =>
    set({
      placementComplete: true,
      placementGrade: grade,
      placementTheta: theta,
      lastPlacementDate: new Date().toISOString(),
    }),
  recordPractice: () =>
    set({ lastPracticeDate: new Date().toISOString() }),
  resetOnboarding: () => set(INITIAL_STATE),
});
