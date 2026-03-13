/**
 * Systems of Equations problem generators.
 * All generators use construction-from-answer pattern: pick (x, y) first,
 * then build equations around them.
 *
 * Operand layout (all generators):
 *   operands[0] = swappedAnswer (the y-value for this problem)
 *   operands[1] = signFlippedAnswer (-x, sign error)
 *   operands[2] = x (correct answer, redundant but explicit)
 */

import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

/**
 * Substitution — Variable Already Isolated.
 * Eq1: y = mx + b  (y already isolated)
 * Eq2: dx + ey = f
 * Asks for x.
 *
 * Overflow guards: x,y ∈ [1,8], m ∈ [1,3], d,e ∈ [1,4]
 * Max f = 4*8 + 4*8 = 64 (safe)
 */
export function generateSubstitutionSimple(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const x = rng.intRange(1, 8);
  const y = rng.intRange(1, 8);

  const m = rng.intRange(1, 3);
  const b = y - m * x; // derived — ensures eq1 is satisfied

  const d = rng.intRange(1, 4);
  const e = rng.intRange(1, 4);
  const f = d * x + e * y;

  // Distractors
  const swappedAnswer = y;
  const signFlippedAnswer = -x;

  // Guard negative b display
  const bDisplay = b >= 0 ? `+ ${b}` : `\u2212 ${Math.abs(b)}`;

  const questionText = `y = ${m}x ${bDisplay}\n${d}x + ${e}y = ${f}\nSolve for x.`;

  return {
    operands: [swappedAnswer, signFlippedAnswer, x],
    correctAnswer: numericAnswer(x),
    questionText,
    metadata: {},
  };
}

/**
 * Substitution — Isolate Then Substitute.
 * Two general equations: ax + by = c1, dx + ey = c2
 * Asks for x.
 *
 * Overflow guards: x,y ∈ [1,8], a,b,d,e ∈ [1,4]
 * Max constant = 4*8 + 4*8 = 64 (safe)
 */
export function generateSubstitutionGeneral(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const x = rng.intRange(1, 8);
  const y = rng.intRange(1, 8);

  const a = rng.intRange(1, 4);
  const b = rng.intRange(1, 4);
  let d = rng.intRange(1, 4);
  const e = rng.intRange(1, 4);

  // Ensure non-proportional: d !== a
  if (d === a) d = (d % 4) + 1;

  const c1 = a * x + b * y;
  const c2 = d * x + e * y;

  const swappedAnswer = y;
  const signFlippedAnswer = -x;

  const questionText = `${a}x + ${b}y = ${c1}\n${d}x + ${e}y = ${c2}\nSolve for x.`;

  return {
    operands: [swappedAnswer, signFlippedAnswer, x],
    correctAnswer: numericAnswer(x),
    questionText,
    metadata: {},
  };
}

/**
 * Elimination — Direct Addition.
 * Eq1: ax + ky = c1
 * Eq2: dx − ky = c2  (opposite coefficient on y — adding cancels y)
 * Asks for x.
 *
 * Overflow guards: x,y ∈ [1,8], a,d ∈ [1,4], k ∈ [1,4]
 */
export function generateEliminationAdd(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const x = rng.intRange(1, 8);
  const y = rng.intRange(1, 8);

  const a = rng.intRange(1, 4);
  let d = rng.intRange(1, 4);
  if (d === a) d = (d % 4) + 1; // ensure d !== a (non-proportional)

  const k = rng.intRange(1, 4);
  const c1 = a * x + k * y;
  const c2 = d * x - k * y;

  const swappedAnswer = y;
  const signFlippedAnswer = -x;

  const questionText = `${a}x + ${k}y = ${c1}\n${d}x \u2212 ${k}y = ${c2}\nSolve for x.`;

  return {
    operands: [swappedAnswer, signFlippedAnswer, x],
    correctAnswer: numericAnswer(x),
    questionText,
    metadata: {},
  };
}

/**
 * Elimination — Multiply to Align.
 * Eq1: a1*x + b1*y = c1
 * Eq2: a2*x + b2*y = c2
 * Student must multiply one equation by a scalar to align coefficients.
 * Asks for x.
 *
 * Overflow guards: x,y ∈ [1,8], a1,b1,a2,b2 ∈ [1,4]
 * Max constant after multiply: 4*(4*8 + 4*8) = 256 (safe)
 */
export function generateEliminationMultiply(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const x = rng.intRange(1, 8);
  const y = rng.intRange(1, 8);

  const a1 = rng.intRange(1, 4);
  const b1 = rng.intRange(1, 4);
  let a2 = rng.intRange(1, 4);
  const b2 = rng.intRange(1, 4);

  // Ensure a1 !== a2 (non-proportional)
  if (a2 === a1) a2 = (a2 % 4) + 1;

  const c1 = a1 * x + b1 * y;
  const c2 = a2 * x + b2 * y;

  const swappedAnswer = y;
  const signFlippedAnswer = -x;

  const questionText = `${a1}x + ${b1}y = ${c1}\n${a2}x + ${b2}y = ${c2}\nSolve for x (multiply one equation to align coefficients).`;

  return {
    operands: [swappedAnswer, signFlippedAnswer, x],
    correctAnswer: numericAnswer(x),
    questionText,
    metadata: {},
  };
}

/**
 * Word problem variant — reuses substitution_simple generator.
 * The prefix word problem template prepends context text;
 * the generator only needs to produce valid operands/answer.
 */
export function generateWordProblemVariant(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  return generateSubstitutionSimple(template, rng);
}
