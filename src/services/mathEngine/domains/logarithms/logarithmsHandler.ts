import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateLog10Eval,
  generateLog2Eval,
  generateLnEval,
  generateLogWordProblem,
} from './generators';

export const logarithmsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const type = (template.domainConfig ?? {}).type as string;

    switch (type) {
      case 'log10_eval':
        return generateLog10Eval(template, rng);
      case 'log2_eval':
        return generateLog2Eval(template, rng);
      case 'ln_eval':
        return generateLnEval(template, rng);
      case 'word_problem':
        return generateLogWordProblem(template, rng);
      default:
        throw new Error(
          `logarithmsHandler: unknown domainConfig.type "${type}". ` +
            `Expected one of: log10_eval, log2_eval, ln_eval, word_problem.`,
        );
    }
  },
};
