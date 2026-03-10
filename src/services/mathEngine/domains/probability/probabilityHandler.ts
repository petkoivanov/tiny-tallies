import type {
  DomainHandler,
  DomainProblemData,
  ProblemTemplate,
} from '../../types';
import type { SeededRng } from '../../seededRng';
import { generateBasic, generateComplement } from './generators';

type ProbabilityType = 'basic' | 'complement';

export const probabilityHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const config = template.domainConfig as { type: ProbabilityType };
    switch (config.type) {
      case 'basic':
        return generateBasic(template, rng);
      case 'complement':
        return generateComplement(template, rng);
      default:
        throw new Error(`Unknown probability type: ${config.type}`);
    }
  },
};
