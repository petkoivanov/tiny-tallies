import type {
  DomainHandler,
  DomainProblemData,
  ProblemTemplate,
} from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateGcf,
  generateLcm,
  generateAbsoluteValue,
} from './generators';

type NumberTheoryType = 'gcf' | 'lcm' | 'absolute_value';

export const numberTheoryHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const config = template.domainConfig as { type: NumberTheoryType };
    switch (config.type) {
      case 'gcf':
        return generateGcf(template, rng);
      case 'lcm':
        return generateLcm(template, rng);
      case 'absolute_value':
        return generateAbsoluteValue(template, rng);
      default:
        throw new Error(`Unknown number theory type: ${config.type}`);
    }
  },
};
