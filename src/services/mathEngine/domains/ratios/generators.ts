import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

/** Grade 6: Simplify a ratio to its first term */
export function generateSimplifyRatio(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const gcd = rng.intRange(2, 6);
  const a = rng.intRange(1, 6);
  const b = rng.intRange(1, 6);
  // Ensure a !== b for a non-trivial ratio
  const bFinal = b === a ? a + 1 : b;
  const bigA = a * gcd;
  const bigB = bFinal * gcd;

  return {
    operands: [bigA, bigB],
    correctAnswer: numericAnswer(a),
    questionText: `Simplify the ratio ${bigA}:${bigB}. What is the first term?`,
    metadata: {},
  };
}

/** Grade 6: Find equivalent ratio (missing term) */
export function generateEquivalentRatio(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const a = rng.intRange(1, 8);
  const b = rng.intRange(2, 8);
  const multiplier = rng.intRange(2, 6);

  // "a:b = ?:(b*multiplier)"
  const answer = a * multiplier;
  const scaledB = b * multiplier;

  return {
    operands: [a, scaledB],
    correctAnswer: numericAnswer(answer),
    questionText: `${a}:${b} = ?:${scaledB}`,
    metadata: {},
  };
}

/** Grade 6: Unit rate — "If 4 items cost $12, how much does 1 cost?" */
export function generateUnitRate(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const unitPrice = rng.intRange(2, 15);
  const count = rng.intRange(2, 8);
  const total = unitPrice * count;

  const items = ['apples', 'pencils', 'stickers', 'books', 'pens'];
  const item = items[rng.intRange(0, items.length - 1)];

  return {
    operands: [total, count],
    correctAnswer: numericAnswer(unitPrice),
    questionText: `${count} ${item} cost $${total}. How much does 1 ${item.slice(0, -1)} cost in dollars?`,
    metadata: {},
  };
}

/** Grade 6: Percent of a number — "What is 25% of 80?" */
export function generatePercentOf(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const percents = [10, 20, 25, 50, 75];
  const percent = percents[rng.intRange(0, percents.length - 1)];
  // Ensure clean division
  const base = rng.intRange(2, 20) * (100 / percent);
  const answer = (percent / 100) * base;

  return {
    operands: [percent, base],
    correctAnswer: numericAnswer(answer),
    questionText: `What is ${percent}% of ${base}?`,
    metadata: {},
  };
}

/** Grade 6: Fraction → percent conversion — "What percent is 3/4?" */
export function generateFractionToPercent(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const fractions: Array<{ n: number; d: number; pct: number }> = [
    { n: 1, d: 2, pct: 50 },
    { n: 1, d: 4, pct: 25 },
    { n: 3, d: 4, pct: 75 },
    { n: 1, d: 5, pct: 20 },
    { n: 2, d: 5, pct: 40 },
    { n: 3, d: 5, pct: 60 },
    { n: 4, d: 5, pct: 80 },
    { n: 1, d: 10, pct: 10 },
    { n: 3, d: 10, pct: 30 },
    { n: 7, d: 10, pct: 70 },
    { n: 9, d: 10, pct: 90 },
    { n: 1, d: 3, pct: 33 },
    { n: 2, d: 3, pct: 67 },
  ];
  const f = fractions[rng.intRange(0, fractions.length - 1)];

  return {
    operands: [f.n, f.d],
    correctAnswer: numericAnswer(f.pct),
    questionText: `What percent is ${f.n}/${f.d}? (Round to nearest whole number)`,
    metadata: {},
  };
}

/** Grade 6-7: Percent increase/decrease — "A $40 shirt is 25% off. What is the sale price?" */
export function generatePercentChange(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const percents = [10, 20, 25, 50];
  const percent = percents[rng.intRange(0, percents.length - 1)];
  const original = rng.intRange(2, 20) * (100 / percent);
  const discount = (percent / 100) * original;
  const isIncrease = rng.next() < 0.3; // mostly discount problems
  const answer = isIncrease ? original + discount : original - discount;
  const direction = isIncrease ? 'increase' : 'decrease';

  return {
    operands: [original, percent],
    correctAnswer: numericAnswer(answer),
    questionText: `A price of $${original} has a ${percent}% ${direction}. What is the new price in dollars?`,
    metadata: {},
  };
}

/** Grade 6-7: Proportional reasoning — "If 3 apples cost 60¢, how much do 5 cost?" */
export function generateProportion(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const unitCost = rng.intRange(2, 15);
  const knownCount = rng.intRange(2, 6);
  const askCount = rng.intRange(2, 10);
  // Ensure different counts
  const askFinal = askCount === knownCount ? askCount + 1 : askCount;
  const knownTotal = unitCost * knownCount;
  const answer = unitCost * askFinal;

  const items = ['apples', 'pencils', 'stickers', 'erasers', 'markers'];
  const item = items[rng.intRange(0, items.length - 1)];

  return {
    operands: [knownTotal, askFinal],
    correctAnswer: numericAnswer(answer),
    questionText: `If ${knownCount} ${item} cost ${knownTotal}¢, how much do ${askFinal} ${item} cost in cents?`,
    metadata: {},
  };
}
