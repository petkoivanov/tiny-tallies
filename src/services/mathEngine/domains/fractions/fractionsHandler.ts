/**
 * Fractions domain handler — dispatches to sub-generators by template type.
 *
 * Reads template.domainConfig.type (and optional .constraint) to route
 * to the correct generator function. Covers grades 1-6 fraction skills.
 */

import type {
  DomainHandler,
  DomainProblemData,
  ProblemTemplate,
} from '../../types';
import type { SeededRng } from '../../seededRng';

import {
  generatePartitioning,
  generateIdentify,
  generateUnit,
  generateNumberLine,
  generateEquivalent,
  generateCompareSameDenom,
  generateCompareSameNumer,
} from './foundationGenerators';

import {
  generateAddSubtractLike,
  generateMixedNumbers,
  generateMultiplyWhole,
  generateAddSubtractUnlike,
  generateMultiplyFractions,
  generateDivideUnitFraction,
  generateDivideFractions,
} from './operationGenerators';

type FractionType =
  | 'partitioning'
  | 'identify'
  | 'unit'
  | 'number_line'
  | 'equivalent'
  | 'compare'
  | 'add_subtract'
  | 'mixed_numbers'
  | 'multiply_whole'
  | 'add_subtract_unlike'
  | 'multiply_fractions'
  | 'divide_unit_fraction'
  | 'divide_fractions';

function getType(template: ProblemTemplate): FractionType {
  const cfg = template.domainConfig as
    | { type: FractionType; constraint?: string }
    | undefined;
  return cfg?.type ?? 'partitioning';
}

function getConstraint(template: ProblemTemplate): string | undefined {
  const cfg = template.domainConfig as
    | { constraint?: string }
    | undefined;
  return cfg?.constraint;
}

function dispatch(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const type = getType(template);

  switch (type) {
    case 'partitioning':
      return generatePartitioning(template, rng);
    case 'identify':
      return generateIdentify(template, rng);
    case 'unit':
      return generateUnit(template, rng);
    case 'number_line':
      return generateNumberLine(template, rng);
    case 'equivalent':
      return generateEquivalent(template, rng);
    case 'compare': {
      const constraint = getConstraint(template);
      return constraint === 'same_numerator'
        ? generateCompareSameNumer(template, rng)
        : generateCompareSameDenom(template, rng);
    }
    case 'add_subtract': {
      const constraint = getConstraint(template);
      return constraint === 'unlike_denominator'
        ? generateAddSubtractUnlike(template, rng)
        : generateAddSubtractLike(template, rng);
    }
    case 'mixed_numbers':
      return generateMixedNumbers(template, rng);
    case 'multiply_whole':
      return generateMultiplyWhole(template, rng);
    case 'add_subtract_unlike':
      return generateAddSubtractUnlike(template, rng);
    case 'multiply_fractions':
      return generateMultiplyFractions(template, rng);
    case 'divide_unit_fraction':
      return generateDivideUnitFraction(template, rng);
    case 'divide_fractions':
      return generateDivideFractions(template, rng);
  }
}

export const fractionsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    return dispatch(template, rng);
  },
};
