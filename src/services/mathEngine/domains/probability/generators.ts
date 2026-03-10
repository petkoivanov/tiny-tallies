import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

interface MarbleContext {
  label: string;
  itemName: string;
  colors: [string, string];
  containerPhrase: string;
}

const CONTEXTS: MarbleContext[] = [
  {
    label: 'marbles',
    itemName: 'marble',
    colors: ['red', 'blue'],
    containerPhrase: 'A bag has',
  },
  {
    label: 'marbles',
    itemName: 'marble',
    colors: ['red', 'green'],
    containerPhrase: 'A bag has',
  },
  {
    label: 'cards',
    itemName: 'card',
    colors: ['red', 'black'],
    containerPhrase: 'A deck has',
  },
  {
    label: 'spinner sections',
    itemName: 'section',
    colors: ['blue', 'yellow'],
    containerPhrase: 'A spinner has',
  },
];

/** Grade 7: Basic probability — "What is the probability of picking red?" */
export function generateBasic(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const total = rng.intRange(5, 20);
  const favorable = rng.intRange(1, total - 1);
  const other = total - favorable;

  const ctx = CONTEXTS[rng.intRange(0, CONTEXTS.length - 1)];
  const [color1, color2] = ctx.colors;

  const questionText =
    `${ctx.containerPhrase} ${favorable} ${color1} and ${other} ${color2} ${ctx.label}. ` +
    `If you pick one ${ctx.itemName}, what is the probability of picking ${color1}? ` +
    `Answer as a numerator when the denominator is ${total}.`;

  return {
    operands: [favorable, total],
    correctAnswer: numericAnswer(favorable),
    questionText,
    metadata: {},
  };
}

/** Grade 7: Complement probability — "What is the probability of NOT picking red?" */
export function generateComplement(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const total = rng.intRange(5, 20);
  const favorable = rng.intRange(1, total - 1);
  const other = total - favorable;

  const ctx = CONTEXTS[rng.intRange(0, CONTEXTS.length - 1)];
  const [color1, color2] = ctx.colors;

  const complementAnswer = total - favorable;

  const questionText =
    `${ctx.containerPhrase} ${favorable} ${color1} and ${other} ${color2} ${ctx.label}. ` +
    `If you pick one ${ctx.itemName}, what is the probability of NOT picking ${color1}? ` +
    `Answer as a numerator when the denominator is ${total}.`;

  return {
    operands: [favorable, total],
    correctAnswer: numericAnswer(complementAnswer),
    questionText,
    metadata: {},
  };
}
