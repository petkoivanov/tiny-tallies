import type { FrustrationState } from './types';

/**
 * Number of consecutive wrong answers per skill before the frustration guard triggers.
 * When triggered, the session flow should offer easier problems or scaffolding.
 */
export const FRUSTRATION_THRESHOLD = 3;

/**
 * Creates a new empty frustration state for a session.
 * Frustration state is session-scoped and ephemeral -- it is NOT persisted in the store.
 */
export function createFrustrationState(): FrustrationState {
  return { consecutiveWrong: {} };
}

/**
 * Returns a new FrustrationState after recording an answer result for a skill.
 *
 * - correct=true: removes the skill from the consecutiveWrong map (resets counter)
 * - correct=false: increments the skill's consecutive wrong count (or sets to 1 if absent)
 *
 * This function is pure -- it never mutates the input state.
 *
 * @param state   - Current frustration state
 * @param skillId - The skill the answer was for
 * @param correct - Whether the answer was correct
 * @returns New FrustrationState
 */
export function updateFrustrationState(
  state: FrustrationState,
  skillId: string,
  correct: boolean,
): FrustrationState {
  if (correct) {
    const { [skillId]: _, ...rest } = state.consecutiveWrong;
    return { consecutiveWrong: rest };
  }
  return {
    consecutiveWrong: {
      ...state.consecutiveWrong,
      [skillId]: (state.consecutiveWrong[skillId] ?? 0) + 1,
    },
  };
}

/**
 * Returns true when the student has answered >= FRUSTRATION_THRESHOLD consecutive
 * wrong answers for the given skill, indicating the guard should activate.
 *
 * Returns false for unknown skills (no data in state).
 *
 * @param state   - Current frustration state
 * @param skillId - The skill to check
 * @returns Whether the frustration guard should trigger
 */
export function shouldTriggerGuard(
  state: FrustrationState,
  skillId: string,
): boolean {
  return (state.consecutiveWrong[skillId] ?? 0) >= FRUSTRATION_THRESHOLD;
}
