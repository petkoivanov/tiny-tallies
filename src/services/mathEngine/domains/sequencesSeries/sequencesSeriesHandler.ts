import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateArithmeticNextTerm,
  generateArithmeticNthTerm,
  generateGeometricNextTerm,
  generateGeometricNthTerm,
} from './generators';

export const sequencesSeriesHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const type = (template.domainConfig ?? {}).type as string;

    switch (type) {
      case 'arithmetic_next_term':
        return generateArithmeticNextTerm(template, rng);
      case 'arithmetic_nth_term':
        return generateArithmeticNthTerm(template, rng);
      case 'geometric_next_term':
        return generateGeometricNextTerm(template, rng);
      case 'geometric_nth_term':
        return generateGeometricNthTerm(template, rng);
      case 'word_problem':
        // Word problems reuse arithmetic nth-term generator for underlying computation
        return generateArithmeticNthTerm(template, rng);
      default:
        throw new Error(
          `sequencesSeriesHandler: unknown domainConfig.type "${type}". ` +
            `Expected one of: arithmetic_next_term, arithmetic_nth_term, geometric_next_term, geometric_nth_term, word_problem.`,
        );
    }
  },
};
