/**
 * IRT 2PL (Two-Parameter Logistic) model functions.
 *
 * The 2PL model gives P(correct | theta, a, b) = 1 / (1 + exp(-a(theta - b)))
 * where:
 *   theta = student ability
 *   a = item discrimination (slope)
 *   b = item difficulty (location)
 */

import type { IrtItem } from './types';

/**
 * Item Characteristic Curve — probability of correct response.
 * P(theta) = 1 / (1 + exp(-a * (theta - b)))
 */
export function icc(theta: number, item: IrtItem): number {
  const exponent = -item.discrimination * (theta - item.difficulty);
  return 1 / (1 + Math.exp(exponent));
}

/**
 * Fisher information for a single item at ability theta.
 * I(theta) = a² * P(theta) * Q(theta)
 * where Q(theta) = 1 - P(theta)
 *
 * Maximum information occurs when theta = b (where P = 0.5).
 */
export function fisherInformation(theta: number, item: IrtItem): number {
  const p = icc(theta, item);
  const q = 1 - p;
  return item.discrimination * item.discrimination * p * q;
}

/**
 * Log-likelihood of a single response.
 * L = correct ? log(P) : log(1 - P)
 */
export function logLikelihood(
  theta: number,
  item: IrtItem,
  correct: boolean,
): number {
  const p = icc(theta, item);
  // Clamp to avoid log(0)
  const pClamped = Math.max(1e-10, Math.min(1 - 1e-10, p));
  return correct ? Math.log(pClamped) : Math.log(1 - pClamped);
}
