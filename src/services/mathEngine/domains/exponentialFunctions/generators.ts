/**
 * Exponential functions domain problem generators.
 * All generators use construction-from-answer pattern: compute answer first,
 * then build problem around it.
 *
 * Operand layouts per generator:
 *   exp_evaluate:    [wrongMultiply, wrongPlusOne, answer]
 *   growth_factor:   [wrongAdd, wrongOneLess, answer]
 *   decay_factor:    [wrongDouble, wrongOneLess, answer]
 *   doubling_time:   [wrongLinear, wrongOneLess, answer]
 *   word_problem:    reuses growth_factor operand layout
 */

import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

const SUPERSCRIPTS: Record<number, string> = {
  0: '\u2070',
  1: '\u00B9',
  2: '\u00B2',
  3: '\u00B3',
  4: '\u2074',
  5: '\u2075',
  6: '\u2076',
  7: '\u2077',
  8: '\u2078',
  9: '\u2079',
};

/**
 * Evaluate Exponential Expression.
 * Evaluate base^exp where base in [2,6], exp in [2,4].
 * Max: 6^4 = 1296 (under 2000).
 */
export function generateExpEvaluate(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const base = rng.intRange(2, 6);
  const exp = rng.intRange(2, 4);
  const answer = Math.pow(base, exp);

  const wrongMultiply = base * exp; // linear thinking bug
  const wrongPlusOne = Math.pow(base, exp + 1) > 1999
    ? Math.pow(base, exp - 1)
    : Math.pow(base, exp + 1);

  const sup = SUPERSCRIPTS[exp] ?? `^${exp}`;
  const questionText = `Evaluate ${base}${sup}.`;

  return {
    operands: [wrongMultiply, wrongPlusOne, answer],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * Growth Factor Problems.
 * A colony starts with initial bacteria and multiplies by factor every hour.
 * initial in [2,5], factor in [2,3], periods in [2,3]. Max: 5*3^3 = 135.
 */
export function generateGrowthFactor(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const initial = rng.intRange(2, 5);
  const factor = rng.intRange(2, 3);
  const periods = rng.intRange(2, 3);
  const answer = initial * Math.pow(factor, periods);

  const wrongAdd = initial + factor * periods; // linear thinking
  const wrongOneLess = initial * Math.pow(factor, periods - 1); // off-by-one period

  const factorWord = factor === 2 ? 'doubles' : 'triples';
  const questionText = `A colony starts with ${initial} bacteria and ${factorWord} every hour. How many after ${periods} hours?`;

  return {
    operands: [wrongAdd, wrongOneLess, answer],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * Decay Factor / Half-Life.
 * Substance starts at initial (power of 2) and halves every year.
 * initial from [64, 128, 256, 512, 1024], periods in [1,4]. Always integer.
 */
export function generateDecayFactor(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const initialOptions = [64, 128, 256, 512, 1024];
  const initial = initialOptions[rng.intRange(0, initialOptions.length - 1)];
  const periods = rng.intRange(1, 4);
  const answer = initial / Math.pow(2, periods);

  const wrongDoubleRaw = initial * Math.pow(2, periods);
  const wrongDouble = wrongDoubleRaw > 1999 ? initial * 2 : wrongDoubleRaw;
  const wrongOneLess = initial / Math.pow(2, Math.max(1, periods - 1));

  const questionText = `A substance starts at ${initial}g and loses half its mass every year. How many grams remain after ${periods} years?`;

  return {
    operands: [wrongDouble, wrongOneLess, answer],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * Doubling-Time Scenarios.
 * Investment starts at initial ($10-$100 in steps of 10) and doubles every
 * doublingPeriod years. totalTime is a multiple of doublingPeriod.
 * Max: 100 * 2^3 = 800.
 */
export function generateDoublingTime(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const initial = rng.intRange(1, 10) * 10;
  const doublingPeriod = rng.intRange(2, 4);
  const multiplier = rng.intRange(2, 3);
  const totalTime = doublingPeriod * multiplier;
  const numDoublings = totalTime / doublingPeriod;
  const answer = initial * Math.pow(2, numDoublings);

  const wrongLinear = initial * 2 * numDoublings; // linear doubling
  const wrongOneLess = initial * Math.pow(2, numDoublings - 1);

  const questionText = `An investment starts at $${initial} and doubles every ${doublingPeriod} years. What is it worth after ${totalTime} years?`;

  return {
    operands: [wrongLinear, wrongOneLess, answer],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * Exponential Word Problem.
 * Reuses generateGrowthFactor -- the prefix word problem system
 * (Plan 03) will prepend contextual text.
 */
export function generateExpWordProblem(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  return generateGrowthFactor(template, rng);
}
