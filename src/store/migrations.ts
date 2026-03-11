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

  // Fast path: skip all checks when store is already current
  if (version >= 21) return state;

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
    state.tutorConsentGranted ??= true;
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

  if (version < 14) {
    // v13 -> v14: Add auth state fields
    state.userId ??= null;
    state.authProvider ??= null;
    state.userEmail ??= null;
    state.userDisplayName ??= null;
    state.isSignedIn ??= false;
  }

  if (version < 15) {
    // v14 -> v15: Add session history for parent reports
    state.sessionHistory ??= [];
  }

  if (version < 16) {
    // v15 -> v16: Add onboarding/placement state
    state.placementComplete ??= false;
    state.placementGrade ??= null;
    state.placementTheta ??= null;
    state.lastPlacementDate ??= null;
    state.lastPracticeDate ??= null;
  }

  if (version < 17) {
    // v16 -> v17: Add sound preference to child profile
    state.soundEnabled ??= true;
  }

  if (version < 18) {
    // v17 -> v18: Add parental time controls
    state.dailyLimitMinutes ??= 0;
    state.bedtimeWindow ??= null;
    state.breakReminderMinutes ??= 0;
  }

  if (version < 19) {
    // v18 -> v19: Add peer benchmarking demographics
    state.ageRange ??= null;
    state.stateCode ??= null;
    state.benchmarkOptIn ??= true;
  }

  if (version < 20) {
    // v19 -> v20: Add wrong answer history for parent review
    state.wrongAnswerHistory ??= [];
  }

  if (version < 21) {
    // v20 -> v21: Add daily practice reminder (device-level)
    state.reminderEnabled ??= true;
    state.reminderTime ??= '17:00';
  }

  // Future migrations chain here:
  // if (version < 22) { ... }

  return state;
}
