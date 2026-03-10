/**
 * EAP (Expected A Posteriori) ability estimator using Gaussian quadrature.
 *
 * EAP computes the posterior mean of theta given responses:
 *   theta_hat = integral(theta * L(theta) * prior(theta)) / integral(L(theta) * prior(theta))
 *
 * Uses a grid of quadrature points over the ability range [-4, 4].
 * Prior is normal(0, priorSd²).
 */

import type { CatResponse, EapResult } from './types';
import { icc } from './irt2pl';

/** Default number of quadrature points */
const DEFAULT_QUAD_POINTS = 49;

/** Ability range for quadrature */
const THETA_MIN = -4;
const THETA_MAX = 4;

/**
 * Normal PDF (unnormalized — constant factor cancels in EAP ratio).
 */
function normalPdf(x: number, mean: number, sd: number): number {
  const z = (x - mean) / sd;
  return Math.exp(-0.5 * z * z);
}

/**
 * Compute likelihood of all responses at a given theta.
 * L(theta) = product of P(correct_i | theta) for each response.
 * Uses log-sum for numerical stability.
 */
function logLikelihoodAll(theta: number, responses: CatResponse[]): number {
  let ll = 0;
  for (const r of responses) {
    const p = icc(theta, r.item);
    const pClamped = Math.max(1e-10, Math.min(1 - 1e-10, p));
    ll += r.correct ? Math.log(pClamped) : Math.log(1 - pClamped);
  }
  return ll;
}

/**
 * EAP estimation via Gaussian quadrature.
 *
 * Returns the posterior mean (theta estimate) and standard error.
 */
export function estimateAbility(
  responses: CatResponse[],
  priorSd: number = 1.0,
  numPoints: number = DEFAULT_QUAD_POINTS,
): EapResult {
  if (responses.length === 0) {
    return { theta: 0, standardError: priorSd };
  }

  const step = (THETA_MAX - THETA_MIN) / (numPoints - 1);

  let numerator = 0;
  let denominator = 0;
  let secondMoment = 0;

  // Find max log-likelihood for numerical stability
  let maxLL = -Infinity;
  const logLikelihoods: number[] = [];
  for (let i = 0; i < numPoints; i++) {
    const theta = THETA_MIN + i * step;
    const ll = logLikelihoodAll(theta, responses);
    logLikelihoods.push(ll);
    if (ll > maxLL) maxLL = ll;
  }

  for (let i = 0; i < numPoints; i++) {
    const theta = THETA_MIN + i * step;
    const prior = normalPdf(theta, 0, priorSd);
    // Subtract maxLL for numerical stability (cancels in ratio)
    const likelihood = Math.exp(logLikelihoods[i] - maxLL);
    const posterior = likelihood * prior;

    numerator += theta * posterior;
    secondMoment += theta * theta * posterior;
    denominator += posterior;
  }

  if (denominator === 0) {
    return { theta: 0, standardError: priorSd };
  }

  const thetaHat = numerator / denominator;
  const variance = secondMoment / denominator - thetaHat * thetaHat;
  const se = Math.sqrt(Math.max(0, variance));

  return {
    theta: thetaHat,
    standardError: se,
  };
}
