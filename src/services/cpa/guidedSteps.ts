/**
 * Guided step lookup service for concrete CPA mode.
 *
 * Returns the next suggested action for a given operation, manipulative type,
 * and current manipulative state. Used to highlight target zones/items
 * with a pulsing glow during guided practice.
 */

import type { Operation } from '../mathEngine/types';
import type { ManipulativeType } from './cpaTypes';
import type { GuidedStep, GuidedStepResolver } from './guidedStepsTypes';

// ---------- Resolvers ----------

const countersAddition: GuidedStepResolver = {
  operation: 'addition',
  manipulativeType: 'counters',
  getNextStep: (operands, currentCount) => {
    const target = operands[0] + operands[1];
    if (currentCount >= target) return null;
    return {
      targetId: 'add-counter-button',
      hintText: `Add a counter (${currentCount} of ${target})`,
    };
  },
};

const countersSubtraction: GuidedStepResolver = {
  operation: 'subtraction',
  manipulativeType: 'counters',
  getNextStep: (operands, currentCount) => {
    const [a, b] = operands;
    const answer = a - b;

    if (currentCount < a) {
      // Phase 1: place first operand
      return {
        targetId: 'add-counter-button',
        hintText: `Add counters to show ${a}`,
      };
    }
    if (currentCount > answer) {
      // Phase 2: remove counters
      return {
        targetId: 'counter-to-remove',
        hintText: `Remove a counter (${currentCount - answer} left to remove)`,
      };
    }
    // Done
    return null;
  },
};

const tenFrameAddition: GuidedStepResolver = {
  operation: 'addition',
  manipulativeType: 'ten_frame',
  getNextStep: (operands, currentCount) => {
    const target = operands[0] + operands[1];
    if (currentCount >= target) return null;
    return {
      targetId: `cell-${currentCount}`,
      hintText: `Fill cell ${currentCount + 1}`,
    };
  },
};

const tenFrameSubtraction: GuidedStepResolver = {
  operation: 'subtraction',
  manipulativeType: 'ten_frame',
  getNextStep: (operands, currentCount) => {
    const [a, b] = operands;
    const answer = a - b;

    if (currentCount < a) {
      // Phase 1: fill cells for first operand
      return {
        targetId: `cell-${currentCount}`,
        hintText: `Fill cell ${currentCount + 1}`,
      };
    }
    if (currentCount > answer) {
      // Phase 2: remove cells
      return {
        targetId: 'cell-to-remove',
        hintText: `Remove a counter (${currentCount - answer} left)`,
      };
    }
    return null;
  },
};

const baseTenAddition: GuidedStepResolver = {
  operation: 'addition',
  manipulativeType: 'base_ten_blocks',
  getNextStep: (operands, currentCount) => {
    const target = operands[0] + operands[1];
    if (currentCount >= target) return null;
    const remaining = target - currentCount;
    if (remaining >= 10) {
      return { targetId: 'tens-column', hintText: 'Add a tens rod' };
    }
    return { targetId: 'ones-column', hintText: 'Add a ones cube' };
  },
};

const numberLineAddition: GuidedStepResolver = {
  operation: 'addition',
  manipulativeType: 'number_line',
  getNextStep: (operands, currentCount) => {
    const target = operands[0] + operands[1];
    if (currentCount >= target) return null;
    return {
      targetId: 'marker',
      hintText: `Move to ${target}`,
    };
  },
};

const barModelAddition: GuidedStepResolver = {
  operation: 'addition',
  manipulativeType: 'bar_model',
  getNextStep: (operands, currentCount) => {
    const target = operands[0] + operands[1];
    if (currentCount >= target) return null;
    return {
      targetId: 'whole-label',
      hintText: `Label the whole as ${target}`,
    };
  },
};

// ---------- Registry ----------

const resolvers: GuidedStepResolver[] = [
  countersAddition,
  countersSubtraction,
  tenFrameAddition,
  tenFrameSubtraction,
  baseTenAddition,
  numberLineAddition,
  barModelAddition,
];

/**
 * Get the next guided step for a concrete-mode manipulative interaction.
 *
 * @returns The next step to highlight, or null if all steps are complete
 *          or the combination is unmapped.
 */
export function getNextGuidedStep(
  operation: Operation,
  manipulativeType: ManipulativeType,
  operands: [number, number],
  currentCount: number,
): GuidedStep | null {
  const resolver = resolvers.find(
    (r) => r.operation === operation && r.manipulativeType === manipulativeType,
  );
  if (!resolver) return null;
  return resolver.getNextStep(operands, currentCount);
}
