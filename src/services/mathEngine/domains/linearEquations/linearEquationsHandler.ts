import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateOneStepAddSub,
  generateOneStepMulDiv,
  generateTwoStepAddMul,
  generateTwoStepSubDiv,
  generateTwoStepMixed,
  generateMultiStep,
  generateNegativeSolution,
  generateWordProblemVariant,
} from './generators';

type LinearEquationsType =
  | 'one_step_add_sub'
  | 'one_step_mul_div'
  | 'two_step_add_mul'
  | 'two_step_sub_div'
  | 'two_step_mixed'
  | 'multi_step'
  | 'negative_solution'
  | 'word_problem';

export const linearEquationsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const config = template.domainConfig as { type: LinearEquationsType };
    switch (config.type) {
      case 'one_step_add_sub':
        return generateOneStepAddSub(template, rng);
      case 'one_step_mul_div':
        return generateOneStepMulDiv(template, rng);
      case 'two_step_add_mul':
        return generateTwoStepAddMul(template, rng);
      case 'two_step_sub_div':
        return generateTwoStepSubDiv(template, rng);
      case 'two_step_mixed':
        return generateTwoStepMixed(template, rng);
      case 'multi_step':
        return generateMultiStep(template, rng);
      case 'negative_solution':
        return generateNegativeSolution(template, rng);
      case 'word_problem':
        return generateWordProblemVariant(template, rng);
      default:
        throw new Error(`Unknown linear equations type: ${(config as { type: string }).type}`);
    }
  },
};
