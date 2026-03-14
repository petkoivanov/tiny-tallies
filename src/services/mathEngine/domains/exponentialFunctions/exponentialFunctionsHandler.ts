import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateExpEvaluate,
  generateGrowthFactor,
  generateDecayFactor,
  generateDoublingTime,
  generateExpWordProblem,
} from './generators';

export const exponentialFunctionsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const type = (template.domainConfig ?? {}).type as string;

    switch (type) {
      case 'exp_evaluate':
        return generateExpEvaluate(template, rng);
      case 'growth_factor':
        return generateGrowthFactor(template, rng);
      case 'decay_factor':
        return generateDecayFactor(template, rng);
      case 'doubling_time':
        return generateDoublingTime(template, rng);
      case 'word_problem':
        return generateExpWordProblem(template, rng);
      default:
        throw new Error(
          `exponentialFunctionsHandler: unknown domainConfig.type "${type}". ` +
            `Expected one of: exp_evaluate, growth_factor, decay_factor, doubling_time, word_problem.`,
        );
    }
  },
};
