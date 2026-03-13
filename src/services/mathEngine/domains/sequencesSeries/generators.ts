/**
 * Sequences & Series problem generators.
 * All generators use construction-from-answer pattern: pick the answer first,
 * then build the problem around it.
 *
 * Operand layout per generator:
 *
 * generateArithmeticNextTerm:
 *   operands[0] = wrongStep: seq[terms-1] + (d+1)  — incremented common difference
 *   operands[1] = wrongIndex: a1 + (terms-1)*d      — last displayed term (off-by-one)
 *
 * generateArithmeticNthTerm:
 *   operands[0] = wrongNoSubtract: a1 + n*d         — used n instead of (n-1)
 *   operands[1] = wrongJustD: a1 + d                — only one step from first term
 *
 * generateGeometricNextTerm:
 *   operands[0] = wrongArithmetic: seq[terms-1] + r — added ratio instead of multiplied
 *   operands[1] = wrongIndex: a1 * r^(terms-1)      — last shown term repeated
 *
 * generateGeometricNthTerm:
 *   operands[0] = wrongArithmetic: a1 + (n-1)*r    — added ratio (arithmetic confusion)
 *   operands[1] = wrongIndex: a1 * r^n              — off by one on exponent
 */

import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

/**
 * Generate an arithmetic next-term problem.
 * Shows 4 terms of an arithmetic sequence, asks for the 5th.
 *
 * Overflow guards: a1 ∈ [1,30], d ∈ [1,15]
 * Max answer: 30 + 4*15 = 90
 */
export function generateArithmeticNextTerm(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const a1 = rng.intRange(1, 30);
  const d = rng.intRange(1, 15);
  const terms = 4;

  // Build sequence: [a1, a1+d, a1+2d, a1+3d]
  const seq: number[] = [];
  for (let i = 0; i < terms; i++) {
    seq.push(a1 + i * d);
  }

  // Answer: 5th term = a1 + 4*d
  const answer = a1 + terms * d;

  // Distractor operands
  const wrongStep = seq[terms - 1] + (d + 1);  // incremented common difference
  const wrongIndex = a1 + (terms - 1) * d;      // last displayed term (off-by-one)

  const questionText = `What comes next? ${seq.join(', ')}, ?`;

  return {
    operands: [wrongStep, wrongIndex],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * Generate an arithmetic nth-term problem.
 * Gives first term and common difference, asks for the nth term.
 *
 * Overflow guards: a1 ∈ [1,20], d ∈ [1,10], n ∈ [3,8]
 * Max answer: 20 + 7*10 = 90
 */
export function generateArithmeticNthTerm(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const a1 = rng.intRange(1, 20);
  const d = rng.intRange(1, 10);
  const n = rng.intRange(3, 8);

  // Answer: nth term = a1 + (n-1)*d
  const answer = a1 + (n - 1) * d;

  // Distractor operands
  const wrongNoSubtract = a1 + n * d;  // used n instead of (n-1)
  const wrongJustD = a1 + d;           // only one step from first term

  const questionText = `Find the ${n}th term of the arithmetic sequence: ${a1}, ${a1 + d}, ${a1 + 2 * d}, ...`;

  return {
    operands: [wrongNoSubtract, wrongJustD],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * Generate a geometric next-term problem.
 * Shows 3 terms of a geometric sequence, asks for the 4th.
 *
 * Overflow guards: a1 ∈ [1,5], r ∈ [2,3], terms=3
 * Max answer: 5 * 3^3 = 135
 */
export function generateGeometricNextTerm(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const a1 = rng.intRange(1, 5);
  const r = rng.intRange(2, 3);
  const terms = 3;

  // Build sequence: [a1, a1*r, a1*r^2]
  const seq: number[] = [];
  for (let i = 0; i < terms; i++) {
    seq.push(a1 * Math.pow(r, i));
  }

  // Answer: 4th term = a1 * r^3
  const answer = a1 * Math.pow(r, terms);

  // Distractor operands
  const wrongArithmetic = seq[terms - 1] + r;         // added ratio instead of multiplied
  const wrongIndex = a1 * Math.pow(r, terms - 1);     // last shown term repeated

  const questionText = `What comes next? ${seq.join(', ')}, ?`;

  return {
    operands: [wrongArithmetic, wrongIndex],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * Generate a geometric nth-term problem.
 * Gives first 3 terms, asks for the nth term.
 *
 * MANDATORY caps (Pitfall 1 from RESEARCH.md):
 *   a1 ∈ [1,5], r ∈ [2,3], n ∈ [3,6]
 * Max answer: 5 * 3^5 = 1215 (safely under 2000 bound)
 */
export function generateGeometricNthTerm(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const a1 = rng.intRange(1, 5);
  const r = rng.intRange(2, 3);
  const n = rng.intRange(3, 6);

  // Answer: nth term = a1 * r^(n-1)
  const answer = a1 * Math.pow(r, n - 1);

  // Distractor operands
  const wrongArithmetic = a1 + (n - 1) * r;  // added ratio — arithmetic thinking on geometric
  const wrongIndex = a1 * Math.pow(r, n);     // off by one on exponent

  // Show first 3 terms in question text
  const term1 = a1;
  const term2 = a1 * r;
  const term3 = a1 * r * r;

  const questionText = `Find the ${n}th term of the geometric sequence: ${term1}, ${term2}, ${term3}, ...`;

  return {
    operands: [wrongArithmetic, wrongIndex],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}
