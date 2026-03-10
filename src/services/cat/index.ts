export type {
  IrtItem,
  CatResponse,
  CatState,
  CatConfig,
  EapResult,
  ItemSelectionResult,
} from './types';

export { icc, fisherInformation, logLikelihood } from './irt2pl';
export { estimateAbility } from './eapEstimator';
export { selectNextItem } from './itemSelector';
export {
  createCatSession,
  getNextItem,
  recordResponse,
  getCatResults,
} from './catEngine';
export { buildItemBank, buildItemBankForGrades } from './itemBank';
export {
  thetaToElo,
  computePlacementElos,
  computeUnlockedSkills,
} from './placementMapper';
export {
  calculateAbsenceDecay,
  daysSince,
  shouldSuggestReassessment,
} from './absenceDecay';
export type { DecayInput, DecayResult } from './absenceDecay';
