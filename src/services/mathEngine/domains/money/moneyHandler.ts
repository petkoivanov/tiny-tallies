/**
 * Money domain handler — dispatches to sub-generators by template type.
 *
 * Reads template.domainConfig.type to route to the correct generator.
 * Covers grades 1-4 money skills.
 */

import type {
  DomainHandler,
  DomainProblemData,
  ProblemTemplate,
} from '../../types';
import type { SeededRng } from '../../seededRng';

import {
  generateIdentify,
  generateCountSame,
  generateCountMixed,
  generateNotation,
  generateMakingChange,
  generateMultiStep,
  generateUnitPrice,
} from './generators';

type MoneyType =
  | 'identify'
  | 'count_same'
  | 'count_mixed'
  | 'notation'
  | 'making_change'
  | 'multi_step'
  | 'unit_price';

function getType(template: ProblemTemplate): MoneyType {
  const cfg = template.domainConfig as
    | { type: MoneyType }
    | undefined;
  return cfg?.type ?? 'identify';
}

function dispatch(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const type = getType(template);

  switch (type) {
    case 'identify':
      return generateIdentify(template, rng);
    case 'count_same':
      return generateCountSame(template, rng);
    case 'count_mixed':
      return generateCountMixed(template, rng);
    case 'notation':
      return generateNotation(template, rng);
    case 'making_change':
      return generateMakingChange(template, rng);
    case 'multi_step':
      return generateMultiStep(template, rng);
    case 'unit_price':
      return generateUnitPrice(template, rng);
  }
}

export const moneyHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    return dispatch(template, rng);
  },
};
