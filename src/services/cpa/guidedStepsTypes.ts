/**
 * Types for the guided step system.
 *
 * Guided steps provide visual hints during concrete CPA mode,
 * highlighting the next suggested action on a manipulative.
 */

import type { MathDomain } from '../mathEngine/types';
import type { ManipulativeType } from './cpaTypes';

/** A single guided step targeting an interactive element. */
export interface GuidedStep {
  /** ID of the target element to highlight (e.g. 'add-counter-button', 'cell-3'). */
  targetId: string;
  /** Optional hint text to display alongside the highlight. */
  hintText?: string;
}

/** A resolver that computes the next guided step for a specific operation+manipulative pair. */
export interface GuidedStepResolver {
  operation: MathDomain;
  manipulativeType: ManipulativeType;
  getNextStep: (operands: [number, number], currentCount: number) => GuidedStep | null;
}
