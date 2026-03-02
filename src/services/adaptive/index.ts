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
