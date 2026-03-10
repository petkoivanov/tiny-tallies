import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

/** Grade 6: Greatest common factor — "What is the GCF of 24 and 36?" */
export function generateGcf(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const gcfValue = rng.intRange(2, 12);
  let a = rng.intRange(2, 8);
  let b = rng.intRange(2, 8);
  while (b === a) {
    b = rng.intRange(2, 8);
  }
  const num1 = gcfValue * a;
  const num2 = gcfValue * b;

  return {
    operands: [num1, num2],
    correctAnswer: numericAnswer(gcfValue),
    questionText: `What is the greatest common factor (GCF) of ${num1} and ${num2}?`,
    metadata: {},
  };
}

/** Grade 6: Least common multiple — "What is the LCM of 4 and 6?" */
export function generateLcm(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const a = rng.intRange(2, 12);
  const b = rng.intRange(2, 12);
  const lcmValue = (a * b) / gcd(a, b);

  return {
    operands: [a, b],
    correctAnswer: numericAnswer(lcmValue),
    questionText: `What is the least common multiple (LCM) of ${a} and ${b}?`,
    metadata: {},
  };
}

/** Grade 6: Absolute value — "What is |−7|?" */
export function generateAbsoluteValue(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  let n = rng.intRange(-20, 20);
  while (n === 0) {
    n = rng.intRange(-20, 20);
  }
  const answer = Math.abs(n);

  return {
    operands: [n],
    correctAnswer: numericAnswer(answer),
    questionText: `What is |${n}|?`,
    metadata: {},
  };
}
