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

  // Future migrations chain here:
  // if (version < 3) { ... }

  return state;
}
