/**
 * Money generators — grades 1-4.
 *
 * Covers: coin identification, counting same-type coins, counting mixed coins,
 * dollar/cent notation, making change, multi-step problems, and unit pricing.
 *
 * All answers are in cents (NumericAnswer) for multiple-choice.
 */

import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

const COINS = [
  { name: 'penny', plural: 'pennies', value: 1 },
  { name: 'nickel', plural: 'nickels', value: 5 },
  { name: 'dime', plural: 'dimes', value: 10 },
  { name: 'quarter', plural: 'quarters', value: 25 },
] as const;

/** Grade 1: How much is a ___ worth? */
export function generateIdentify(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const coin = COINS[rng.intRange(0, COINS.length - 1)];

  return {
    operands: [coin.value, 1],
    correctAnswer: numericAnswer(coin.value),
    questionText: `How many cents is a ${coin.name} worth?`,
    metadata: {
      coinSet: [{ coin: coin.name, count: 1 }],
      answerDisplay: `${coin.value}¢`,
    },
  };
}

/** Grade 1: You have N of the same coin. How many cents? */
export function generateCountSame(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 5, max: 25 },
    { min: 2, max: 5 },
  ];

  const coin = COINS[rng.intRange(0, COINS.length - 1)];
  const count = rng.intRange(ranges[1].min, ranges[1].max);
  const answer = coin.value * count;

  return {
    operands: [coin.value, count],
    correctAnswer: numericAnswer(answer),
    questionText: `You have ${count} ${count === 1 ? coin.name : coin.plural}. How many cents is that?`,
    metadata: {
      coinSet: [{ coin: coin.name, count }],
      answerDisplay: `${answer}¢`,
    },
  };
}

/** Grade 2: Count a mix of two coin types. */
export function generateCountMixed(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 50 },
    { min: 1, max: 50 },
  ];

  // Pick two different coin types
  const idx1 = rng.intRange(0, COINS.length - 1);
  let idx2 = rng.intRange(0, COINS.length - 2);
  if (idx2 >= idx1) idx2++;

  const coin1 = COINS[idx1];
  const coin2 = COINS[idx2];
  const count1 = rng.intRange(1, Math.min(ranges[0].max, 4));
  const count2 = rng.intRange(1, Math.min(ranges[1].max, 4));
  const answer = coin1.value * count1 + coin2.value * count2;

  return {
    operands: [coin1.value * count1, coin2.value * count2],
    correctAnswer: numericAnswer(answer),
    questionText:
      `You have ${count1} ${count1 === 1 ? coin1.name : coin1.plural} ` +
      `and ${count2} ${count2 === 1 ? coin2.name : coin2.plural}. ` +
      `How many cents in total?`,
    metadata: {
      coinSet: [
        { coin: coin1.name, count: count1 },
        { coin: coin2.name, count: count2 },
      ],
      answerDisplay: `${answer}¢`,
    },
  };
}

/** Grade 2: How many cents is $X.YZ? */
export function generateNotation(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 999 },
    { min: 1, max: 1 },
  ];

  const cents = rng.intRange(ranges[0].min, ranges[0].max);
  const dollars = Math.floor(cents / 100);
  const remainCents = cents % 100;
  const dollarStr =
    dollars > 0
      ? `$${dollars}.${String(remainCents).padStart(2, '0')}`
      : `${cents}¢`;

  return {
    operands: [cents, 0],
    correctAnswer: numericAnswer(cents),
    questionText: `How many cents is ${dollarStr}?`,
    metadata: {
      answerDisplay: `${cents}¢`,
    },
  };
}

/** Grade 2: Making change. You pay P cents for an item costing C cents. */
export function generateMakingChange(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 10, max: 100 },
    { min: 5, max: 50 },
  ];

  for (let i = 0; i < 50; i++) {
    const paid = rng.intRange(ranges[0].min, ranges[0].max);
    const cost = rng.intRange(ranges[1].min, Math.min(ranges[1].max, paid - 1));
    const change = paid - cost;
    if (change > 0 && change <= ranges[0].max) {
      return {
        operands: [paid, cost],
        correctAnswer: numericAnswer(change),
        questionText: `You pay ${paid}¢ for an item that costs ${cost}¢. How many cents change do you get?`,
        metadata: { answerDisplay: `${change}¢` },
      };
    }
  }

  return {
    operands: [50, 35],
    correctAnswer: numericAnswer(15),
    questionText: 'You pay 50¢ for an item that costs 35¢. How many cents change do you get?',
    metadata: { answerDisplay: '15¢' },
  };
}

/** Grade 3: Multi-step — buy multiple items, find total cost. */
export function generateMultiStep(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 10, max: 500 },
    { min: 10, max: 200 },
  ];

  const price1 = rng.intRange(10, Math.min(ranges[0].max, 200));
  const qty1 = rng.intRange(1, 3);
  const price2 = rng.intRange(10, Math.min(ranges[1].max, 100));
  const qty2 = rng.intRange(1, 2);
  const total = price1 * qty1 + price2 * qty2;

  const item1 = qty1 === 1 ? `an item at ${price1}¢` : `${qty1} items at ${price1}¢ each`;
  const item2 = qty2 === 1 ? `an item at ${price2}¢` : `${qty2} items at ${price2}¢ each`;

  return {
    operands: [price1 * qty1, price2 * qty2],
    correctAnswer: numericAnswer(total),
    questionText: `You buy ${item1} and ${item2}. How many cents in total?`,
    metadata: { answerDisplay: `${total}¢` },
  };
}

/** Grade 4: Unit pricing — total ÷ count = unit price. */
export function generateUnitPrice(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 10, max: 100 },
    { min: 2, max: 10 },
  ];

  // Generate unit price first, then multiply by count
  const count = rng.intRange(ranges[1].min, ranges[1].max);
  const unitPrice = rng.intRange(
    Math.max(2, Math.ceil(ranges[0].min / count)),
    Math.floor(ranges[0].max / count),
  );
  const total = unitPrice * count;

  return {
    operands: [total, count],
    correctAnswer: numericAnswer(unitPrice),
    questionText: `${count} apples cost ${total}¢. How many cents for 1 apple?`,
    metadata: { answerDisplay: `${unitPrice}¢` },
  };
}
