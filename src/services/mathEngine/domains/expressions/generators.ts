import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

const MAX_ATTEMPTS = 50;

/**
 * Grade 5: Two operations without parentheses — "3 + 4 × 2 = ?"
 * Tests operator precedence (multiply/divide before add/subtract).
 */
export function generateTwoOps(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const a = rng.intRange(1, 9);
    const b = rng.intRange(1, 9);
    const c = rng.intRange(1, 9);

    // Pattern: a ○ b ● c where ● is higher precedence
    const isAddFirst = rng.next() < 0.5;
    let correct: number;
    let leftToRight: number;
    let questionText: string;

    if (isAddFirst) {
      // a + b × c  (correct: a + (b*c), L-to-R: (a+b)*c)
      correct = a + b * c;
      leftToRight = (a + b) * c;
      questionText = `${a} + ${b} \u00d7 ${c} = ?`;
    } else {
      // a - b × c would often go negative for kids, use a × b + c vs a × b - c
      // Better: a × b + c (trivial) or c + a × b
      // Let's do: a + b × c and a - b × c (ensure positive)
      if (a >= b * c) {
        correct = a - b * c;
        leftToRight = (a - b) * c;
        questionText = `${a} \u2212 ${b} \u00d7 ${c} = ?`;
      } else {
        correct = a + b * c;
        leftToRight = (a + b) * c;
        questionText = `${a} + ${b} \u00d7 ${c} = ?`;
      }
    }

    if (correct !== leftToRight && correct >= 0) {
      return {
        operands: [leftToRight, correct, a, b, c],
        correctAnswer: numericAnswer(correct),
        questionText,
        metadata: {},
      };
    }
  }

  // Fallback: 3 + 4 × 2 = 11
  return {
    operands: [14, 11, 3, 4, 2],
    correctAnswer: numericAnswer(11),
    questionText: '3 + 4 \u00d7 2 = ?',
    metadata: {},
  };
}

/**
 * Grade 5: Parentheses change the order — "(3 + 4) × 2 = ?"
 */
export function generateParentheses(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const a = rng.intRange(1, 9);
  const b = rng.intRange(1, 9);
  const c = rng.intRange(2, 6);

  const isAdd = rng.next() < 0.5;
  let correct: number;
  let withoutParens: number;
  let questionText: string;

  if (isAdd) {
    // (a + b) × c
    correct = (a + b) * c;
    withoutParens = a + b * c;
    questionText = `(${a} + ${b}) \u00d7 ${c} = ?`;
  } else {
    // (a - b) × c, ensure a > b
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    if (big === small) {
      correct = (big + 1 - small) * c;
      withoutParens = big + 1 - small * c;
      questionText = `(${big + 1} \u2212 ${small}) \u00d7 ${c} = ?`;
    } else {
      correct = (big - small) * c;
      withoutParens = big - small * c;
      questionText = `(${big} \u2212 ${small}) \u00d7 ${c} = ?`;
    }
  }

  return {
    operands: [withoutParens, correct, a, b, c],
    correctAnswer: numericAnswer(correct),
    questionText,
    metadata: {},
  };
}

/**
 * Grade 5: Three operations — "2 + 3 × 4 - 1 = ?"
 */
export function generateThreeOps(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const a = rng.intRange(1, 9);
    const b = rng.intRange(1, 5);
    const c = rng.intRange(1, 5);
    const d = rng.intRange(1, 9);

    // a + b × c - d
    const correct = a + b * c - d;
    const leftToRight = ((a + b) * c) - d;

    if (correct >= 0 && correct !== leftToRight) {
      return {
        operands: [leftToRight, correct, a, b, c, d],
        correctAnswer: numericAnswer(correct),
        questionText: `${a} + ${b} \u00d7 ${c} \u2212 ${d} = ?`,
        metadata: {},
      };
    }
  }

  // Fallback: 5 + 2 × 3 - 1 = 10
  return {
    operands: [20, 10, 5, 2, 3, 1],
    correctAnswer: numericAnswer(10),
    questionText: '5 + 2 \u00d7 3 \u2212 1 = ?',
    metadata: {},
  };
}

/**
 * Grade 5: Division in expressions — "12 ÷ 3 + 5 = ?"
 */
export function generateWithDivision(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const divisor = rng.intRange(2, 6);
    const quotient = rng.intRange(1, 8);
    const dividend = divisor * quotient;
    const addend = rng.intRange(1, 9);

    const isAddAfter = rng.next() < 0.5;
    let correct: number;
    let leftToRight: number;
    let questionText: string;

    if (isAddAfter) {
      // addend + dividend ÷ divisor
      correct = addend + quotient;
      leftToRight = Math.floor((addend + dividend) / divisor);
      questionText = `${addend} + ${dividend} \u00f7 ${divisor} = ?`;
    } else {
      // dividend ÷ divisor + addend
      correct = quotient + addend;
      leftToRight = Math.floor(dividend / (divisor + addend));
      questionText = `${dividend} \u00f7 ${divisor} + ${addend} = ?`;
    }

    if (correct !== leftToRight && correct >= 0) {
      return {
        operands: [leftToRight, correct],
        correctAnswer: numericAnswer(correct),
        questionText,
        metadata: {},
      };
    }
  }

  // Fallback: 2 + 12 ÷ 3 = 6
  return {
    operands: [4, 6],
    correctAnswer: numericAnswer(6),
    questionText: '2 + 12 \u00f7 3 = ?',
    metadata: {},
  };
}

/**
 * Grade 5: Nested parentheses — "2 × (3 + (4 - 1)) = ?"
 */
export function generateNestedParens(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const a = rng.intRange(2, 5);
  const b = rng.intRange(1, 6);
  const c = rng.intRange(2, 8);
  const d = rng.intRange(1, Math.min(c - 1, 5));

  // a × (b + (c - d))
  const inner = c - d;
  const paren = b + inner;
  const correct = a * paren;

  return {
    operands: [0, correct, a, b, c, d],
    correctAnswer: numericAnswer(correct),
    questionText: `${a} \u00d7 (${b} + (${c} \u2212 ${d})) = ?`,
    metadata: {},
  };
}

/**
 * Grade 6: One-step equations — "x + 5 = 12, what is x?"
 */
export function generateOneStepEquation(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const x = rng.intRange(2, 20);
  const opIndex = rng.intRange(0, 3);

  let questionText: string;
  let b: number;

  switch (opIndex) {
    case 0: {
      // Addition: x + b = sum
      b = rng.intRange(1, 15);
      const sum = x + b;
      questionText = `x + ${b} = ${sum}. What is x?`;
      break;
    }
    case 1: {
      // Subtraction: x - b = diff
      b = rng.intRange(1, Math.min(x - 1, 15));
      const diff = x - b;
      questionText = `x \u2212 ${b} = ${diff}. What is x?`;
      break;
    }
    case 2: {
      // Multiplication: a × x = product
      const a = rng.intRange(2, 9);
      const product = a * x;
      questionText = `${a} \u00d7 x = ${product}. What is x?`;
      break;
    }
    default: {
      // Division: x ÷ b = quotient
      b = rng.intRange(2, 9);
      const quotient = x;
      const dividend = x * b;
      questionText = `x \u00f7 ${b} = ${quotient}. What is x?`;
      return {
        operands: [dividend, b],
        correctAnswer: numericAnswer(dividend),
        questionText,
        metadata: {},
      };
    }
  }

  return {
    operands: [x],
    correctAnswer: numericAnswer(x),
    questionText,
    metadata: {},
  };
}

/**
 * Grade 6: Evaluate expressions with variables — "2x + 3 when x = 4"
 */
export function generateVariableEval(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const val = rng.intRange(1, 10);
  const exprIndex = rng.intRange(0, 2);

  let questionText: string;
  let answer: number;

  switch (exprIndex) {
    case 0: {
      // 2x + c
      const coeff = rng.intRange(2, 5);
      const c = rng.intRange(1, 10);
      answer = coeff * val + c;
      questionText = `What is ${coeff}x + ${c} when x = ${val}?`;
      break;
    }
    case 1: {
      // 3x - c
      const coeff = rng.intRange(2, 5);
      const c = rng.intRange(1, Math.min(coeff * val - 1, 10));
      answer = coeff * val - c;
      questionText = `What is ${coeff}x \u2212 ${c} when x = ${val}?`;
      break;
    }
    default: {
      // x² + c
      const c = rng.intRange(1, 10);
      answer = val * val + c;
      questionText = `What is x\u00B2 + ${c} when x = ${val}?`;
      break;
    }
  }

  return {
    operands: [val],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}
