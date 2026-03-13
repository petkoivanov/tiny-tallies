import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateSubstitutionSimple,
  generateSubstitutionGeneral,
  generateEliminationAdd,
  generateEliminationMultiply,
  generateWordProblemVariant,
} from './generators';

export const systemsEquationsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const type = (template.domainConfig ?? {}).type as string;

    switch (type) {
      case 'substitution_simple':
        return generateSubstitutionSimple(template, rng);
      case 'substitution_general':
        return generateSubstitutionGeneral(template, rng);
      case 'elimination_add':
        return generateEliminationAdd(template, rng);
      case 'elimination_multiply':
        return generateEliminationMultiply(template, rng);
      case 'word_problem':
        return generateWordProblemVariant(template, rng);
      default:
        throw new Error(
          `systemsEquationsHandler: unknown domainConfig.type "${type}". ` +
            `Expected one of: substitution_simple, substitution_general, elimination_add, elimination_multiply, word_problem.`,
        );
    }
  },
};
