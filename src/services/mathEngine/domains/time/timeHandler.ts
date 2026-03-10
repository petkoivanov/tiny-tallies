/**
 * Time domain handler — dispatches to sub-generators by template type.
 *
 * Reads template.domainConfig.type and optional .precision to route
 * to the correct generator. Covers grades 1-3 time skills.
 */

import type {
  DomainHandler,
  DomainProblemData,
  ProblemTemplate,
} from '../../types';
import type { SeededRng } from '../../seededRng';

import { generateReadClock, generateAmPm, generateElapsed } from './generators';

type TimeType = 'read_clock' | 'am_pm' | 'elapsed';

function getType(template: ProblemTemplate): TimeType {
  const cfg = template.domainConfig as
    | { type: TimeType; precision?: string }
    | undefined;
  return cfg?.type ?? 'read_clock';
}

function getPrecision(template: ProblemTemplate): string {
  const cfg = template.domainConfig as
    | { precision?: string }
    | undefined;
  return cfg?.precision ?? 'hour';
}

function dispatch(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const type = getType(template);

  switch (type) {
    case 'read_clock':
      return generateReadClock(template, rng, getPrecision(template));
    case 'am_pm':
      return generateAmPm(template, rng);
    case 'elapsed':
      return generateElapsed(template, rng);
  }
}

export const timeHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    return dispatch(template, rng);
  },
};
