/**
 * Logarithms domain problem generators.
 * All generators use construction-from-answer pattern: pick the exponent (answer)
 * first, then build the argument via Math.pow(). NEVER use Math.log().
 *
 * Operand layouts per generator:
 *   log10_eval:    [wrongArgument, wrongOffByOne, answer]
 *   log2_eval:     [wrongArgument, wrongOffByOne, answer]
 *   ln_eval:       [wrongSquared, wrongOffByOne, answer]
 *   word_problem:  reuses log10_eval operand layout
 */

import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

const SUBSCRIPTS: Record<number, string> = {
  0: '\u2080',
  1: '\u2081',
  2: '\u2082',
  3: '\u2083',
  4: '\u2084',
  5: '\u2085',
  6: '\u2086',
  7: '\u2087',
  8: '\u2088',
  9: '\u2089',
};

const SUPERSCRIPTS: Record<number, string> = {
  2: '\u00B2',
  3: '\u00B3',
  4: '\u2074',
  5: '\u2075',
};

/**
 * Evaluate log base 10.
 * answer in [1,6], argument = 10^answer. Max argument = 1,000,000.
 * Answer always integer, always < 2000.
 */
export function generateLog10Eval(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const answer = rng.intRange(1, 6);
  const argument = Math.pow(10, answer);

  const wrongArgument = argument; // student gave argument instead of exponent
  const wrongOffByOne = answer + 1; // miscounted zeros

  const formattedArg = argument.toLocaleString();
  const questionText = `Evaluate log${SUBSCRIPTS[1]}${SUBSCRIPTS[0]}(${formattedArg}).`;

  return {
    operands: [wrongArgument, wrongOffByOne, answer],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * Evaluate log base 2.
 * answer in [1,10], argument = 2^answer. Max argument = 1024.
 * Answer always integer, always < 2000.
 */
export function generateLog2Eval(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const answer = rng.intRange(1, 10);
  const argument = Math.pow(2, answer);

  const wrongArgument = argument;
  const wrongOffByOne = answer - 1; // off-by-one

  const questionText = `Evaluate log${SUBSCRIPTS[2]}(${argument}).`;

  return {
    operands: [wrongArgument, wrongOffByOne, answer],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * Evaluate natural log.
 * answer in [1,5]. Display as "ln(e)" or "ln(e^n)" using Unicode superscript.
 * CRITICAL: Never display the numeric value of e^n.
 * Answer always integer, always < 2000.
 */
export function generateLnEval(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const answer = rng.intRange(1, 5);

  const wrongSquared = answer * answer; // confused ln(e^n) with n^2
  const wrongOffByOne = answer + 1;

  let questionText: string;
  if (answer === 1) {
    questionText = 'Evaluate ln(e).';
  } else {
    const sup = SUPERSCRIPTS[answer] ?? `^${answer}`;
    questionText = `Evaluate ln(e${sup}).`;
  }

  return {
    operands: [wrongSquared, wrongOffByOne, answer],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * Logarithm Word Problem.
 * Reuses generateLog10Eval -- the prefix word problem system
 * (Plan 03) will prepend contextual text.
 */
export function generateLogWordProblem(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  return generateLog10Eval(template, rng);
}
