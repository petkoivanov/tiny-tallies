/**
 * Fraction operation generators — grades 4-6.
 *
 * Covers: add/subtract (like + unlike denominators), mixed numbers,
 * multiply by whole, multiply fractions, divide unit fractions,
 * and divide fractions.
 *
 * All answers are integers (numerator of result over a given denominator)
 * to work with the current multiple-choice system.
 */

import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import { lcm } from './utils';

const MAX_ATTEMPTS = 100;

/**
 * Grade 4: Add or subtract fractions with the same denominator.
 * Question: "A/D ± B/D = ?/D"
 */
export function generateAddSubtractLike(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 5 },
    { min: 1, max: 5 },
  ];

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const denom = rng.intRange(2, 8);
    const a = rng.intRange(ranges[0].min, Math.min(ranges[0].max, denom - 1));
    const b = rng.intRange(ranges[1].min, Math.min(ranges[1].max, denom - 1));

    const isAdd = rng.next() < 0.6;
    if (isAdd) {
      const result = a + b;
      if (
        template.resultRange &&
        (result < template.resultRange.min || result > template.resultRange.max)
      )
        continue;
      return {
        operands: [a, b],
        correctAnswer: numericAnswer(result),
        questionText: `${a}/${denom} + ${b}/${denom} = ?/${denom}`,
        metadata: {
          fractionDisplay: { numerator: result, denominator: denom },
          answerDisplay: `${result}/${denom}`,
        },
      };
    } else {
      if (a <= b) continue;
      const result = a - b;
      if (result <= 0) continue;
      return {
        operands: [a, b],
        correctAnswer: numericAnswer(result),
        questionText: `${a}/${denom} \u2212 ${b}/${denom} = ?/${denom}`,
        metadata: {
          fractionDisplay: { numerator: result, denominator: denom },
          answerDisplay: `${result}/${denom}`,
        },
      };
    }
  }

  return {
    operands: [3, 1],
    correctAnswer: numericAnswer(4),
    questionText: '3/5 + 1/5 = ?/5',
    metadata: {
      fractionDisplay: { numerator: 4, denominator: 5 },
      answerDisplay: '4/5',
    },
  };
}

/**
 * Grade 4: Convert a mixed number to an improper fraction.
 * Question: "W N/D = ?/D"
 */
export function generateMixedNumbers(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 5 },
    { min: 1, max: 3 },
  ];

  const whole = rng.intRange(ranges[1].min, ranges[1].max);
  const denom = rng.intRange(2, 6);
  const numer = rng.intRange(
    ranges[0].min,
    Math.min(ranges[0].max, denom - 1),
  );

  const answer = whole * denom + numer;

  return {
    operands: [numer, denom],
    correctAnswer: numericAnswer(answer),
    questionText: `${whole} ${numer}/${denom} = ?/${denom}`,
    metadata: {
      fractionDisplay: { numerator: answer, denominator: denom },
      answerDisplay: `${answer}/${denom}`,
    },
  };
}

/**
 * Grade 4: Multiply a fraction by a whole number.
 * Question: "W × N/D = ?/D"
 */
export function generateMultiplyWhole(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 5 },
    { min: 2, max: 6 },
  ];

  const whole = rng.intRange(2, ranges[0].max);
  const denom = rng.intRange(ranges[1].min, ranges[1].max);
  const numer = rng.intRange(1, Math.min(4, denom - 1));

  const answer = whole * numer;

  return {
    operands: [whole, numer],
    correctAnswer: numericAnswer(answer),
    questionText: `${whole} \u00d7 ${numer}/${denom} = ?/${denom}`,
    metadata: {
      fractionDisplay: { numerator: answer, denominator: denom },
      answerDisplay: `${answer}/${denom}`,
    },
  };
}

/**
 * Grade 5: Add or subtract fractions with unlike denominators.
 * Question: "A/B ± C/D = ?/LCD"
 */
export function generateAddSubtractUnlike(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 5 },
    { min: 2, max: 8 },
  ];

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const d1 = rng.intRange(2, Math.min(ranges[1].max, 6));
    const d2 = rng.intRange(2, Math.min(ranges[1].max, 6));
    if (d1 === d2) continue;

    const lcd = lcm(d1, d2);
    if (lcd > 36) continue;

    const n1 = rng.intRange(1, Math.min(ranges[0].max, d1 - 1));
    const n2 = rng.intRange(1, Math.min(ranges[0].max, d2 - 1));

    const lifted1 = n1 * (lcd / d1);
    const lifted2 = n2 * (lcd / d2);

    const isAdd = rng.next() < 0.6;
    if (isAdd) {
      const answer = lifted1 + lifted2;
      return {
        operands: [n1, n2],
        correctAnswer: numericAnswer(answer),
        questionText: `${n1}/${d1} + ${n2}/${d2} = ?/${lcd}`,
        metadata: {
          fractionDisplay: { numerator: answer, denominator: lcd },
          answerDisplay: `${answer}/${lcd}`,
        },
      };
    } else {
      if (lifted1 <= lifted2) continue;
      const answer = lifted1 - lifted2;
      return {
        operands: [n1, n2],
        correctAnswer: numericAnswer(answer),
        questionText: `${n1}/${d1} \u2212 ${n2}/${d2} = ?/${lcd}`,
        metadata: {
          fractionDisplay: { numerator: answer, denominator: lcd },
          answerDisplay: `${answer}/${lcd}`,
        },
      };
    }
  }

  return {
    operands: [1, 1],
    correctAnswer: numericAnswer(7),
    questionText: '1/3 + 1/4 = ?/12',
    metadata: {
      fractionDisplay: { numerator: 7, denominator: 12 },
      answerDisplay: '7/12',
    },
  };
}

/**
 * Grade 5: Multiply fraction × fraction.
 * Question: "A/B × C/D = ?/(B×D)"
 */
export function generateMultiplyFractions(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 5 },
    { min: 2, max: 6 },
  ];

  const d1 = rng.intRange(2, ranges[1].max);
  const d2 = rng.intRange(2, ranges[1].max);
  const n1 = rng.intRange(1, Math.min(ranges[0].max, d1 - 1));
  const n2 = rng.intRange(1, Math.min(ranges[0].max, d2 - 1));

  const resultNumer = n1 * n2;
  const resultDenom = d1 * d2;

  return {
    operands: [n1, n2],
    correctAnswer: numericAnswer(resultNumer),
    questionText: `${n1}/${d1} \u00d7 ${n2}/${d2} = ?/${resultDenom}`,
    metadata: {
      fractionDisplay: { numerator: resultNumer, denominator: resultDenom },
      answerDisplay: `${resultNumer}/${resultDenom}`,
    },
  };
}

/**
 * Grade 5: Divide with unit fractions.
 * Two variants:
 *  - "W ÷ 1/D = ?" → answer is W × D
 *  - "1/D ÷ W = 1/?" → answer is D × W (the new denominator)
 */
export function generateDivideUnitFraction(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 2, max: 6 },
    { min: 2, max: 5 },
  ];

  const denom = rng.intRange(ranges[0].min, ranges[0].max);
  const whole = rng.intRange(ranges[1].min, ranges[1].max);
  const answer = whole * denom;

  // Variant 1: whole ÷ unit fraction (~60%)
  if (rng.next() < 0.6) {
    return {
      operands: [whole, denom],
      correctAnswer: numericAnswer(answer),
      questionText: `${whole} \u00f7 1/${denom} = ?`,
      metadata: {
        fractionDisplay: { numerator: 1, denominator: denom },
        answerDisplay: `${answer}`,
      },
    };
  }

  // Variant 2: unit fraction ÷ whole → 1/(D×W)
  return {
    operands: [denom, whole],
    correctAnswer: numericAnswer(answer),
    questionText: `1/${denom} \u00f7 ${whole} = 1/?`,
    metadata: {
      fractionDisplay: { numerator: 1, denominator: answer },
      answerDisplay: `1/${answer}`,
    },
  };
}

/**
 * Grade 6: Divide fraction by fraction.
 * a/b ÷ c/d = (a×d)/(b×c) — answer is the numerator over (b×c).
 * Question: "A/B ÷ C/D = ?/(B×C)"
 */
export function generateDivideFractions(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 5 },
    { min: 2, max: 6 },
  ];

  const d1 = rng.intRange(2, ranges[1].max);
  const d2 = rng.intRange(2, ranges[1].max);
  const n1 = rng.intRange(1, Math.min(ranges[0].max, d1));
  const n2 = rng.intRange(1, Math.min(ranges[0].max, d2));

  const resultNumer = n1 * d2;
  const resultDenom = d1 * n2;

  return {
    operands: [n1, n2],
    correctAnswer: numericAnswer(resultNumer),
    questionText: `${n1}/${d1} \u00f7 ${n2}/${d2} = ?/${resultDenom}`,
    metadata: {
      fractionDisplay: { numerator: resultNumer, denominator: resultDenom },
      answerDisplay: `${resultNumer}/${resultDenom}`,
    },
  };
}
