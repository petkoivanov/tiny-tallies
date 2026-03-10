import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateComplementaryAngles,
  generateSupplementaryAngles,
  generateCircleArea,
  generateCircleCircumference,
  generatePythagorean,
  generateSlope,
} from './generators';

type GeometryType =
  | 'complementary_angles'
  | 'supplementary_angles'
  | 'circle_area'
  | 'circle_circumference'
  | 'pythagorean'
  | 'slope';

export const geometryHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const config = template.domainConfig as { type: GeometryType };
    switch (config.type) {
      case 'complementary_angles':
        return generateComplementaryAngles(template, rng);
      case 'supplementary_angles':
        return generateSupplementaryAngles(template, rng);
      case 'circle_area':
        return generateCircleArea(template, rng);
      case 'circle_circumference':
        return generateCircleCircumference(template, rng);
      case 'pythagorean':
        return generatePythagorean(template, rng);
      case 'slope':
        return generateSlope(template, rng);
      default:
        throw new Error(`Unknown geometry type: ${config.type}`);
    }
  },
};
