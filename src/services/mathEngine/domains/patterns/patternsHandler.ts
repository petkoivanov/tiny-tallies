/**
 * Patterns domain handler — dispatches to sub-generators by template type.
 *
 * Reads template.domainConfig.type to route to the correct generator.
 * Covers grades 1-4 pattern skills.
 */

import type {
  DomainHandler,
  DomainProblemData,
  ProblemTemplate,
} from '../../types';
import type { SeededRng } from '../../seededRng';

import {
  generateFindNext,
  generateSkipCountPattern,
  generateMissingAddend,
  generateMissingFactor,
  generateInputOutput,
} from './generators';

type PatternsType =
  | 'find_next'
  | 'skip_count_pattern'
  | 'missing_addend'
  | 'missing_factor'
  | 'input_output';

function getType(template: ProblemTemplate): PatternsType {
  const cfg = template.domainConfig as
    | { type: PatternsType }
    | undefined;
  return cfg?.type ?? 'find_next';
}

function dispatch(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const type = getType(template);

  switch (type) {
    case 'find_next':
      return generateFindNext(template, rng);
    case 'skip_count_pattern':
      return generateSkipCountPattern(template, rng);
    case 'missing_addend':
      return generateMissingAddend(template, rng);
    case 'missing_factor':
      return generateMissingFactor(template, rng);
    case 'input_output':
      return generateInputOutput(template, rng);
  }
}

export const patternsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    return dispatch(template, rng);
  },
};
