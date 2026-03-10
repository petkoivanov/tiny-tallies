/**
 * Pattern generators — grades 1-4.
 *
 * Covers: find next in sequence, skip counting patterns,
 * missing addend, missing factor, and input/output tables.
 *
 * All answers are integers (NumericAnswer) for multiple-choice.
 */

import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

/** Grade 1: Find the next number in an additive sequence. */
export function generateFindNext(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 10 },
    { min: 1, max: 5 },
  ];

  const step = rng.intRange(ranges[1].min, ranges[1].max);
  const start = rng.intRange(ranges[0].min, ranges[0].max);

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

/** Grade 2: Skip counting pattern with larger steps. */
export function generateSkipCountPattern(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 2, max: 100 },
    { min: 2, max: 10 },
  ];

  const step = rng.intRange(ranges[1].min, ranges[1].max);
  const startMultiple = rng.intRange(0, Math.floor(ranges[0].max / step));
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

/** Grade 1: ? + B = C → find the missing addend. */
export function generateMissingAddend(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 20 },
    { min: 1, max: 10 },
  ];

  const a = rng.intRange(ranges[1].min, ranges[1].max);
  const b = rng.intRange(ranges[1].min, ranges[1].max);
  const sum = a + b;

  // Randomly choose which addend to hide
  if (rng.next() < 0.5) {
    // ? + b = sum
    return {
      operands: [a, b],
      correctAnswer: numericAnswer(a),
      questionText: `? + ${b} = ${sum}`,
      metadata: { digitCount: template.digitCount },
    };
  }

  // a + ? = sum
  return {
    operands: [a, b],
    correctAnswer: numericAnswer(b),
    questionText: `${a} + ? = ${sum}`,
    metadata: { digitCount: template.digitCount },
  };
}

/** Grade 3: ? × B = C → find the missing factor. */
export function generateMissingFactor(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 2, max: 9 },
    { min: 2, max: 9 },
  ];

  const a = rng.intRange(ranges[0].min, ranges[0].max);
  const b = rng.intRange(ranges[1].min, ranges[1].max);
  const product = a * b;

  // Randomly choose which factor to hide
  if (rng.next() < 0.5) {
    return {
      operands: [a, b],
      correctAnswer: numericAnswer(a),
      questionText: `? \u00d7 ${b} = ${product}`,
      metadata: { digitCount: template.digitCount },
    };
  }

  return {
    operands: [a, b],
    correctAnswer: numericAnswer(b),
    questionText: `${a} \u00d7 ? = ${product}`,
    metadata: { digitCount: template.digitCount },
  };
}

/**
 * Grade 4: Input/output table with a hidden rule.
 * Shows 2-3 input→output pairs, asks for the missing output.
 * Rules: add N, subtract N, or multiply by N.
 */
export function generateInputOutput(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 20 },
    { min: 1, max: 10 },
  ];

  const ruleType = rng.intRange(0, 2); // 0=add, 1=subtract, 2=multiply
  const ruleValue = rng.intRange(ranges[1].min, ranges[1].max);

  const apply = (x: number): number => {
    switch (ruleType) {
      case 0:
        return x + ruleValue;
      case 1:
        return x - ruleValue;
      default:
        return x * ruleValue;
    }
  };

  const ruleLabel =
    ruleType === 0
      ? `add ${ruleValue}`
      : ruleType === 1
        ? `subtract ${ruleValue}`
        : `multiply by ${ruleValue}`;

  // Generate 2 example pairs + 1 question
  const inputs: number[] = [];
  for (let i = 0; i < 3; i++) {
    let inp: number;
    do {
      inp = rng.intRange(ranges[0].min, ranges[0].max);
    } while (inputs.includes(inp) || (ruleType === 1 && inp < ruleValue));
    inputs.push(inp);
  }

  const outputs = inputs.map(apply);
  const answer = outputs[2];

  const rows = [
    `${inputs[0]} → ${outputs[0]}`,
    `${inputs[1]} → ${outputs[1]}`,
    `${inputs[2]} → ?`,
  ];

  return {
    operands: [inputs[2], ruleValue],
    correctAnswer: numericAnswer(answer),
    questionText: `Rule: ${ruleLabel}. ${rows.join(', ')}`,
    metadata: { digitCount: template.digitCount },
  };
}
