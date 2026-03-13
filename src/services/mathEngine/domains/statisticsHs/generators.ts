/**
 * Statistics HS problem generators.
 * All generators use construction-from-answer pattern: pick the answer first,
 * then build the problem around it.
 *
 * Operand layout per generator:
 *
 * generateStdDevConcept:
 *   operands[0] = wrongChoice: 3 - answer (the other dataset index)
 *   operands[1] = 0 (unused)
 *
 * generateNormalDistribution:
 *   operands[0] = wrongBand: swapped rule (68↔95)
 *   operands[1] = wrongTail: 100 - answer
 *
 * generateZScore:
 *   operands[0] = wrongSignFlip: -z (negated z-score)
 *   operands[1] = wrongForgetMu: z * sigma (forgot to divide by sigma — equals x - mu)
 *
 * generatePercentile:
 *   operands[0] = wrongSign: PERCENTILE_TABLE[-z] (used opposite z)
 *   operands[1] = wrongTail: 100 - answer
 */

import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

/**
 * Fixed percentile lookup table for z-scores in [-2, 2].
 * Values are standard normal CDF rounded to nearest integer percent.
 */
const PERCENTILE_TABLE: Record<number, number> = {
  [-2]: 2,
  [-1]: 16,
  [0]: 50,
  [1]: 84,
  [2]: 97,
};

/**
 * Pick a random element from an array using the seeded rng.
 */
function rngChoice<T>(rng: SeededRng, items: T[]): T {
  const idx = rng.intRange(0, items.length - 1);
  return items[idx];
}

/**
 * Generate a standard deviation concept problem.
 * Presents two datasets, asks which has the larger spread (standard deviation).
 *
 * Construction-from-answer: pick winner (1 or 2), generate datasets accordingly.
 * Answer is always 1 or 2 (integer index).
 */
export function generateStdDevConcept(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Pick which dataset has larger spread (1=A, 2=B)
  const answer = rng.intRange(1, 2);

  // Pick center and spread parameters
  const center = rng.intRange(10, 20) * 5; // e.g. 50, 55, ..., 100
  const spreadSigma = rng.intRange(3, 8);   // winner spread
  const tightSigma = Math.max(1, Math.floor(spreadSigma / 3)); // loser spread

  // Generate 5 values for each dataset
  function buildDataset(sigma: number): number[] {
    const values: number[] = [];
    for (let i = 0; i < 5; i++) {
      const offset = rng.intRange(-sigma, sigma);
      values.push(center + offset);
    }
    return values;
  }

  const wideDataset = buildDataset(spreadSigma);
  const tightDataset = buildDataset(tightSigma);

  // Assign datasets based on answer
  const valuesA = answer === 1 ? wideDataset : tightDataset;
  const valuesB = answer === 1 ? tightDataset : wideDataset;

  // Distractor operands
  const wrongChoice = 3 - answer; // the other dataset

  const questionText =
    `Dataset A: ${valuesA.join(', ')}. Dataset B: ${valuesB.join(', ')}. ` +
    `Which dataset has the larger standard deviation? (Enter 1 for A or 2 for B)`;

  return {
    operands: [wrongChoice, 0],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * Generate a normal distribution 68-95 rule problem.
 * Asks what percent of values fall within Nσ of the mean.
 *
 * MANDATORY: Only 68% (1σ) and 95% (2σ) — no 99.7% (avoids decimal pitfall).
 * Answer is 68 or 95 (always integer).
 */
export function generateNormalDistribution(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Construction-from-answer: pick 68 or 95
  const answer = rngChoice(rng, [68, 95]);
  const sigmaCount = answer === 68 ? 1 : 2;

  // Distractor operands
  const wrongBand = answer === 68 ? 95 : 68;   // swapped rule
  const wrongTail = 100 - answer;               // wrong tail interpretation

  const questionText =
    `In a normal distribution with mean μ and standard deviation σ, ` +
    `approximately what percent of values fall within ${sigmaCount}σ of the mean?`;

  return {
    operands: [wrongBand, wrongTail],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}

/**
 * Generate a z-score calculation problem.
 * Uses construction-from-answer: pick z first, then build x = mu + z*sigma.
 *
 * MANDATORY bounds:
 *   z ∈ [-2, 2] (integer)
 *   sigma ∈ {5, 10, 15, 20}
 *   mu ∈ [5, 15] * 10 = [50, 150]
 *   x = mu + z*sigma (always integer)
 */
export function generateZScore(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Construction-from-answer: pick z, sigma, mu, compute x
  const z = rng.intRange(-2, 2);
  const sigma = rngChoice(rng, [5, 10, 15, 20]);
  const mu = rng.intRange(5, 15) * 10;
  const x = mu + z * sigma;

  // Distractor operands
  const wrongSignFlip = -z;         // negated z-score
  const wrongForgetMu = z * sigma;  // forgot to divide by sigma (= x - mu)

  const questionText =
    `A dataset has mean ${mu} and standard deviation ${sigma}. ` +
    `What is the z-score of the value ${x}?`;

  return {
    operands: [wrongSignFlip, wrongForgetMu],
    correctAnswer: numericAnswer(z),
    questionText,
    metadata: {},
  };
}

/**
 * Generate a percentile-from-z-score problem.
 * Uses fixed lookup table — no algorithmic computation.
 *
 * Answer is always an integer from the PERCENTILE_TABLE.
 */
export function generatePercentile(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Pick z from valid keys
  const z = rngChoice(rng, [-2, -1, 0, 1, 2]);
  const answer = PERCENTILE_TABLE[z];

  // Distractor operands
  const wrongSign = PERCENTILE_TABLE[-z];  // used opposite z
  const wrongTail = 100 - answer;          // wrong tail interpretation

  const questionText =
    `In a normal distribution, a value with a z-score of ${z} is at approximately what percentile?`;

  return {
    operands: [wrongSign, wrongTail],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}
