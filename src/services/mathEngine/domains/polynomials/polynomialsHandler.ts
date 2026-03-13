import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateFoilExpansion,
  generatePolyEvaluation,
  generateGcfFactoring,
  generateDiffOfSquares,
  generateCombinedOps,
  generateWordProblem,
} from './generators';

export const polynomialsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const type = (template.domainConfig ?? {}).type as string;

    switch (type) {
      case 'foil_expansion':
        return generateFoilExpansion(template, rng);
      case 'poly_evaluation':
        return generatePolyEvaluation(template, rng);
      case 'gcf_factoring':
        return generateGcfFactoring(template, rng);
      case 'diff_of_squares':
        return generateDiffOfSquares(template, rng);
      case 'combined_operations':
        return generateCombinedOps(template, rng);
      case 'word_problem':
        return generateWordProblem(template, rng);
      default:
        throw new Error(
          `polynomialsHandler: unknown domainConfig.type "${type}". ` +
            `Expected one of: foil_expansion, poly_evaluation, gcf_factoring, diff_of_squares, combined_operations, word_problem.`,
        );
    }
  },
};
