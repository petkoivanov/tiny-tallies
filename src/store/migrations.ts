import * as Crypto from 'expo-crypto';

import { mapPLToInitialBox } from '../services/adaptive/leitnerCalculator';
import { deriveCpaStage } from '../services/cpa/cpaMappingService';
import { CHILD_DATA_KEYS } from './helpers/childDataHelpers';

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

  if (version < 5) {
    // v4 -> v5: Add CPA level to existing skill states with BKT-informed placement
    const skillStates = (state.skillStates ?? {}) as Record<
      string,
      Record<string, unknown>
    >;
    for (const skillId of Object.keys(skillStates)) {
      const skill = skillStates[skillId];
      const masteryProbability = (skill.masteryProbability as number) ?? 0.1;
      skill.cpaLevel ??= deriveCpaStage(masteryProbability);
    }
    state.skillStates = skillStates;
  }

  if (version < 6) {
    // v5 -> v6: Add parental consent flag for AI tutor
    state.tutorConsentGranted ??= false;
  }

  if (version < 7) {
    // v6 -> v7: Add misconception tracking store
    state.misconceptions ??= {};
  }

  if (version < 8) {
    // v7 -> v8: Add remediationCorrectCount to existing misconception records
    const misconceptions = (state.misconceptions ?? {}) as Record<
      string,
      Record<string, unknown>
    >;
    for (const key of Object.keys(misconceptions)) {
      misconceptions[key].remediationCorrectCount ??= 0;
    }
    state.misconceptions = misconceptions;
  }

  if (version < 9) {
    // v8 -> v9: Add achievement system fields
    state.earnedBadges ??= {};
    state.sessionsCompleted ??= 0;
  }

  if (version < 10) {
    // v9 -> v10: Add daily challenge tracking fields
    state.challengeCompletions ??= {};
    state.challengesCompleted ??= 0;
  }

  if (version < 11) {
    // v10 -> v11: Add avatar frame support
    state.frameId ??= null;
  }

  if (version < 12) {
    // v11 -> v12: Add theme selection to child profile
    state.themeId ??= 'dark';
  }

  if (version < 13) {
    // v12 -> v13: Restructure flat state into multi-child map
    const childData: Record<string, unknown> = {};
    for (const key of CHILD_DATA_KEYS) {
      childData[key] = state[key];
    }
    const childId = Crypto.randomUUID();
    state.children = { [childId]: childData };
    state.activeChildId = childId;
    state._needsMigrationPrompt = true;
    // Flat fields remain for immediate hydration after migration
  }

  // Future migrations chain here:
  // if (version < 14) { ... }

  return state;
}
