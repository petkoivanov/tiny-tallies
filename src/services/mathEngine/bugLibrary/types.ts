import type { Operation } from '../types';

/** Source of a generated distractor */
export type DistractorSource = 'bug_library' | 'adjacent' | 'random';

/**
 * A misconception pattern that computes a plausible wrong answer.
 * Returns null when the pattern does not apply to the given operands.
 */
export interface BugPattern {
  /** Unique identifier, e.g. 'add_no_carry' */
  readonly id: string;
  /** Operations this pattern applies to */
  readonly operations: readonly Operation[];
  /** Human-readable description of the misconception */
  readonly description: string;
  /** Minimum digit count for operands where this pattern is meaningful */
  readonly minDigits: number;
  /** Compute the misconception-based wrong answer, or null if not applicable */
  readonly compute: (a: number, b: number, operation: Operation) => number | null;
}

/** Result of distractor generation, tracking provenance */
export interface DistractorResult {
  /** The distractor value (wrong answer) */
  readonly value: number;
  /** How this distractor was generated */
  readonly source: DistractorSource;
  /** Bug pattern id if source is 'bug_library' */
  readonly bugId: string | undefined;
}
