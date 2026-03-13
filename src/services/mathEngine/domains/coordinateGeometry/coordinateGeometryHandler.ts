import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateSlope,
  generateDistance,
  generateMidpointX,
  generateMidpointY,
  generateLineYIntercept,
  generateLineSlope,
} from './generators';

export const coordinateGeometryHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const config = template.domainConfig ?? {};
    const type = config.type as string;

    switch (type) {
      case 'slope':
        return generateSlope(template, rng);
      case 'distance':
        return generateDistance(template, rng);
      case 'midpoint_x':
        return generateMidpointX(template, rng);
      case 'midpoint_y':
        return generateMidpointY(template, rng);
      case 'line_equation_yintercept':
        return generateLineYIntercept(template, rng);
      case 'line_equation_slope':
        return generateLineSlope(template, rng);
      case 'word_problem':
        // Word problems use distance problems as the underlying generator
        return generateDistance(template, rng);
      default:
        throw new Error(
          `coordinateGeometryHandler: unknown domainConfig.type "${type}". ` +
            `Expected one of: slope, distance, midpoint_x, midpoint_y, line_equation_yintercept, line_equation_slope.`,
        );
    }
  },
};
