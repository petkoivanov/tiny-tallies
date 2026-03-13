/**
 * Coordinate Geometry problem generators.
 * All generators use construction-from-answer pattern: pick the answer first,
 * then build the problem around it.
 *
 * Operand layout per generator:
 *
 * generateSlope:
 *   operands[0] = run/rise float (swapped ratio for coord_slope_swapped_rise_run bug)
 *   operands[1] = negative of correct slope float (for coord_slope_sign_error bug)
 *   operands[2] = correct slope float (informational)
 *
 * generateDistance:
 *   operands[0] = dx^2 + dy^2 (for coord_distance_forgot_sqrt bug)
 *   operands[1] = distance (correct)
 *   operands[2] = 0 (unused)
 *
 * generateMidpointX:
 *   operands[0] = wrong midpoint (off-by-one)
 *   operands[1] = correct midpoint x value
 *   operands[2] = 0 (unused)
 *
 * generateMidpointY:
 *   operands[0] = wrong midpoint (off-by-one)
 *   operands[1] = correct midpoint y value
 *   operands[2] = 0 (unused)
 *
 * generateLineYIntercept:
 *   operands[0] = b + m (wrong: added instead of read off)
 *   operands[1] = m (wrong: confused slope with intercept)
 *   operands[2] = b (correct)
 *
 * generateLineSlope:
 *   operands[0] = b (wrong: confused intercept with slope)
 *   operands[1] = m + b (wrong: added both)
 *   operands[2] = m (correct)
 */

import { gcd } from '../fractions/utils';
import { numericAnswer, fractionAnswer } from '../../types';
import type { DomainProblemData, FractionAnswer, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

// Pythagorean triples for integer distance generation
const PYTHAGOREAN_TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [6, 8, 10],
  [9, 12, 15],
  [5, 12, 13],
  [7, 24, 25],
  [20, 21, 29],
] as const;

/**
 * Reduces a fraction to lowest terms with positive denominator.
 * Returns { numerator, denominator } in reduced form.
 */
function reduceFraction(
  numerator: number,
  denominator: number,
): { numerator: number; denominator: number } {
  if (denominator === 0) {
    throw new Error('Cannot reduce fraction with zero denominator');
  }
  // Normalize sign: keep denominator positive
  if (denominator < 0) {
    numerator = -numerator;
    denominator = -denominator;
  }
  const common = gcd(Math.abs(numerator), denominator);
  return {
    numerator: numerator / common,
    denominator: denominator / common,
  };
}

/**
 * Compute the float value of a fraction.
 */
function fractionToFloat(frac: { numerator: number; denominator: number }): number {
  return frac.numerator / frac.denominator;
}

/**
 * Generate a slope problem.
 * Picks two points, computes slope as reduced fraction with positive denominator.
 * Avoids undefined slope (run = 0).
 */
export function generateSlope(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Pick rise and run directly (construction-from-answer)
  let rise = rng.intRange(-6, 6);
  let run = rng.intRange(-6, 6);

  // Avoid zero run (undefined slope); re-roll
  if (run === 0) run = 1;
  // Avoid zero rise (trivial horizontal slope) — allow it, horizontal slope = 0/1 is valid
  // But avoid 0/0 (already handled by run !== 0)

  // Compute starting point
  const x1 = rng.intRange(-5, 5);
  const y1 = rng.intRange(-5, 5);
  const x2 = x1 + run;
  const y2 = y1 + rise;

  // Reduce slope fraction
  const reduced = reduceFraction(rise, run);
  const correctAnswer: FractionAnswer = fractionAnswer(
    reduced.numerator,
    reduced.denominator,
  );

  // Compute distractor values
  const slopeFloat = fractionToFloat(reduced);
  const swappedRiseRun = run !== 0 ? fractionToFloat(reduceFraction(run, rise === 0 ? 1 : rise)) : 0;
  const negatedSlope = -slopeFloat;

  const questionText = `What is the slope of the line passing through (${x1}, ${y1}) and (${x2}, ${y2})?`;

  return {
    operands: [swappedRiseRun, negatedSlope, slopeFloat],
    correctAnswer,
    questionText,
    metadata: {},
  };
}

/**
 * Generate a distance problem using Pythagorean triples for integer answers.
 */
export function generateDistance(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Pick a random Pythagorean triple and scale factor
  const tripleIdx = rng.intRange(0, PYTHAGOREAN_TRIPLES.length - 1);
  const triple = PYTHAGOREAN_TRIPLES[tripleIdx];
  const scale = rng.intRange(1, 3);

  const dx = triple[0] * scale;
  const dy = triple[1] * scale;
  const distance = triple[2] * scale;

  // Place first point in a small range
  const x1 = rng.intRange(-3, 3);
  const y1 = rng.intRange(-3, 3);
  const x2 = x1 + dx;
  const y2 = y1 + dy;

  const dSquared = dx * dx + dy * dy; // forgot_sqrt bug value

  const questionText = `What is the distance between the points (${x1}, ${y1}) and (${x2}, ${y2})?`;

  return {
    operands: [dSquared, distance, 0],
    correctAnswer: numericAnswer(distance),
    questionText,
    metadata: {},
  };
}

/**
 * Generate a midpoint-x problem.
 * Uses construction-from-midpoint with same-parity for integer result.
 */
export function generateMidpointX(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Pick target midpoint x and half-spread dx
  const mx = rng.intRange(-5, 5);
  const dx = rng.intRange(1, 4);
  const x1 = mx - dx;
  const x2 = mx + dx;

  // Pick arbitrary y values
  const y1 = rng.intRange(-5, 5);
  const y2 = rng.intRange(-5, 5);

  // Wrong midpoint: off-by-one
  const wrongMidpoint = mx + 1;

  const questionText = `What is the x-coordinate of the midpoint of the segment from (${x1}, ${y1}) to (${x2}, ${y2})?`;

  return {
    operands: [wrongMidpoint, mx, 0],
    correctAnswer: numericAnswer(mx),
    questionText,
    metadata: {},
  };
}

/**
 * Generate a midpoint-y problem.
 * Uses construction-from-midpoint with same-parity for integer result.
 */
export function generateMidpointY(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Pick arbitrary x values
  const x1 = rng.intRange(-5, 5);
  const x2 = rng.intRange(-5, 5);

  // Pick target midpoint y and half-spread dy
  const my = rng.intRange(-5, 5);
  const dy = rng.intRange(1, 4);
  const y1 = my - dy;
  const y2 = my + dy;

  // Wrong midpoint: off-by-one
  const wrongMidpoint = my + 1;

  const questionText = `What is the y-coordinate of the midpoint of the segment from (${x1}, ${y1}) to (${x2}, ${y2})?`;

  return {
    operands: [wrongMidpoint, my, 0],
    correctAnswer: numericAnswer(my),
    questionText,
    metadata: {},
  };
}

/**
 * Generate a line y-intercept problem (y = mx + b form).
 * Picks integer m and b, asks for the y-intercept.
 */
export function generateLineYIntercept(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Pick non-zero slope m and intercept b
  let m = rng.intRange(-5, 5);
  if (m === 0) m = 1;
  const b = rng.intRange(-8, 8);

  // Distractor values
  let addedBM = b + m;  // wrong: added slope to intercept
  let slopeAsIntercept = m; // wrong: confused slope with intercept

  // Avoid distractors colliding with correct answer b
  if (addedBM === b) addedBM = b + 1;
  if (slopeAsIntercept === b) slopeAsIntercept = b - 1;

  const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
  const questionText = `A line has equation y = ${m}x ${bSign}. What is the y-intercept?`;

  return {
    operands: [addedBM, slopeAsIntercept, b],
    correctAnswer: numericAnswer(b),
    questionText,
    metadata: {},
  };
}

/**
 * Generate a line slope problem (y = mx + b form).
 * Picks integer slope m and intercept b, asks for the slope.
 */
export function generateLineSlope(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Pick non-zero slope m and intercept b
  let m = rng.intRange(-5, 5);
  if (m === 0) m = 1;
  const b = rng.intRange(-8, 8);

  // Distractor values
  let interceptAsSlope = b; // wrong: confused intercept with slope
  let addedMB = m + b;      // wrong: added both

  // Avoid distractors colliding with correct answer m
  if (interceptAsSlope === m) interceptAsSlope = m + 1;
  if (addedMB === m) addedMB = m - 1;

  const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
  const questionText = `A line has equation y = ${m}x ${bSign}. What is the slope?`;

  return {
    operands: [interceptAsSlope, addedMB, m],
    correctAnswer: numericAnswer(m),
    questionText,
    metadata: {},
  };
}
