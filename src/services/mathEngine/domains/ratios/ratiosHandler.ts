import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateSimplifyRatio,
  generateEquivalentRatio,
  generateUnitRate,
  generatePercentOf,
  generateFractionToPercent,
  generatePercentChange,
  generateProportion,
} from './generators';

type RatiosType =
  | 'simplify'
  | 'equivalent'
  | 'unit_rate'
  | 'percent_of'
  | 'fraction_to_percent'
  | 'percent_change'
  | 'proportion';

export const ratiosHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const config = template.domainConfig as { type: RatiosType };
    switch (config.type) {
      case 'simplify':
        return generateSimplifyRatio(template, rng);
      case 'equivalent':
        return generateEquivalentRatio(template, rng);
      case 'unit_rate':
        return generateUnitRate(template, rng);
      case 'percent_of':
        return generatePercentOf(template, rng);
      case 'fraction_to_percent':
        return generateFractionToPercent(template, rng);
      case 'percent_change':
        return generatePercentChange(template, rng);
      case 'proportion':
        return generateProportion(template, rng);
      default:
        throw new Error(`Unknown ratios type: ${config.type}`);
    }
  },
};
