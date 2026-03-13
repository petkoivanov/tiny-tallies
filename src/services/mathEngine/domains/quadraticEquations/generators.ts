/**
 * Quadratic Equations problem generators.
 * All generators use construction-from-answer pattern: pick r1, r2 integer
 * roots first, then build the quadratic equation around them.
 *
 * Operand layout (all generators):
 *   operands[0] = wrongSignR1 (-r1, sign error distractor)
 *   operands[1] = wrongSignR2 (-r2, sign error distractor)
 *   operands[2] = r1 + r2 (sum of roots)
 *   operands[3] = r1 * r2 (product of roots)
 *
 * All generators return MultiSelectAnswer with [r1, r2] as the correct answer.
 * Unicode minus U+2212 (\u2212) used for display to avoid "+-" sequences.
 */

import { multiSelectAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

/** Guard negative coefficient display: avoids "x^2 + -3x" */
function signedCoeff(value: number, varName: string): string {
  if (value === 0) return '';
  if (value === 1) return `+ ${varName}`;
  if (value === -1) return `\u2212 ${varName}`;
  if (value > 0) return `+ ${value}${varName}`;
  return `\u2212 ${Math.abs(value)}${varName}`;
}

/** Guard constant display */
function signedConst(value: number): string {
  if (value === 0) return '';
  if (value > 0) return `+ ${value}`;
  return `\u2212 ${Math.abs(value)}`;
}

/** Build standard operands + answer from two roots */
function buildResult(
  r1: number,
  r2: number,
  questionText: string,
): DomainProblemData {
  const wrongSignR1 = -r1;
  const wrongSignR2 = -r2;
  const sum = r1 + r2;
  const product = r1 * r2;

  return {
    operands: [wrongSignR1, wrongSignR2, sum, product],
    correctAnswer: multiSelectAnswer([r1, r2]),
    questionText,
    metadata: {},
  };
}

/**
 * Pick two distinct integers in [min, max] ensuring r1 !== r2.
 */
function pickDistinctRoots(
  rng: SeededRng,
  min: number,
  max: number,
): [number, number] {
  const r1 = rng.intRange(min, max);
  let r2 = rng.intRange(min, max);
  // Ensure distinct roots
  while (r2 === r1) {
    r2 = rng.intRange(min, max);
  }
  return [r1, r2];
}

/**
 * Factoring Monic Quadratics: x^2 + bx + c = 0
 * r1, r2 in [-8, 8], distinct.
 * Equation: x^2 - (r1+r2)x + r1*r2 = 0
 */
export function generateFactoringMonic(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const [r1, r2] = pickDistinctRoots(rng, -8, 8);

  const b = -(r1 + r2);
  const c = r1 * r2;

  const questionText =
    `x\u00B2 ${signedCoeff(b, 'x')} ${signedConst(c)} = 0\nFind both roots.`;

  return buildResult(r1, r2, questionText);
}

/**
 * Factoring with Leading Coefficient: ax^2 + bx + c = 0
 * a in [2, 3], r1, r2 in [-6, 6], distinct.
 * Equation: a(x - r1)(x - r2) = ax^2 - a(r1+r2)x + a*r1*r2
 */
export function generateFactoringLeadingCoeff(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const a = rng.intRange(2, 3);
  const [r1, r2] = pickDistinctRoots(rng, -6, 6);

  const bCoeff = -a * (r1 + r2);
  const cCoeff = a * r1 * r2;

  const questionText =
    `${a}x\u00B2 ${signedCoeff(bCoeff, 'x')} ${signedConst(cCoeff)} = 0\nFind both roots.`;

  return buildResult(r1, r2, questionText);
}

/**
 * Quadratic Formula Simple: x^2 + bx + c = 0, framed as
 * "Use the quadratic formula to solve."
 * Same construction as monic but different prompt.
 */
export function generateQuadraticFormulaSimple(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const [r1, r2] = pickDistinctRoots(rng, -8, 8);

  const b = -(r1 + r2);
  const c = r1 * r2;

  const questionText =
    `x\u00B2 ${signedCoeff(b, 'x')} ${signedConst(c)} = 0\nUse the quadratic formula. Find both roots.`;

  return buildResult(r1, r2, questionText);
}

/**
 * Quadratic Formula Rational: larger range r1, r2 in [-10, 10].
 * Same monic construction but bigger numbers.
 */
export function generateQuadraticFormulaRational(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const [r1, r2] = pickDistinctRoots(rng, -10, 10);

  const b = -(r1 + r2);
  const c = r1 * r2;

  const questionText =
    `x\u00B2 ${signedCoeff(b, 'x')} ${signedConst(c)} = 0\nUse the quadratic formula. Find both roots.`;

  return buildResult(r1, r2, questionText);
}

/**
 * Completing the Square: x^2 + bx + c = 0
 * Even b coefficient for clean half-value, r1 + r2 must be even.
 * Pick r1, r2 in [-8, 8] with r1 + r2 even.
 */
export function generateCompletingTheSquare(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  let r1: number, r2: number;
  do {
    [r1, r2] = pickDistinctRoots(rng, -8, 8);
  } while ((r1 + r2) % 2 !== 0);

  const b = -(r1 + r2);
  const c = r1 * r2;

  const questionText =
    `x\u00B2 ${signedCoeff(b, 'x')} ${signedConst(c)} = 0\nComplete the square. Find both roots.`;

  return buildResult(r1, r2, questionText);
}

/**
 * Word Problem Variant: reuses generateFactoringMonic, appends context sentence.
 * The prefix word problem template prepends context text;
 * the generator adds a context sentence to the question.
 */
export function generateWordProblemVariant(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const result = generateFactoringMonic(template, rng);
  const contextSentences = [
    'A ball is thrown upward. Its height h in meters after t seconds is given by the equation below. Find the times when the ball is at ground level.',
    'The area of a rectangular garden is modeled by the equation below. Find the possible lengths.',
    'A projectile follows the path described below. Find the times when it hits the ground.',
    'The profit from selling x items is modeled by the equation below. Find the break-even points.',
  ];
  const contextIndex = rng.intRange(0, contextSentences.length - 1);
  result.questionText = `${contextSentences[contextIndex]}\n${result.questionText}`;
  return result;
}
