import type { CpaStage } from './cpaTypes';
import { CPA_CONCRETE_THRESHOLD, CPA_ABSTRACT_THRESHOLD } from './cpaTypes';

/** Numeric ordering for CPA stages (used for one-way advance comparison) */
const STAGE_ORDER: Record<CpaStage, number> = {
  concrete: 0,
  pictorial: 1,
  abstract: 2,
} as const;

/** Reverse lookup from numeric order to CPA stage */
const ORDER_TO_STAGE: Record<number, CpaStage> = {
  0: 'concrete',
  1: 'pictorial',
  2: 'abstract',
} as const;

/**
 * Derives the CPA stage from a mastery probability value.
 *
 * Pure function -- no side effects, no store dependency.
 *
 * Thresholds (locked per user decision):
 * - P(L) < 0.40  -> concrete
 * - 0.40 <= P(L) < 0.85 -> pictorial
 * - P(L) >= 0.85 -> abstract
 */
export function deriveCpaStage(masteryProbability: number): CpaStage {
  if (masteryProbability < CPA_CONCRETE_THRESHOLD) {
    return 'concrete';
  }
  if (masteryProbability < CPA_ABSTRACT_THRESHOLD) {
    return 'pictorial';
  }
  return 'abstract';
}

/**
 * Advances CPA stage with one-way constraint (never regresses).
 *
 * Once a child reaches pictorial, they NEVER drop back to concrete.
 * Once a child reaches abstract, they NEVER drop back.
 *
 * Returns max(currentStage, derivedStage) by stage order.
 */
export function advanceCpaStage(
  currentStage: CpaStage,
  newMasteryProbability: number,
): CpaStage {
  const derivedStage = deriveCpaStage(newMasteryProbability);
  const currentOrder = STAGE_ORDER[currentStage];
  const derivedOrder = STAGE_ORDER[derivedStage];

  return ORDER_TO_STAGE[Math.max(currentOrder, derivedOrder)];
}
