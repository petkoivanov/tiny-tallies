import { mapPLToInitialBox } from '../services/adaptive/leitnerCalculator';

/**
 * Store migration functions for Zustand persist middleware.
 * Each STORE_VERSION bump must have a corresponding migration case.
 *
 * Migration chain: when adding v3, add `if (version < 3) { ... }` after the v2 block.
 */
export function migrateStore(
  persistedState: unknown,
  version: number,
): Record<string, unknown> {
  const state = (persistedState ?? {}) as Record<string, unknown>;

  if (version < 2) {
    // v1 -> v2: First persistence enablement.
    // Ensure all persisted fields exist with sensible defaults.
    state.childName ??= null;
    state.childAge ??= null;
    state.childGrade ??= null;
    state.avatarId ??= null;
    state.skillStates ??= {};
    state.xp ??= 0;
    state.level ??= 1;
    state.weeklyStreak ??= 0;
    state.lastSessionDate ??= null;
  }

  if (version < 3) {
    // v2 -> v3: Add BKT fields to existing skill states
    const skillStates = (state.skillStates ?? {}) as Record<
      string,
      Record<string, unknown>
    >;
    for (const skillId of Object.keys(skillStates)) {
      skillStates[skillId].masteryProbability ??= 0.1;
      skillStates[skillId].consecutiveWrong ??= 0;
      skillStates[skillId].masteryLocked ??= false;
    }
    state.skillStates = skillStates;
  }

  if (version < 4) {
    // v3 -> v4: Add Leitner spaced repetition fields to existing skill states
    const skillStates = (state.skillStates ?? {}) as Record<
      string,
      Record<string, unknown>
    >;
    for (const skillId of Object.keys(skillStates)) {
      const skill = skillStates[skillId];
      // BKT-informed initial box placement
      const masteryProbability = (skill.masteryProbability as number) ?? 0.1;
      skill.leitnerBox ??= mapPLToInitialBox(masteryProbability);
      skill.nextReviewDue ??= null; // null = immediately due for review
      skill.consecutiveCorrectInBox6 ??= 0;
    }
    state.skillStates = skillStates;
  }

  // Future migrations chain here:
  // if (version < 5) { ... }

  return state;
}
