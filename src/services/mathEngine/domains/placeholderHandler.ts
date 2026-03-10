/**
 * Placeholder handler for non-arithmetic domains (fractions, place_value, time, money, patterns).
 *
 * These domains currently use a + b as placeholder computation.
 * Each will be replaced with a proper domain-specific handler in future phases.
 */

import { numericAnswer } from '../types';
import type {
  DomainHandler,
  DomainProblemData,
  ProblemTemplate,
} from '../types';
import type { SeededRng } from '../seededRng';

export const placeholderHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    if (!template.operandRanges) {
      throw new Error(
        `Template ${template.id} requires operandRanges`,
      );
    }

    const ranges = template.operandRanges;
    const a = rng.intRange(ranges[0].min, ranges[0].max);
    const b = rng.intRange(ranges[1].min, ranges[1].max);

    // Placeholder: uses addition for answer computation.
    // Domain-specific handlers will replace this with proper logic.
    return {
      operands: [a, b],
      correctAnswer: numericAnswer(a + b),
      questionText: `${a} + ${b} = ?`,
      metadata: {
        digitCount: template.digitCount,
        requiresCarry: false,
        requiresBorrow: false,
      },
    };
  },
};
