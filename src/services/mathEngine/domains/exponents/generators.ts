import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

const SUPERSCRIPTS: Record<number, string> = {
  2: '\u00B2',
  3: '\u00B3',
  4: '\u2074',
  5: '\u2075',
};

/** Grade 5-6: Evaluate a power — "What is 3²?" */
export function generateEvaluate(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const base = rng.intRange(2, 10);
  const exp = rng.intRange(2, 4);
  const answer = Math.pow(base, exp);
  const sup = SUPERSCRIPTS[exp] ?? `^${exp}`;

  return {
    operands: [base, exp],
    correctAnswer: numericAnswer(answer),
    questionText: `What is ${base}${sup}?`,
    metadata: {},
  };
}

/** Grade 5: Squares — "What is 7²?" (restricted to squares) */
export function generateSquare(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const base = rng.intRange(1, 12);
  const answer = base * base;

  return {
    operands: [base, 2],
    correctAnswer: numericAnswer(answer),
    questionText: `What is ${base}\u00B2?`,
    metadata: {},
  };
}

/** Grade 5: Cubes — "What is 4³?" */
export function generateCube(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const base = rng.intRange(1, 6);
  const answer = base * base * base;

  return {
    operands: [base, 3],
    correctAnswer: numericAnswer(answer),
    questionText: `What is ${base}\u00B3?`,
    metadata: {},
  };
}

/** Grade 5: Powers of 10 — "What is 10³?" */
export function generatePowerOf10(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const exp = rng.intRange(1, 6);
  const answer = Math.pow(10, exp);
  const sup = SUPERSCRIPTS[exp] ?? `^${exp}`;

  return {
    operands: [10, exp],
    correctAnswer: numericAnswer(answer),
    questionText: `What is 10${sup}?`,
    metadata: {},
  };
}

/** Grade 6: Square roots of perfect squares — "√49 = ?" */
export function generateSquareRoot(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const root = rng.intRange(1, 12);
  const square = root * root;

  return {
    operands: [square, root],
    correctAnswer: numericAnswer(root),
    questionText: `What is \u221A${square}?`,
    metadata: {},
  };
}

/** Grade 8: Negative exponents — "5⁻² = 1/?" → answer is base² */
export function generateNegative(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const base = rng.intRange(2, 5);
  const exp = rng.intRange(1, 3);
  const denominator = Math.pow(base, exp);
  const sup = SUPERSCRIPTS[exp] ?? `^${exp}`;

  return {
    operands: [base, exp],
    correctAnswer: numericAnswer(denominator),
    questionText: `${base}\u207B${sup} = 1/?`,
    metadata: {},
  };
}
