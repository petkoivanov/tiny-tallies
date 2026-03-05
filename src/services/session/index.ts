// Types
export type {
  SessionPhase,
  SessionConfig,
  SessionProblem,
  SessionMode,
  PendingSkillUpdate,
  SessionResult,
  SessionFeedback,
  PracticeProblemCategory,
  PracticeSlotCounts,
} from './sessionTypes';

export { DEFAULT_SESSION_CONFIG, REMEDIATION_SESSION_CONFIG, CHALLENGE_SESSION_CONFIG } from './sessionTypes';

// Orchestrator
export {
  getSessionPhase,
  selectStrongestSkill,
  selectEasiestTemplate,
  generateSessionQueue,
  commitSessionResults,
  STRENGTH_BASELINE,
} from './sessionOrchestrator';

// Practice Mix
export {
  computeSlotCounts,
  buildReviewPool,
  buildNewSkillPool,
  buildChallengePool,
  selectFromPool,
  selectRemediationSkillIds,
  generatePracticeMix,
  constrainedShuffle,
} from './practiceMix';
