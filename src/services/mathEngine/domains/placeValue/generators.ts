/**
 * Place value generators — grades 1-4.
 *
 * Covers: decompose (ones/tens), identify digit, read/write numbers,
 * compare, skip counting, rounding, and expanded form.
 *
 * All answers are integers (NumericAnswer) for multiple-choice.
 */

import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

const PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands'] as const;
const MAX_ATTEMPTS = 50;

/** Grade 1: How many tens/ones are in N? */
export function generateDecompose(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 10, max: 99 },
    { min: 1, max: 1 },
  ];
  const number = rng.intRange(ranges[0].min, ranges[0].max);
  const digits = String(number).split('').reverse().map(Number);
  const place = rng.intRange(0, 1); // ones or tens for 2-digit
  const answer = digits[place];

  return {
    operands: [number, place],
    correctAnswer: numericAnswer(answer),
    questionText: `How many ${PLACE_NAMES[place]} are in ${number}?`,
    metadata: { digitCount: template.digitCount },
  };
}

/** Grade 2/4: What digit is in the ___ place of N? */
export function generateIdentifyDigit(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 100, max: 999 },
    { min: 1, max: 1 },
  ];
  const number = rng.intRange(ranges[0].min, ranges[0].max);
  const digits = String(number).split('').reverse().map(Number);
  const maxPlace = digits.length - 1;
  const place = rng.intRange(0, maxPlace);
  const answer = digits[place];

  return {
    operands: [number, place],
    correctAnswer: numericAnswer(answer),
    questionText: `What digit is in the ${PLACE_NAMES[place]} place of ${number}?`,
    metadata: { digitCount: template.digitCount },
  };
}

/** Grade 2: What number has N hundreds, M tens, P ones? */
export function generateReadWrite(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 100, max: 999 },
    { min: 1, max: 1 },
  ];
  const number = rng.intRange(ranges[0].min, ranges[0].max);
  const digits = String(number).split('').reverse().map(Number);

  // Build description from highest place down, skipping zeros
  const parts: string[] = [];
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] > 0) {
      parts.push(`${digits[i]} ${PLACE_NAMES[i]}`);
    }
  }

  return {
    operands: [number, 0],
    correctAnswer: numericAnswer(number),
    questionText: `What number has ${parts.join(', ')}?`,
    metadata: { digitCount: template.digitCount },
  };
}

/** Grade 2: Which is greater — A or B? */
export function generateCompare(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 10, max: 999 },
    { min: 10, max: 999 },
  ];

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const a = rng.intRange(ranges[0].min, ranges[0].max);
    const b = rng.intRange(ranges[1].min, ranges[1].max);
    if (a === b) continue;

    const answer = Math.max(a, b);
    return {
      operands: [a, b],
      correctAnswer: numericAnswer(answer),
      questionText: `Which is greater: ${a} or ${b}?`,
      metadata: { digitCount: template.digitCount },
    };
  }

  return {
    operands: [45, 54],
    correctAnswer: numericAnswer(54),
    questionText: 'Which is greater: 45 or 54?',
    metadata: { digitCount: template.digitCount },
  };
}

/** Grade 2: Skip counting — what comes next? */
export function generateSkipCount(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const steps = [2, 5, 10, 100];
  const step = steps[rng.intRange(0, steps.length - 1)];

  // Pick starting value as a multiple of step
  const maxMultiple = step === 100 ? 5 : step === 10 ? 8 : 10;
  const startMultiple = rng.intRange(0, maxMultiple);
  const start = startMultiple * step;

  // Show 4 numbers, ask for the 5th
  const sequence: number[] = [];
  for (let i = 0; i < 4; i++) {
    sequence.push(start + step * i);
  }
  const answer = start + step * 4;

  return {
    operands: [sequence[3], step],
    correctAnswer: numericAnswer(answer),
    questionText: `What comes next? ${sequence.join(', ')}, ?`,
    metadata: { digitCount: template.digitCount },
  };
}

/** Grade 3: Round N to the nearest 10 or 100. */
export function generateRounding(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 10, max: 999 },
    { min: 10, max: 100 },
  ];
  const roundTo = rng.next() < 0.5 ? 10 : 100;

  // For rounding to 100, ensure number is at least 3 digits
  const minVal = roundTo === 100 ? Math.max(ranges[0].min, 100) : ranges[0].min;
  const number = rng.intRange(minVal, ranges[0].max);

  const answer = Math.round(number / roundTo) * roundTo;

  return {
    operands: [number, roundTo],
    correctAnswer: numericAnswer(answer),
    questionText: `Round ${number} to the nearest ${roundTo}.`,
    metadata: { digitCount: template.digitCount },
  };
}

/**
 * Grade 4: Expanded form — two variants:
 * 1. Missing term: "3456 = 3000 + ? + 50 + 6" → 400
 * 2. Compose: "3000 + 400 + 50 + 6 = ?" → 3456
 */
export function generateExpandedForm(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1000, max: 9999 },
    { min: 1, max: 1 },
  ];

  // Ensure at least 3 non-zero digits for interesting expanded form
  let number: number;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    number = rng.intRange(ranges[0].min, ranges[0].max);
    const nonZeroCount = String(number).split('').filter(d => d !== '0').length;
    if (nonZeroCount >= 3) break;
  }
  number = number!;

  const digits = String(number).split('').reverse().map(Number);
  const terms = digits
    .map((d, i) => d * Math.pow(10, i))
    .filter(t => t > 0);
  terms.reverse(); // largest first

  // Missing term variant when we have enough terms
  if (rng.next() < 0.5 && terms.length >= 3) {
    const hideIdx = rng.intRange(0, terms.length - 1);
    const answer = terms[hideIdx];
    const display = terms.map((t, i) => (i === hideIdx ? '?' : String(t)));

    return {
      operands: [number, answer],
      correctAnswer: numericAnswer(answer),
      questionText: `${number} = ${display.join(' + ')}`,
      metadata: { digitCount: template.digitCount },
    };
  }

  // Compose variant: expanded → number
  return {
    operands: [number, 0],
    correctAnswer: numericAnswer(number),
    questionText: `${terms.join(' + ')} = ?`,
    metadata: { digitCount: template.digitCount },
  };
}

// ---------------------------------------------------------------------------
// Grade 5: Decimal place value generators
// ---------------------------------------------------------------------------

const DECIMAL_PLACE_NAMES = ['tenths', 'hundredths', 'thousandths'] as const;

/** Grade 5: Identify decimal digit — "What digit is in the tenths place of 3.47?" → 4 */
export function generateDecimalIdentify(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Generate a decimal number with 2-3 decimal places
  const wholepart = rng.intRange(1, 99);
  const decPlaces = rng.intRange(2, 3);
  const decPart = rng.intRange(
    Math.pow(10, decPlaces - 1),
    Math.pow(10, decPlaces) - 1,
  );
  const decStr = String(decPart).padStart(decPlaces, '0');
  const numberStr = `${wholepart}.${decStr}`;
  const number = parseFloat(numberStr);

  // Pick a decimal place to ask about (0 = tenths, 1 = hundredths, etc.)
  const place = rng.intRange(0, decPlaces - 1);
  const answer = parseInt(decStr[place], 10);

  return {
    operands: [number, place],
    correctAnswer: numericAnswer(answer),
    questionText: `What digit is in the ${DECIMAL_PLACE_NAMES[place]} place of ${numberStr}?`,
    metadata: { digitCount: template.digitCount },
  };
}

/** Grade 5: Decimal place value — "How many tenths are in 3.7?" → 37 */
export function generateDecimalDecompose(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const places = [10, 100]; // tenths or hundredths
  const divisor = places[rng.intRange(0, places.length - 1)];
  const placeName = divisor === 10 ? 'tenths' : 'hundredths';

  const wholepart = rng.intRange(1, 20);
  const decDigits = divisor === 10 ? 1 : 2;
  const decPart = rng.intRange(1, Math.pow(10, decDigits) - 1);
  const decStr = String(decPart).padStart(decDigits, '0');
  const numberStr = `${wholepart}.${decStr}`;
  const number = parseFloat(numberStr);

  const answer = Math.round(number * divisor);

  return {
    operands: [number, divisor],
    correctAnswer: numericAnswer(answer),
    questionText: `How many ${placeName} are in ${numberStr}?`,
    metadata: { digitCount: template.digitCount },
  };
}

/** Grade 5: Compare decimals — "Which is greater: 3.45 or 3.54?" → 3.54 */
export function generateDecimalCompare(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const a = rng.intRange(10, 99);
    const b = rng.intRange(10, 99);
    if (a === b) continue;

    const decA = a / 10; // e.g., 3.4
    const decB = b / 10;
    const answer = Math.max(decA, decB);

    return {
      operands: [decA, decB],
      correctAnswer: numericAnswer(answer),
      questionText: `Which is greater: ${decA.toFixed(1)} or ${decB.toFixed(1)}?`,
      metadata: { digitCount: template.digitCount, answerDisplay: answer.toFixed(1) },
    };
  }

  return {
    operands: [3.4, 3.5],
    correctAnswer: numericAnswer(3.5),
    questionText: 'Which is greater: 3.4 or 3.5?',
    metadata: { digitCount: template.digitCount, answerDisplay: '3.5' },
  };
}

/** Grade 5: Round decimals — "Round 3.47 to the nearest tenth" → 3.5 */
export function generateDecimalRounding(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Generate a number with hundredths
  const wholepart = rng.intRange(1, 20);
  const tenths = rng.intRange(0, 9);
  const hundredths = rng.intRange(1, 9); // avoid trailing zero
  const numberStr = `${wholepart}.${tenths}${hundredths}`;
  const number = parseFloat(numberStr);

  const answer = Math.round(number * 10) / 10;

  return {
    operands: [number, 10],
    correctAnswer: numericAnswer(answer),
    questionText: `Round ${numberStr} to the nearest tenth.`,
    metadata: { digitCount: template.digitCount, answerDisplay: answer.toFixed(1) },
  };
}
