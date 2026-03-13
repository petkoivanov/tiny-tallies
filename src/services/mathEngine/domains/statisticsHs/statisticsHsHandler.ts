import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateStdDevConcept,
  generateNormalDistribution,
  generateZScore,
  generatePercentile,
} from './generators';

export const statisticsHsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const type = (template.domainConfig ?? {}).type as string;

    switch (type) {
      case 'stddev_concept':
        return generateStdDevConcept(template, rng);
      case 'normal_rule':
        return generateNormalDistribution(template, rng);
      case 'zscore':
        return generateZScore(template, rng);
      case 'percentile':
        return generatePercentile(template, rng);
      case 'word_problem':
        // Word problems reuse z-score generator for underlying computation
        return generateZScore(template, rng);
      default:
        throw new Error(
          `statisticsHsHandler: unknown domainConfig.type "${type}". ` +
            `Expected one of: stddev_concept, normal_rule, zscore, percentile, word_problem.`,
        );
    }
  },
};
