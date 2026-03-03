/**
 * Types and constants for the Ten Frame manipulative.
 */

/** Props for the TenFrame component. */
export interface TenFrameProps {
  /** Test ID for the component root. */
  testID?: string;
  /** Number of frames to render initially (1 or 2). Defaults to 1. */
  initialFrames?: 1 | 2;
}

/** Grid dimensions for a single ten frame. */
export const GRID_COLS = 5;
export const GRID_ROWS = 2;
export const CELLS_PER_FRAME = 10;

/** Cell size in dp -- 48dp touch target + 8dp padding. */
export const CELL_SIZE = 56;

/** Ten frame primary color (orange per CONTEXT.md decision). */
export const TEN_FRAME_COLOR = '#FB923C';

/** Ten frame border accent color. */
export const TEN_FRAME_BORDER = '#F97316';

/** Counter color inside cells (orange). */
export const COUNTER_COLOR = '#FB923C';

/** Counter border color inside cells. */
export const COUNTER_BORDER = '#EA580C';
