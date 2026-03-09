/**
 * Types and constants for the Counters (two-color flip) manipulative.
 */

/** Possible counter colors for the two-sided counter. */
export type CounterColor = 'red' | 'yellow';

/** State for a single counter on the workspace. */
export interface CounterState {
  /** Unique identifier for this counter. */
  id: string;
  /** Current face color of the counter. */
  color: CounterColor;
  /** Absolute X position on the workspace. */
  x: number;
  /** Absolute Y position on the workspace. */
  y: number;
}

/** Props for the Counters component. */
export interface CountersProps {
  /** Maximum number of counters allowed (defaults to MAX_OBJECTS = 30). */
  maxCounters?: number;
  /** ID of the element to highlight with guided mode glow. */
  guidedTargetId?: string | null;
  /** Grid rows for session auto-config (auto-switches to grid mode). */
  gridRows?: number;
  /** Grid cols for session auto-config (auto-switches to grid mode). */
  gridCols?: number;
  /** Problem operands for scaffolded mode — pre-seeds first operand, guides second. */
  problemOperands?: readonly number[];
  /** Problem operation for scaffolded mode — determines add vs. remove guidance. */
  problemOperation?: 'addition' | 'subtraction';
  /** Test ID for the component root. */
  testID?: string;
}

/** Grid mode state for Counters. */
export interface CountersGridState {
  mode: 'free' | 'grid';
  rows: number;
  cols: number;
}

/** Spacing between grid counters. */
export const GRID_COUNTER_SPACING = 8;

/** Maximum grid dimension (rows or cols). */
export const MAX_GRID_DIMENSION = 10;

/** Fill colors for counter faces -- high contrast on dark theme. */
export const COUNTER_COLORS: Record<CounterColor, string> = {
  red: '#EF4444',
  yellow: '#FACC15',
} as const;

/** Border/accent colors for counter faces. */
export const COUNTER_BORDER_COLORS: Record<CounterColor, string> = {
  red: '#DC2626',
  yellow: '#EAB308',
} as const;

/** Counter diameter in dp. With padding, meets 48dp touch target. */
export const COUNTER_SIZE = 36;

/** Stagger offset for newly added counters to prevent overlap. */
export const STAGGER_OFFSET = 50;
