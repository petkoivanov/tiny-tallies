import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

/** Grade 7: Complementary angles — "Two angles are complementary. One is 35°. What is the other?" */
export function generateComplementaryAngles(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Pick angle 10-80 as a multiple of 5
  const angle = rng.intRange(2, 16) * 5; // 10..80
  const answer = 90 - angle;

  return {
    operands: [angle, answer],
    correctAnswer: numericAnswer(answer),
    questionText: `Two angles are complementary. One is ${angle}\u00B0. What is the other?`,
    metadata: {},
  };
}

/** Grade 7: Supplementary angles — "Two angles are supplementary. One is 55°. What is the other?" */
export function generateSupplementaryAngles(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Pick angle 10-170 as a multiple of 5
  const angle = rng.intRange(2, 34) * 5; // 10..170
  const answer = 180 - angle;

  return {
    operands: [angle, answer],
    correctAnswer: numericAnswer(answer),
    questionText: `Two angles are supplementary. One is ${angle}\u00B0. What is the other?`,
    metadata: {},
  };
}

/** Grade 7: Circle area — "A circle has radius r. What is the area?" */
export function generateCircleArea(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const radii = [2, 3, 4, 5, 6, 7, 10];
  const r = radii[rng.intRange(0, radii.length - 1)];
  const answer = Math.round(3.14 * r * r);

  return {
    operands: [r, answer],
    correctAnswer: numericAnswer(answer),
    questionText: `A circle has radius ${r}. What is the area? (Round to nearest whole number, use \u03C0 \u2248 3.14)`,
    metadata: {},
  };
}

/** Grade 7: Circle circumference — "A circle has diameter d. What is the circumference?" */
export function generateCircleCircumference(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const diameters = [2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 20];
  const d = diameters[rng.intRange(0, diameters.length - 1)];
  const answer = Math.round(3.14 * d);

  return {
    operands: [d, answer],
    correctAnswer: numericAnswer(answer),
    questionText: `A circle has diameter ${d}. What is the circumference? (Round to nearest whole number, use \u03C0 \u2248 3.14)`,
    metadata: {},
  };
}

/** Grade 8: Pythagorean theorem — find hypotenuse or missing leg */
export function generatePythagorean(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const triples: [number, number, number][] = [
    [3, 4, 5],
    [5, 12, 13],
    [6, 8, 10],
    [8, 15, 17],
    [7, 24, 25],
  ];

  const [a, b, c] = triples[rng.intRange(0, triples.length - 1)];
  const askForHypotenuse = rng.intRange(0, 1) === 0;

  if (askForHypotenuse) {
    return {
      operands: [a, b, c],
      correctAnswer: numericAnswer(c),
      questionText: `A right triangle has legs ${a} and ${b}. What is the hypotenuse?`,
      metadata: {},
    };
  }

  // Ask for a leg — randomly pick which leg to hide
  const hideLegA = rng.intRange(0, 1) === 0;
  const knownLeg = hideLegA ? b : a;
  const missingLeg = hideLegA ? a : b;

  return {
    operands: [knownLeg, c, missingLeg],
    correctAnswer: numericAnswer(missingLeg),
    questionText: `A right triangle has a leg of ${knownLeg} and hypotenuse ${c}. What is the other leg?`,
    metadata: {},
  };
}

/** Grade 8: Slope from two points — "Find the slope of the line through (x1,y1) and (x2,y2)." */
export function generateSlope(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const slopes = [-3, -2, -1, 1, 2, 3];
  const slope = slopes[rng.intRange(0, slopes.length - 1)];
  const dx = rng.intRange(1, 3);

  const x1 = rng.intRange(0, 5);
  const y1 = rng.intRange(0, 5);
  const x2 = x1 + dx;
  const y2 = y1 + slope * dx;

  return {
    operands: [x1, y1, x2, y2],
    correctAnswer: numericAnswer(slope),
    questionText: `Find the slope of the line through (${x1},${y1}) and (${x2},${y2}).`,
    metadata: {},
  };
}
