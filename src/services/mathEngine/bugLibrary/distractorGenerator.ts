import { answerNumericValue } from '../types';
import type { MathDomain, Problem } from '../types';
import type { SeededRng } from '../seededRng';
import type { BugPattern, DistractorResult } from './types';
import { ADDITION_BUGS } from './additionBugs';
import { DIVISION_BUGS } from './divisionBugs';
import { FRACTIONS_BUGS } from './fractionsBugs';
import { MONEY_BUGS } from './moneyBugs';
import { MULTIPLICATION_BUGS } from './multiplicationBugs';
import { PATTERNS_BUGS } from './patternsBugs';
import { PLACE_VALUE_BUGS } from './placeValueBugs';
import { SUBTRACTION_BUGS } from './subtractionBugs';
import { TIME_BUGS } from './timeBugs';
import { MEASUREMENT_BUGS } from './measurementBugs';
import { RATIOS_BUGS } from './ratiosBugs';
import { EXPONENTS_BUGS } from './exponentsBugs';
import { EXPRESSIONS_BUGS } from './expressionsBugs';
import { BASIC_GRAPHS_BUGS } from './basicGraphsBugs';
import { DATA_ANALYSIS_BUGS } from './dataAnalysisBugs';
import { isValidDistractor, shuffleArray } from './validation';

/** IDs of off-by-one patterns excluded from Phase 1 bug library lookup */
const OFF_BY_ONE_IDS = new Set([
  'add_off_by_one_plus',
  'add_off_by_one_minus',
  'sub_off_by_one_plus',
  'sub_off_by_one_minus',
]);

const BUGS_BY_OPERATION: Record<MathDomain, readonly BugPattern[]> = {
  addition: ADDITION_BUGS,
  subtraction: SUBTRACTION_BUGS,
  multiplication: MULTIPLICATION_BUGS,
  division: DIVISION_BUGS,
  fractions: FRACTIONS_BUGS,
  place_value: PLACE_VALUE_BUGS,
  time: TIME_BUGS,
  money: MONEY_BUGS,
  patterns: PATTERNS_BUGS,
  measurement: MEASUREMENT_BUGS,
  ratios: RATIOS_BUGS,
  exponents: EXPONENTS_BUGS,
  expressions: EXPRESSIONS_BUGS,
  geometry: [],
  probability: [],
  number_theory: [],
  basic_graphs: BASIC_GRAPHS_BUGS,
  data_analysis: DATA_ANALYSIS_BUGS,
};

/**
 * Returns bug patterns applicable to the given problem,
 * excluding off-by-one patterns (reserved for adjacent phase).
 */
function getApplicableBugs(problem: Problem): BugPattern[] {
  const bugs = BUGS_BY_OPERATION[problem.operation] ?? [];

  return bugs.filter(
    (bug) =>
      bug.minDigits <= problem.metadata.digitCount &&
      !OFF_BY_ONE_IDS.has(bug.id),
  );
}

/** Safety limit for random fallback iterations */
const MAX_RANDOM_ITERATIONS = 50;

/**
 * Three-phase distractor assembly algorithm.
 *
 * Phase 1: Bug Library -- compute misconception-based distractors (target 2)
 * Phase 2: Adjacent -- off-by-one from correct answer (target 1)
 * Phase 3: Random fallback -- fill remaining slots
 *
 * Returns exactly `count` unique, valid distractors (default 3).
 */
export function generateDistractors(
  problem: Problem,
  rng: SeededRng,
  count: number = 3,
): DistractorResult[] {
  const { operation } = problem;
  const correctAnswer = answerNumericValue(problem.correctAnswer);
  const results: DistractorResult[] = [];
  const used = new Set<number>([correctAnswer]);

  // Phase 1: Bug Library (target 2)
  const applicableBugs = shuffleArray(getApplicableBugs(problem), rng);

  for (const bug of applicableBugs) {
    if (results.length >= 2) break;

    const value = bug.compute(
      problem.operands[0],
      problem.operands[1],
      operation,
    );

    if (
      value !== null &&
      Number.isFinite(value) &&
      !used.has(value) &&
      isValidDistractor(value, correctAnswer, operation)
    ) {
      results.push({ value, source: 'bug_library', bugId: bug.id });
      used.add(value);
    }
  }

  // Phase 2: Adjacent off-by-one (target 1)
  if (results.length < count) {
    const plus1 = correctAnswer + 1;
    const minus1 = correctAnswer - 1;

    if (!used.has(plus1) && isValidDistractor(plus1, correctAnswer, operation)) {
      results.push({ value: plus1, source: 'adjacent', bugId: undefined });
      used.add(plus1);
    } else if (
      !used.has(minus1) &&
      isValidDistractor(minus1, correctAnswer, operation)
    ) {
      results.push({ value: minus1, source: 'adjacent', bugId: undefined });
      used.add(minus1);
    }
  }

  // Phase 3: Random fallback
  // Detect decimal precision from the correct answer
  const isDecimal = !Number.isInteger(correctAnswer);
  const decimalPlaces = isDecimal
    ? (correctAnswer.toString().split('.')[1]?.length ?? 0)
    : 0;
  const step = isDecimal ? Math.pow(10, -decimalPlaces) : 1;

  const rangeHalf = Math.max(Math.floor(Math.abs(correctAnswer) * 0.4), 5);
  const allowNegative =
    operation === 'subtraction' ||
    operation === 'expressions' ||
    correctAnswer < 0;
  const rangeLow = allowNegative
    ? correctAnswer - rangeHalf
    : Math.max(isDecimal ? step : 1, correctAnswer - rangeHalf);
  const rangeHigh = correctAnswer + rangeHalf;

  let iterations = 0;
  while (results.length < count && iterations < MAX_RANDOM_ITERATIONS) {
    iterations++;
    let value: number;
    if (isDecimal) {
      const scale = Math.pow(10, decimalPlaces);
      value =
        Math.round(
          (rangeLow + rng.next() * (rangeHigh - rangeLow)) * scale,
        ) / scale;
    } else {
      value = rng.intRange(Math.round(rangeLow), Math.round(rangeHigh));
    }

    if (
      !used.has(value) &&
      isValidDistractor(value, correctAnswer, operation)
    ) {
      results.push({ value, source: 'random', bugId: undefined });
      used.add(value);
    }
  }

  // Deterministic fallback if random phase exhausted
  if (results.length < count) {
    let offset = 2;
    while (results.length < count) {
      const candidate = isDecimal
        ? Math.round((correctAnswer + offset * step) * 1e10) / 1e10
        : correctAnswer + offset;
      if (
        !used.has(candidate) &&
        isValidDistractor(candidate, correctAnswer, operation)
      ) {
        results.push({ value: candidate, source: 'random', bugId: undefined });
        used.add(candidate);
      } else {
        const candidateNeg = isDecimal
          ? Math.round((correctAnswer - offset * step) * 1e10) / 1e10
          : correctAnswer - offset;
        if (
          !used.has(candidateNeg) &&
          isValidDistractor(candidateNeg, correctAnswer, operation)
        ) {
          results.push({
            value: candidateNeg,
            source: 'random',
            bugId: undefined,
          });
          used.add(candidateNeg);
        }
      }
      offset++;

      // Ultimate safety — should never reach this in practice
      if (offset > 100) break;
    }
  }

  return results;
}
