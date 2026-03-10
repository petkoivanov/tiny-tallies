/**
 * Place value domain handler — dispatches to sub-generators by template type.
 *
 * Reads template.domainConfig.type to route to the correct generator.
 * Covers grades 1-4 place value skills.
 */

import type {
  DomainHandler,
  DomainProblemData,
  ProblemTemplate,
} from '../../types';
import type { SeededRng } from '../../seededRng';

import {
  generateDecompose,
  generateIdentifyDigit,
  generateReadWrite,
  generateCompare,
  generateSkipCount,
  generateRounding,
  generateExpandedForm,
  generateDecimalIdentify,
  generateDecimalDecompose,
  generateDecimalCompare,
  generateDecimalRounding,
} from './generators';

type PlaceValueType =
  | 'decompose'
  | 'identify_digit'
  | 'read_write'
  | 'compare'
  | 'skip_count'
  | 'rounding'
  | 'expanded_form'
  | 'decimal_identify'
  | 'decimal_decompose'
  | 'decimal_compare'
  | 'decimal_rounding';

function getType(template: ProblemTemplate): PlaceValueType {
  const cfg = template.domainConfig as
    | { type: PlaceValueType }
    | undefined;
  return cfg?.type ?? 'decompose';
}

function dispatch(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const type = getType(template);

  switch (type) {
    case 'decompose':
      return generateDecompose(template, rng);
    case 'identify_digit':
      return generateIdentifyDigit(template, rng);
    case 'read_write':
      return generateReadWrite(template, rng);
    case 'compare':
      return generateCompare(template, rng);
    case 'skip_count':
      return generateSkipCount(template, rng);
    case 'rounding':
      return generateRounding(template, rng);
    case 'expanded_form':
      return generateExpandedForm(template, rng);
    case 'decimal_identify':
      return generateDecimalIdentify(template, rng);
    case 'decimal_decompose':
      return generateDecimalDecompose(template, rng);
    case 'decimal_compare':
      return generateDecimalCompare(template, rng);
    case 'decimal_rounding':
      return generateDecimalRounding(template, rng);
  }
}

export const placeValueHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    return dispatch(template, rng);
  },
};
