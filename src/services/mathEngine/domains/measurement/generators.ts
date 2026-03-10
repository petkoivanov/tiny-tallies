import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

interface Conversion {
  fromUnit: string;
  toUnit: string;
  factor: number;
  question: (value: number) => string;
}

const LENGTH_CONVERSIONS: Conversion[] = [
  {
    fromUnit: 'feet',
    toUnit: 'inches',
    factor: 12,
    question: (v) => `${v} feet = ? inches`,
  },
  {
    fromUnit: 'yards',
    toUnit: 'feet',
    factor: 3,
    question: (v) => `${v} yards = ? feet`,
  },
  {
    fromUnit: 'meters',
    toUnit: 'centimeters',
    factor: 100,
    question: (v) => `${v} meters = ? centimeters`,
  },
  {
    fromUnit: 'kilometers',
    toUnit: 'meters',
    factor: 1000,
    question: (v) => `${v} kilometers = ? meters`,
  },
];

const CAPACITY_CONVERSIONS: Conversion[] = [
  {
    fromUnit: 'cups',
    toUnit: 'fluid ounces',
    factor: 8,
    question: (v) => `${v} cups = ? fluid ounces`,
  },
  {
    fromUnit: 'pints',
    toUnit: 'cups',
    factor: 2,
    question: (v) => `${v} pints = ? cups`,
  },
  {
    fromUnit: 'quarts',
    toUnit: 'pints',
    factor: 2,
    question: (v) => `${v} quarts = ? pints`,
  },
  {
    fromUnit: 'gallons',
    toUnit: 'quarts',
    factor: 4,
    question: (v) => `${v} gallons = ? quarts`,
  },
  {
    fromUnit: 'liters',
    toUnit: 'milliliters',
    factor: 1000,
    question: (v) => `${v} liters = ? milliliters`,
  },
];

const WEIGHT_CONVERSIONS: Conversion[] = [
  {
    fromUnit: 'pounds',
    toUnit: 'ounces',
    factor: 16,
    question: (v) => `${v} pounds = ? ounces`,
  },
  {
    fromUnit: 'kilograms',
    toUnit: 'grams',
    factor: 1000,
    question: (v) => `${v} kilograms = ? grams`,
  },
];

const TIME_CONVERSIONS: Conversion[] = [
  {
    fromUnit: 'hours',
    toUnit: 'minutes',
    factor: 60,
    question: (v) => `${v} hours = ? minutes`,
  },
  {
    fromUnit: 'minutes',
    toUnit: 'seconds',
    factor: 60,
    question: (v) => `${v} minutes = ? seconds`,
  },
  {
    fromUnit: 'days',
    toUnit: 'hours',
    factor: 24,
    question: (v) => `${v} days = ? hours`,
  },
  {
    fromUnit: 'weeks',
    toUnit: 'days',
    factor: 7,
    question: (v) => `${v} weeks = ? days`,
  },
];

/** Grade 4: Convert larger → smaller units (multiply) */
export function generateConvertDown(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const allConversions = [
    ...LENGTH_CONVERSIONS,
    ...CAPACITY_CONVERSIONS,
    ...WEIGHT_CONVERSIONS,
    ...TIME_CONVERSIONS,
  ];
  const conv = allConversions[rng.intRange(0, allConversions.length - 1)];
  const value = rng.intRange(1, 12);
  const answer = value * conv.factor;

  return {
    operands: [value, conv.factor],
    correctAnswer: numericAnswer(answer),
    questionText: conv.question(value),
    metadata: {},
  };
}

/** Grade 4: Convert smaller → larger units (divide, exact) */
export function generateConvertUp(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const allConversions = [
    ...LENGTH_CONVERSIONS,
    ...CAPACITY_CONVERSIONS,
    ...WEIGHT_CONVERSIONS,
    ...TIME_CONVERSIONS,
  ];
  const conv = allConversions[rng.intRange(0, allConversions.length - 1)];
  // Generate a multiple of the factor so answer is an integer
  const answer = rng.intRange(1, 10);
  const value = answer * conv.factor;

  return {
    operands: [value, conv.factor],
    correctAnswer: numericAnswer(answer),
    questionText: `${value} ${conv.toUnit} = ? ${conv.fromUnit}`,
    metadata: {},
  };
}

/** Grade 4-5: Compare measurements in different units */
export function generateCompare(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const conversions = [...LENGTH_CONVERSIONS, ...WEIGHT_CONVERSIONS];
  const conv = conversions[rng.intRange(0, conversions.length - 1)];

  const largeVal = rng.intRange(2, 8);
  const smallVal = largeVal * conv.factor + rng.intRange(-3, 3) * (conv.factor > 10 ? 1 : conv.factor);
  const largeInSmall = largeVal * conv.factor;

  // Answer: how many more (or fewer) small units?
  const diff = Math.abs(smallVal - largeInSmall);
  const questionText =
    `${largeVal} ${conv.fromUnit} = ${largeInSmall} ${conv.toUnit}. ` +
    `How many ${conv.toUnit} is ${smallVal} ${conv.toUnit} away from ${largeVal} ${conv.fromUnit}?`;

  return {
    operands: [smallVal, largeInSmall],
    correctAnswer: numericAnswer(diff),
    questionText,
    metadata: {},
  };
}

/** Grade 5: Metric conversions with powers of 10 */
export function generateMetric(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const metricConversions: Conversion[] = [
    { fromUnit: 'km', toUnit: 'm', factor: 1000, question: (v) => `${v} km = ? m` },
    { fromUnit: 'm', toUnit: 'cm', factor: 100, question: (v) => `${v} m = ? cm` },
    { fromUnit: 'cm', toUnit: 'mm', factor: 10, question: (v) => `${v} cm = ? mm` },
    { fromUnit: 'kg', toUnit: 'g', factor: 1000, question: (v) => `${v} kg = ? g` },
    { fromUnit: 'L', toUnit: 'mL', factor: 1000, question: (v) => `${v} L = ? mL` },
  ];

  const direction = rng.next() < 0.5 ? 'down' : 'up';
  const conv = metricConversions[rng.intRange(0, metricConversions.length - 1)];

  if (direction === 'down') {
    const value = rng.intRange(1, 15);
    return {
      operands: [value, conv.factor],
      correctAnswer: numericAnswer(value * conv.factor),
      questionText: conv.question(value),
      metadata: {},
    };
  } else {
    const answer = rng.intRange(1, 15);
    const value = answer * conv.factor;
    return {
      operands: [value, conv.factor],
      correctAnswer: numericAnswer(answer),
      questionText: `${value} ${conv.toUnit} = ? ${conv.fromUnit}`,
      metadata: {},
    };
  }
}

/** Grade 5: Multi-step conversion word problems */
export function generateMultiStep(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // "A rope is 3 feet long. How many inches is that? If you cut off 12 inches, how many remain?"
  const scenarios = [
    () => {
      const feet = rng.intRange(2, 6);
      const cutInches = rng.intRange(6, feet * 12 - 6);
      const totalInches = feet * 12;
      const remaining = totalInches - cutInches;
      return {
        operands: [totalInches, cutInches],
        correctAnswer: numericAnswer(remaining),
        questionText: `A rope is ${feet} feet (${totalInches} inches) long. If you cut off ${cutInches} inches, how many inches remain?`,
      };
    },
    () => {
      const kg = rng.intRange(2, 5);
      const usedG = rng.intRange(100, (kg - 1) * 1000);
      const totalG = kg * 1000;
      const remaining = totalG - usedG;
      return {
        operands: [totalG, usedG],
        correctAnswer: numericAnswer(remaining),
        questionText: `You have ${kg} kg (${totalG} g) of flour. You use ${usedG} g. How many grams remain?`,
      };
    },
  ];

  const scenario = scenarios[rng.intRange(0, scenarios.length - 1)]();
  return { ...scenario, metadata: {} };
}
