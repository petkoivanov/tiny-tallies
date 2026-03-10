import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateEvaluate,
  generateSquare,
  generateCube,
  generatePowerOf10,
  generateSquareRoot,
  generateNegative,
} from './generators';

type ExponentsType =
  | 'evaluate'
  | 'square'
  | 'cube'
  | 'power_of_10'
  | 'square_root'
  | 'negative';

export const exponentsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const config = template.domainConfig as { type: ExponentsType };
    switch (config.type) {
      case 'evaluate':
        return generateEvaluate(template, rng);
      case 'square':
        return generateSquare(template, rng);
      case 'cube':
        return generateCube(template, rng);
      case 'power_of_10':
        return generatePowerOf10(template, rng);
      case 'square_root':
        return generateSquareRoot(template, rng);
      case 'negative':
        return generateNegative(template, rng);
      default:
        throw new Error(`Unknown exponents type: ${config.type}`);
    }
  },
};
