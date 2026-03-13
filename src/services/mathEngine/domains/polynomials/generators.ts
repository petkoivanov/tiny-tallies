/**
 * Polynomials domain problem generators.
 * All generators use construction-from-answer pattern: compute answer first,
 * then build problem around it.
 *
 * Operand layouts per generator:
 *   foil_expansion:      [a, b, x, forgotMiddle]
 *   poly_evaluation:     [coeffA, coeffB, coeffC, evalX]
 *   gcf_factoring:       [gcf, innerA, innerB]
 *   diff_of_squares:     [b, 0, 0]
 *   combined_operations: [a, b, c, evalPoint]
 *   word_problem:        reuses poly_evaluation operand layout
 */

import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

/** Format a constant with sign prefix: "+ 3" or "- 2" */
function signedConst(n: number): string {
  return n >= 0 ? `+ ${n}` : `\u2212 ${Math.abs(n)}`;
}

/** Format a term with coefficient and variable: "+ 3x" or "- 2x" */
function signedTerm(coeff: number, variable: string): string {
  if (coeff === 0) return '';
  if (coeff === 1) return `+ ${variable}`;
  if (coeff === -1) return `\u2212 ${variable}`;
  return coeff > 0 ? `+ ${coeff}${variable}` : `\u2212 ${Math.abs(coeff)}${variable}`;
}

/**
 * FOIL Expansion.
 * Expand (x + a)(x + b) and evaluate at x.
 * answer = (x + a) * (x + b)
 * forgotMiddle = x*x + a*b (F+L only, missing OI middle terms)
 */
export function generateFoilExpansion(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  let a = rng.intRange(-5, 5);
  if (a === 0) a = 1;
  let b = rng.intRange(-5, 5);
  if (b === 0) b = -1;

  const x = rng.intRange(1, 4);
  const answer = (x + a) * (x + b);
  const forgotMiddle = x * x + a * b; // F+L only, missing O+I

  const questionText = `Expand (x ${signedConst(a)})(x ${signedConst(b)}) and evaluate at x = ${x}.`;

  return {
    operands: [a, b, x, forgotMiddle],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * Polynomial Evaluation.
 * Evaluate ax^2 + bx + c at x.
 */
export function generatePolyEvaluation(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const coeffA = rng.intRange(1, 5);
  const coeffB = rng.intRange(-8, 8);
  const coeffC = rng.intRange(-10, 10);
  const evalX = rng.intRange(-3, 5);

  const answer = coeffA * evalX * evalX + coeffB * evalX + coeffC;

  const bTerm = signedTerm(coeffB, 'x');
  const cPart = signedConst(coeffC);
  const questionText = `Evaluate ${coeffA}x\u00B2 ${bTerm} ${cPart} at x = ${evalX}.`;

  return {
    operands: [coeffA, coeffB, coeffC, evalX],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * GCF Factoring.
 * Factor gcf*innerA*x + gcf*innerB.
 * Answer = gcf (the greatest common factor).
 */
export function generateGcfFactoring(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const gcf = rng.intRange(2, 5);
  const innerA = rng.intRange(1, 4);
  const innerB = rng.intRange(1, 6);

  const product1 = gcf * innerA;
  const product2 = gcf * innerB;

  const questionText = `Factor ${product1}x + ${product2}. What is the GCF?`;

  return {
    operands: [gcf, innerA, innerB],
    correctAnswer: numericAnswer(gcf),
    questionText,
    metadata: {},
  };
}

/**
 * Difference of Squares.
 * Factor x^2 - b^2.
 * Answer = b (the constant in the factored form).
 */
export function generateDiffOfSquares(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const b = rng.intRange(2, 8);
  const bSquared = b * b;

  const questionText = `Factor x\u00B2 \u2212 ${bSquared}. What is the value of b in (x + b)(x \u2212 b)?`;

  return {
    operands: [b, 0, 0],
    correctAnswer: numericAnswer(b),
    questionText,
    metadata: {},
  };
}

/**
 * Combined Polynomial Operations.
 * Simplify (x + a)(x + b) + c and evaluate at x = evalPoint.
 */
export function generateCombinedOps(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  let a = rng.intRange(-4, 4);
  if (a === 0) a = 1;
  let b = rng.intRange(-4, 4);
  if (b === 0) b = -1;
  const c = rng.intRange(-5, 5);
  const evalPoint = rng.intRange(1, 4);

  const answer = (evalPoint + a) * (evalPoint + b) + c;

  const questionText = `Simplify (x ${signedConst(a)})(x ${signedConst(b)}) ${signedConst(c)} and evaluate at x = ${evalPoint}.`;

  return {
    operands: [a, b, c, evalPoint],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * Word Problem variant.
 * Reuses polynomial evaluation with a contextual question.
 * The prefix word problem system (Plan 03) will prepend context text.
 */
export function generateWordProblem(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  return generatePolyEvaluation(template, rng);
}
