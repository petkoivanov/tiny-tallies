// Types
export type {
  EloUpdateResult,
  FrustrationState,
  WeightedTemplate,
  SkillWeight,
} from './types';

// Elo Calculator
export {
  expectedScore,
  getKFactor,
  calculateEloUpdate,
  ELO_MIN,
  ELO_MAX,
} from './eloCalculator';

// Frustration Guard
export {
  createFrustrationState,
  updateFrustrationState,
  shouldTriggerGuard,
  FRUSTRATION_THRESHOLD,
} from './frustrationGuard';

// Prerequisite Gating
export {
  isSkillUnlocked,
  getUnlockedSkills,
  UNLOCK_THRESHOLD,
} from './prerequisiteGating';

// Problem Selector
export {
  weightBySuccessProbability,
  weightedRandomSelect,
  selectTemplateForSkill,
  TARGET_SUCCESS,
  SIGMA,
} from './problemSelector';

// Skill Selector
export {
  weightSkillsByWeakness,
  selectSkill,
  WEAKNESS_BASELINE,
} from './skillSelector';

// XP Calculator
export { calculateXp, BASE_XP } from './xpCalculator';

// BKT Types
export type { BktParams, BktUpdateResult } from './bktTypes';

// BKT Calculator
export {
  updateBktMastery,
  getBktParams,
  DEFAULT_BKT_PARAMS,
  BKT_MASTERY_THRESHOLD,
  BKT_RETEACH_THRESHOLD,
  applySoftMasteryLock,
  MASTERY_LOCK_BREAK_COUNT,
} from './bktCalculator';

// BKT Mastery Lock Result type
export type { MasteryLockResult } from './bktCalculator';

// Leitner Types
export type {
  LeitnerBox,
  LeitnerTransitionResult,
  LeitnerReviewStatus,
} from './leitnerTypes';

// Leitner Calculator
export {
  LEITNER_INTERVALS,
  GRADUATED_REVIEW_INTERVAL_MS,
  getAgeIntervalBracket,
  getIntervalMs,
  computeNextReviewDue,
  transitionBox,
  getReviewStatus,
  mapPLToInitialBox,
} from './leitnerCalculator';
