/**
 * CAT Engine — orchestrates the full computerized adaptive testing flow.
 *
 * Manages session state, delegates to IRT model, EAP estimator,
 * and Fisher information item selector. Implements stopping rules.
 */

import type {
  IrtItem,
  CatState,
  CatConfig,
  ItemSelectionResult,
} from './types';
import { estimateAbility } from './eapEstimator';
import { selectNextItem } from './itemSelector';

/** Default configuration values */
const DEFAULTS: Required<CatConfig> = {
  initialTheta: 0,
  seThreshold: 0.30,
  maxItems: 20,
  minItems: 5,
  numQuadraturePoints: 49,
  priorSd: 1.0,
};

/**
 * Create a new CAT session state.
 */
export function createCatSession(config?: CatConfig): CatState {
  const c = { ...DEFAULTS, ...config };
  return {
    theta: c.initialTheta,
    standardError: c.priorSd,
    responses: [],
    administeredIds: new Set(),
    terminated: false,
  };
}

/**
 * Get the next item to administer.
 *
 * Returns null if the test should terminate (stopping rule met).
 */
export function getNextItem(
  state: CatState,
  itemPool: readonly IrtItem[],
  config?: CatConfig,
): ItemSelectionResult | null {
  const c = { ...DEFAULTS, ...config };

  // Check stopping rules
  if (state.terminated) return null;

  if (state.responses.length >= c.maxItems) {
    state.terminated = true;
    state.terminationReason = 'max_items';
    return null;
  }

  if (
    state.responses.length >= c.minItems &&
    state.standardError <= c.seThreshold
  ) {
    state.terminated = true;
    state.terminationReason = 'se_threshold';
    return null;
  }

  const result = selectNextItem(itemPool, state);
  if (!result) {
    state.terminated = true;
    state.terminationReason = 'no_items';
    return null;
  }

  return result;
}

/**
 * Record a response and update the ability estimate.
 *
 * Returns the updated CAT state (mutated in place for efficiency).
 */
export function recordResponse(
  state: CatState,
  item: IrtItem,
  correct: boolean,
  config?: CatConfig,
): CatState {
  const c = { ...DEFAULTS, ...config };

  state.responses.push({ item, correct });
  state.administeredIds.add(item.id);

  // Re-estimate ability using EAP
  const eap = estimateAbility(
    state.responses,
    c.priorSd,
    c.numQuadraturePoints,
  );
  state.theta = eap.theta;
  state.standardError = eap.standardError;

  return state;
}

/**
 * Get a summary of the CAT session results.
 */
export function getCatResults(state: CatState) {
  const totalItems = state.responses.length;
  const correctCount = state.responses.filter((r) => r.correct).length;

  // Compute per-domain ability estimates from responses
  const domainResponses = new Map<string, { correct: number; total: number }>();
  for (const r of state.responses) {
    const op = r.item.operation;
    const entry = domainResponses.get(op) ?? { correct: 0, total: 0 };
    entry.total++;
    if (r.correct) entry.correct++;
    domainResponses.set(op, entry);
  }

  // Grade-level estimation: find the highest grade where accuracy >= 60%
  const gradeAccuracy = new Map<number, { correct: number; total: number }>();
  for (const r of state.responses) {
    const g = r.item.grade;
    const entry = gradeAccuracy.get(g) ?? { correct: 0, total: 0 };
    entry.total++;
    if (r.correct) entry.correct++;
    gradeAccuracy.set(g, entry);
  }

  let estimatedGrade = 1;
  for (let g = 1; g <= 8; g++) {
    const entry = gradeAccuracy.get(g);
    if (entry && entry.total >= 1 && entry.correct / entry.total >= 0.6) {
      estimatedGrade = g;
    }
  }

  return {
    theta: state.theta,
    standardError: state.standardError,
    totalItems,
    correctCount,
    accuracy: totalItems > 0 ? correctCount / totalItems : 0,
    estimatedGrade,
    domainAccuracy: Object.fromEntries(domainResponses),
    terminationReason: state.terminationReason,
  };
}
