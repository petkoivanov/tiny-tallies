/**
 * Type definitions and constants for BaseTenBlocks manipulative.
 *
 * All blocks share the same blue color family -- size differentiates place value.
 * Column background colors provide visual scaffolding for place-value columns.
 */

// ---------------------------------------------------------------------------
// Block types
// ---------------------------------------------------------------------------

export type BlockType = 'cube' | 'rod' | 'flat';

export type PlaceValueColumn = 'ones' | 'tens' | 'hundreds';

export interface BlockState {
  id: string;
  type: BlockType;
  column: PlaceValueColumn;
}

export interface BaseTenBlocksProps {
  /** ID of the element to highlight with guided mode glow. */
  guidedTargetId?: string | null;
  testID?: string;
}

// ---------------------------------------------------------------------------
// Block color constants (all blue -- size differentiates place value)
// ---------------------------------------------------------------------------

export const BLOCK_COLOR = '#5A7FFF';
export const BLOCK_BORDER = '#3D5FCC';
export const BLOCK_LIGHT = 'rgba(90, 127, 255, 0.2)';

// ---------------------------------------------------------------------------
// Column visual constants
// ---------------------------------------------------------------------------

export const COLUMN_COLORS: Record<PlaceValueColumn, string> = {
  ones: 'rgba(250, 204, 21, 0.08)', // faint yellow
  tens: 'rgba(74, 222, 128, 0.08)', // faint green
  hundreds: 'rgba(96, 165, 250, 0.08)', // faint blue
};

export const COLUMN_LABELS: Record<PlaceValueColumn, string> = {
  ones: 'Ones',
  tens: 'Tens',
  hundreds: 'Hundreds',
};

// ---------------------------------------------------------------------------
// Timing constants
// ---------------------------------------------------------------------------

/** Delay before auto-grouping 10 units into the next place value (ms). */
export const AUTO_GROUP_DELAY = 500;

/** Total duration of the merge animation (ms). */
export const MERGE_ANIMATION_DURATION = 400;

/** Number of same-type blocks that trigger auto-group. */
export const GROUP_THRESHOLD = 10;
