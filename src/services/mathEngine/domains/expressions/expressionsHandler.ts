import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateTwoOps,
  generateParentheses,
  generateThreeOps,
  generateWithDivision,
  generateNestedParens,
} from './generators';

type ExpressionsType =
  | 'two_ops'
  | 'parentheses'
  | 'three_ops'
  | 'with_division'
  | 'nested_parens';

export const expressionsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const config = template.domainConfig as { type: ExpressionsType };
    switch (config.type) {
      case 'two_ops':
        return generateTwoOps(template, rng);
      case 'parentheses':
        return generateParentheses(template, rng);
      case 'three_ops':
        return generateThreeOps(template, rng);
      case 'with_division':
        return generateWithDivision(template, rng);
      case 'nested_parens':
        return generateNestedParens(template, rng);
      default:
        throw new Error(`Unknown expressions type: ${config.type}`);
    }
  },
};
