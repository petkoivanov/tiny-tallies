import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateConvertDown,
  generateConvertUp,
  generateCompare,
  generateMetric,
  generateMultiStep,
} from './generators';

type MeasurementType =
  | 'convert_down'
  | 'convert_up'
  | 'compare'
  | 'metric'
  | 'multi_step';

export const measurementHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const config = template.domainConfig as { type: MeasurementType };
    switch (config.type) {
      case 'convert_down':
        return generateConvertDown(template, rng);
      case 'convert_up':
        return generateConvertUp(template, rng);
      case 'compare':
        return generateCompare(template, rng);
      case 'metric':
        return generateMetric(template, rng);
      case 'multi_step':
        return generateMultiStep(template, rng);
      default:
        throw new Error(`Unknown measurement type: ${config.type}`);
    }
  },
};
