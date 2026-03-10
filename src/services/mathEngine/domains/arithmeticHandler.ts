/**
 * Arithmetic domain handler — addition, subtraction, multiplication, division.
 *
 * Extracts the existing generation logic from generator.ts into a DomainHandler.
 * Handles carry/borrow constraints, division exactness, and result-range filtering.
 */

import {
  requiresCarry as checkCarry,
  requiresBorrow as checkBorrow,
} from '../constraints';
import { numericAnswer } from '../types';
import type {
  DomainHandler,
  DomainProblemData,
  Operation,
  ProblemTemplate,
} from '../types';
import type { SeededRng } from '../seededRng';

const MAX_ATTEMPTS = 100;

function generateOperands(
  template: ProblemTemplate,
  rng: SeededRng,
): [number, number] {
  if (!template.operandRanges) {
    throw new Error(
      `Template ${template.id} requires operandRanges for arithmetic generation`,
    );
  }

  const ranges = template.operandRanges;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const a = rng.intRange(ranges[0].min, ranges[0].max);

    // For subtraction, constrain b's upper bound to ensure non-negative result
    let bMax = ranges[1].max;
    if (template.operation === 'subtraction') {
      bMax = Math.min(bMax, a - 1);
      if (bMax < ranges[1].min) {
        continue;
      }
    }

    // For division, ensure a is divisible by b (no remainders unless template allows)
    if (template.operation === 'division') {
      const b = rng.intRange(ranges[1].min, ranges[1].max);
      if (b === 0) continue;
      // Generate a as a multiple of b within range
      const minMultiple = Math.ceil(ranges[0].min / b);
      const maxMultiple = Math.floor(ranges[0].max / b);
      if (minMultiple > maxMultiple) continue;
      const multiple = rng.intRange(minMultiple, maxMultiple);
      const dividend = multiple * b;

      if (template.resultRange) {
        const result = dividend / b;
        if (result < template.resultRange.min || result > template.resultRange.max) {
          continue;
        }
      }

      return [dividend, b];
    }

    const b = rng.intRange(ranges[1].min, bMax);

    // Check carry constraint
    if (template.requiresCarry === true && !checkCarry(a, b)) {
      continue;
    }
    if (template.requiresCarry === false && checkCarry(a, b)) {
      continue;
    }

    // Check borrow constraint
    if (template.requiresBorrow === true && !checkBorrow(a, b)) {
      continue;
    }
    if (template.requiresBorrow === false && checkBorrow(a, b)) {
      continue;
    }

    // Compute result and check range
    const result = computeAnswer(template.operation, a, b);

    if (template.resultRange) {
      if (result < template.resultRange.min || result > template.resultRange.max) {
        continue;
      }
    }

    return [a, b];
  }

  throw new Error(
    `Failed to generate operands for template ${template.id} after ${MAX_ATTEMPTS} attempts.`,
  );
}

function formatQuestion(operation: Operation, a: number, b: number): string {
  switch (operation) {
    case 'addition':
      return `${a} + ${b} = ?`;
    case 'subtraction':
      return `${a} - ${b} = ?`;
    case 'multiplication':
      return `${a} × ${b} = ?`;
    case 'division':
      return `${a} ÷ ${b} = ?`;
    default:
      return `${a} ? ${b} = ?`;
  }
}

function computeAnswer(operation: Operation, a: number, b: number): number {
  switch (operation) {
    case 'addition':
      return a + b;
    case 'subtraction':
      return a - b;
    case 'multiplication':
      return a * b;
    case 'division':
      return b !== 0 ? a / b : 0;
    default:
      return a + b;
  }
}

// ---------------------------------------------------------------------------
// Decimal arithmetic generation
// ---------------------------------------------------------------------------

interface DecimalConfig {
  decimal: true;
  places: number; // decimal places (1 = tenths, 2 = hundredths)
}

function isDecimalTemplate(template: ProblemTemplate): template is ProblemTemplate & { domainConfig: DecimalConfig } {
  return (template.domainConfig as Record<string, unknown> | undefined)?.decimal === true;
}

function generateDecimalOperands(
  template: ProblemTemplate,
  rng: SeededRng,
  places: number,
): [number, number] {
  const ranges = template.operandRanges;
  if (!ranges) {
    throw new Error(`Template ${template.id} requires operandRanges`);
  }

  const scale = Math.pow(10, places);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Generate as scaled integers then convert
    const aScaled = rng.intRange(
      Math.round(ranges[0].min * scale),
      Math.round(ranges[0].max * scale),
    );
    let bScaled = rng.intRange(
      Math.round(ranges[1].min * scale),
      Math.round(ranges[1].max * scale),
    );

    if (template.operation === 'subtraction' && bScaled >= aScaled) {
      bScaled = rng.intRange(Math.round(ranges[1].min * scale), aScaled - 1);
      if (bScaled < Math.round(ranges[1].min * scale)) continue;
    }

    if (template.operation === 'division') {
      if (bScaled === 0) continue;
      // Ensure clean division: generate b, then a as multiple of b
      const b = bScaled / scale;
      const minMult = Math.max(1, Math.ceil(ranges[0].min / b));
      const maxMult = Math.floor(ranges[0].max / b);
      if (minMult > maxMult) continue;
      const mult = rng.intRange(minMult, maxMult);
      const a = Math.round(mult * b * scale) / scale;
      return [a, b];
    }

    const a = aScaled / scale;
    const b = bScaled / scale;

    const result = computeAnswer(template.operation, a, b);
    const resultRounded = Math.round(result * scale) / scale;

    if (template.resultRange) {
      if (resultRounded < template.resultRange.min || resultRounded > template.resultRange.max) {
        continue;
      }
    }

    return [a, b];
  }

  // Fallback
  return [1.5, 0.5];
}

function formatDecimal(n: number, places: number): string {
  return n.toFixed(places);
}

// ---------------------------------------------------------------------------
// Integer (negative number) arithmetic generation
// ---------------------------------------------------------------------------

interface IntegerConfig {
  allowNegative: true;
}

function isIntegerTemplate(template: ProblemTemplate): boolean {
  return (template.domainConfig as Record<string, unknown> | undefined)?.allowNegative === true;
}

function generateIntegerOperands(
  template: ProblemTemplate,
  rng: SeededRng,
): [number, number] {
  const ranges = template.operandRanges;
  if (!ranges) {
    throw new Error(`Template ${template.id} requires operandRanges`);
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const a = rng.intRange(ranges[0].min, ranges[0].max);
    const b = rng.intRange(ranges[1].min, ranges[1].max);

    if (template.operation === 'division') {
      if (b === 0) continue;
      if (a % b !== 0) continue;
    }

    const result = computeAnswer(template.operation, a, b);

    if (template.resultRange) {
      if (result < template.resultRange.min || result > template.resultRange.max) {
        continue;
      }
    }

    return [a, b];
  }

  return [-3, 5]; // fallback
}

function formatIntegerQuestion(operation: Operation, a: number, b: number): string {
  const aStr = a < 0 ? `(${a})` : String(a);
  const bStr = b < 0 ? `(${b})` : String(b);
  switch (operation) {
    case 'addition':
      return `${aStr} + ${bStr} = ?`;
    case 'subtraction':
      return `${aStr} \u2212 ${bStr} = ?`;
    case 'multiplication':
      return `${aStr} \u00d7 ${bStr} = ?`;
    case 'division':
      return `${aStr} \u00f7 ${bStr} = ?`;
    default:
      return `${aStr} ? ${bStr} = ?`;
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export const arithmeticHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    if (isDecimalTemplate(template)) {
      const places = (template.domainConfig as DecimalConfig).places;
      const [a, b] = generateDecimalOperands(template, rng, places);
      const rawAnswer = computeAnswer(template.operation, a, b);
      const scale = Math.pow(10, places);
      const answer = Math.round(rawAnswer * scale) / scale;

      return {
        operands: [a, b],
        correctAnswer: numericAnswer(answer),
        questionText: `${formatDecimal(a, places)} ${opSymbol(template.operation)} ${formatDecimal(b, places)} = ?`,
        metadata: {
          digitCount: template.digitCount,
          requiresCarry: false,
          requiresBorrow: false,
          answerDisplay: formatDecimal(answer, places),
        },
      };
    }

    if (isIntegerTemplate(template)) {
      const [a, b] = generateIntegerOperands(template, rng);
      const answer = computeAnswer(template.operation, a, b);

      return {
        operands: [a, b],
        correctAnswer: numericAnswer(answer),
        questionText: formatIntegerQuestion(template.operation, a, b),
        metadata: {
          digitCount: template.digitCount,
          requiresCarry: false,
          requiresBorrow: false,
        },
      };
    }

    const [a, b] = generateOperands(template, rng);
    const answer = computeAnswer(template.operation, a, b);

    return {
      operands: [a, b],
      correctAnswer: numericAnswer(answer),
      questionText: formatQuestion(template.operation, a, b),
      metadata: {
        digitCount: template.digitCount,
        requiresCarry: template.requiresCarry ?? false,
        requiresBorrow: template.requiresBorrow ?? false,
      },
    };
  },
};

function opSymbol(operation: Operation): string {
  switch (operation) {
    case 'addition': return '+';
    case 'subtraction': return '\u2212';
    case 'multiplication': return '\u00d7';
    case 'division': return '\u00f7';
    default: return '?';
  }
}
