/**
 * Foundation fraction generators — grades 1-3.
 *
 * Covers: partitioning, identify, unit fractions, number line,
 * equivalent fractions, and comparison (same denom / same numer).
 */

import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

/** Grade 1: How many equal parts make the whole? */
export function generatePartitioning(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 2, max: 4 },
    { min: 1, max: 1 },
  ];
  const denom = rng.intRange(ranges[0].min, ranges[0].max);

  return {
    operands: [denom, 1],
    correctAnswer: numericAnswer(denom),
    questionText: `A shape is cut into ${denom} equal parts. How many parts make the whole?`,
    metadata: { fractionDisplay: { numerator: denom, denominator: denom } },
  };
}

/** Grade 2: Identify the fraction — what is the numerator? */
export function generateIdentify(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 3 },
    { min: 2, max: 4 },
  ];
  const denom = rng.intRange(ranges[1].min, ranges[1].max);
  const numer = rng.intRange(ranges[0].min, Math.min(ranges[0].max, denom));

  return {
    operands: [numer, denom],
    correctAnswer: numericAnswer(numer),
    questionText: `${numer} out of ${denom} equal parts are shaded. What is the numerator?`,
    metadata: { fractionDisplay: { numerator: numer, denominator: denom } },
  };
}

/** Grade 3: How many unit fractions make a whole? */
export function generateUnit(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 1 },
    { min: 2, max: 8 },
  ];
  const denom = rng.intRange(ranges[1].min, ranges[1].max);

  return {
    operands: [1, denom],
    correctAnswer: numericAnswer(denom),
    questionText: `How many 1/${denom} pieces make one whole?`,
    metadata: { fractionDisplay: { numerator: 1, denominator: denom } },
  };
}

/** Grade 3: Number line — identify the numerator at a marked point. */
export function generateNumberLine(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 5 },
    { min: 2, max: 6 },
  ];
  const denom = rng.intRange(Math.max(ranges[1].min, 2), ranges[1].max);
  const numer = rng.intRange(
    ranges[0].min,
    Math.min(ranges[0].max, denom - 1),
  );

  return {
    operands: [numer, denom],
    correctAnswer: numericAnswer(numer),
    questionText: `A number line from 0 to 1 has ${denom} equal parts. The point is at mark ${numer}. What is the numerator?`,
    metadata: { fractionDisplay: { numerator: numer, denominator: denom } },
  };
}

/** Grade 3: Equivalent fractions — find the missing numerator. */
export function generateEquivalent(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 6 },
    { min: 2, max: 8 },
  ];
  const denom = rng.intRange(Math.max(ranges[1].min, 2), ranges[1].max);
  const numer = rng.intRange(
    ranges[0].min,
    Math.min(ranges[0].max, denom - 1),
  );

  const multiplier = rng.intRange(2, 4);
  const newDenom = denom * multiplier;
  const answer = numer * multiplier;

  return {
    operands: [numer, denom],
    correctAnswer: numericAnswer(answer),
    questionText: `${numer}/${denom} = ?/${newDenom}`,
    metadata: {
      fractionDisplay: { numerator: numer, denominator: denom },
      answerDisplay: `${answer}/${newDenom}`,
    },
  };
}

const MAX_ATTEMPTS = 50;

/** Grade 3: Compare fractions with the same denominator. */
export function generateCompareSameDenom(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 7 },
    { min: 1, max: 7 },
  ];

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const denom = rng.intRange(Math.max(ranges[1].min, 3), ranges[1].max + 1);
    const a = rng.intRange(1, denom - 1);
    const b = rng.intRange(1, denom - 1);
    if (a === b) continue;

    const larger = Math.max(a, b);
    return {
      operands: [a, b],
      correctAnswer: numericAnswer(larger),
      questionText: `Which is larger: ${a}/${denom} or ${b}/${denom}?\nEnter the larger numerator.`,
      metadata: {
        fractionDisplay: { numerator: larger, denominator: denom },
        answerDisplay: `${larger}/${denom}`,
      },
    };
  }

  // Fallback: guaranteed valid
  return {
    operands: [1, 3],
    correctAnswer: numericAnswer(3),
    questionText: 'Which is larger: 1/4 or 3/4?\nEnter the larger numerator.',
    metadata: {
      fractionDisplay: { numerator: 3, denominator: 4 },
      answerDisplay: '3/4',
    },
  };
}

/** Grade 3: Compare fractions with the same numerator. */
export function generateCompareSameNumer(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 2, max: 8 },
    { min: 2, max: 8 },
  ];

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const numer = rng.intRange(1, Math.min(ranges[0].max, 4));
    const denomA = rng.intRange(
      Math.max(ranges[0].min, numer + 1),
      ranges[1].max,
    );
    const denomB = rng.intRange(
      Math.max(ranges[0].min, numer + 1),
      ranges[1].max,
    );
    if (denomA === denomB) continue;

    // Smaller denominator = larger fraction
    const smallerDenom = Math.min(denomA, denomB);
    return {
      operands: [numer, smallerDenom],
      correctAnswer: numericAnswer(smallerDenom),
      questionText: `Which is larger: ${numer}/${denomA} or ${numer}/${denomB}?\nEnter the denominator of the larger fraction.`,
      metadata: {
        fractionDisplay: { numerator: numer, denominator: smallerDenom },
        answerDisplay: `${numer}/${smallerDenom}`,
      },
    };
  }

  return {
    operands: [1, 3],
    correctAnswer: numericAnswer(3),
    questionText:
      'Which is larger: 1/3 or 1/5?\nEnter the denominator of the larger fraction.',
    metadata: {
      fractionDisplay: { numerator: 1, denominator: 3 },
      answerDisplay: '1/3',
    },
  };
}
