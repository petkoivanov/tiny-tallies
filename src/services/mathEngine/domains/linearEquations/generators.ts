/**
 * Linear Equations domain generators.
 *
 * All generators use the construction-from-answer pattern:
 * pick x first, then derive the equation from x. NEVER compute x by solving.
 *
 * Operand layout stored in every result:
 *   operands[0] = wrong-operation result (for lin_wrong_operation / lin_forgot_to_divide bug patterns)
 *   operands[1] = the constant b (for lin_sign_flip: compute(a=operands[0], b=operands[1]))
 *   operands[2] = correct answer x (informational)
 *
 * Unicode minus "−" (U+2212) is used in question text for subtraction.
 */

import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import { numericAnswer } from '../../types';

export function generateOneStepAddSub(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const x = rng.intRange(2, 20);
  const b = rng.intRange(1, 15);
  const rhs = x + b;

  // Wrong operation: student adds b instead of subtracting → rhs + b
  const wrongOp = rhs + b;

  return {
    operands: [wrongOp, b, x],
    correctAnswer: numericAnswer(x),
    questionText: `x + ${b} = ${rhs}. Solve for x.`,
    metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false },
  };
}

export function generateOneStepMulDiv(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const x = rng.intRange(2, 12);
  const a = rng.intRange(2, 9);
  const rhs = a * x;

  // Wrong operation: student doesn't divide, just uses rhs
  const forgotDiv = rhs;

  return {
    operands: [forgotDiv, a, x],
    correctAnswer: numericAnswer(x),
    questionText: `${a}x = ${rhs}. Solve for x.`,
    metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false },
  };
}

export function generateTwoStepAddMul(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const x = rng.intRange(1, 10);
  const a = rng.intRange(2, 6);
  const b = rng.intRange(1, 10);
  const rhs = a * x + b;

  // Wrong operation: student subtracts b but forgets to divide by a
  const forgotDiv = rhs - b;

  return {
    operands: [forgotDiv, b, x],
    correctAnswer: numericAnswer(x),
    questionText: `${a}x + ${b} = ${rhs}. Solve for x.`,
    metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false },
  };
}

export function generateTwoStepSubDiv(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const x = rng.intRange(1, 10);
  const a = rng.intRange(2, 6);
  const b = rng.intRange(1, 10);
  const rhs = a * x - b;

  // Wrong operation: student adds b back but forgets to divide by a
  const forgotDiv = rhs + b;

  return {
    operands: [forgotDiv, b, x],
    correctAnswer: numericAnswer(x),
    questionText: `${a}x \u2212 ${b} = ${rhs}. Solve for x.`,
    metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false },
  };
}

export function generateTwoStepMixed(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Use rng.next() < 0.5 to pick add or sub variant inline
  if (rng.next() < 0.5) {
    // Add/multiply variant (ax + b = rhs)
    const x = rng.intRange(1, 10);
    const a = rng.intRange(2, 6);
    const b = rng.intRange(1, 10);
    const rhs = a * x + b;
    const forgotDiv = rhs - b;

    return {
      operands: [forgotDiv, b, x],
      correctAnswer: numericAnswer(x),
      questionText: `${a}x + ${b} = ${rhs}. Solve for x.`,
      metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false },
    };
  } else {
    // Sub/divide variant (ax - b = rhs)
    const x = rng.intRange(1, 10);
    const a = rng.intRange(2, 6);
    const b = rng.intRange(1, 10);
    const rhs = a * x - b;
    const forgotDiv = rhs + b;

    return {
      operands: [forgotDiv, b, x],
      correctAnswer: numericAnswer(x),
      questionText: `${a}x \u2212 ${b} = ${rhs}. Solve for x.`,
      metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false },
    };
  }
}

export function generateMultiStep(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const x = rng.intRange(1, 8);
  const a = rng.intRange(2, 5);
  const b = rng.intRange(1, 8);
  const c = rng.intRange(1, 6);
  const coeff = a + c;
  const rhs = coeff * x + b;

  // Wrong operation: student combines like terms and subtracts b but forgets to divide
  const forgotDiv = rhs - b;

  return {
    operands: [forgotDiv, b, x],
    correctAnswer: numericAnswer(x),
    questionText: `${a}x + ${c}x + ${b} = ${rhs}. Solve for x.`,
    metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false },
  };
}

export function generateNegativeSolution(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const x = rng.intRange(-10, -1);
  const b = rng.intRange(1, 15);
  const rhs = x + b;

  // Wrong operation: student adds b instead of subtracting
  const wrongOp = rhs + b;

  return {
    operands: [wrongOp, b, x],
    correctAnswer: numericAnswer(x),
    questionText: `x + ${b} = ${rhs}. Solve for x.`,
    metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false },
  };
}

export function generateWordProblemVariant(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Word problems use the two-step add/mul equation structure
  const x = rng.intRange(1, 10);
  const a = rng.intRange(2, 6);
  const b = rng.intRange(1, 10);
  const rhs = a * x + b;
  const forgotDiv = rhs - b;

  return {
    operands: [forgotDiv, b, x],
    correctAnswer: numericAnswer(x),
    questionText: `${a}x + ${b} = ${rhs}. Solve for x.`,
    metadata: {
      digitCount: 1,
      requiresCarry: false,
      requiresBorrow: false,
      wordProblem: true,
    },
  };
}
