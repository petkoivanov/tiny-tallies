import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateFactoringMonic,
  generateFactoringLeadingCoeff,
  generateQuadraticFormulaSimple,
  generateQuadraticFormulaRational,
  generateCompletingTheSquare,
  generateWordProblemVariant,
} from './generators';

export const quadraticEquationsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const type = (template.domainConfig ?? {}).type as string;

    switch (type) {
      case 'factoring_monic':
        return generateFactoringMonic(template, rng);
      case 'factoring_leading_coeff':
        return generateFactoringLeadingCoeff(template, rng);
      case 'quadratic_formula_simple':
        return generateQuadraticFormulaSimple(template, rng);
      case 'quadratic_formula_rational':
        return generateQuadraticFormulaRational(template, rng);
      case 'completing_the_square':
        return generateCompletingTheSquare(template, rng);
      case 'word_problem':
        return generateWordProblemVariant(template, rng);
      default:
        throw new Error(
          `quadraticEquationsHandler: unknown domainConfig.type "${type}". ` +
            `Expected one of: factoring_monic, factoring_leading_coeff, quadratic_formula_simple, quadratic_formula_rational, completing_the_square, word_problem.`,
        );
    }
  },
};
