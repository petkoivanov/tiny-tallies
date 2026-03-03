/**
 * Type definitions and constants for the BarModel manipulative.
 *
 * Bar models help children visualize part-whole relationships
 * for addition, subtraction, and word problems.
 */

/** State of a single section within the bar model. */
export interface SectionState {
  id: string;
  /** Proportion of total bar width (0.0 to 1.0). All sections sum to 1.0. */
  widthFraction: number;
  /** Numeric value 0-999, or null if unlabeled. */
  label: number | null;
  /** True if marked as "?" placeholder. */
  isUnknown: boolean;
}

/** Props for the BarModel component. */
export interface BarModelProps {
  testID?: string;
}

/** Number of partitions the bar can be divided into. */
export type PartitionCount = 2 | 3 | 4;

// --- Color constants ---

/** Teal primary for bar sections. */
export const BAR_PRIMARY = '#2DD4BF';
/** Teal fill with transparency for section backgrounds. */
export const BAR_FILL = 'rgba(45, 212, 191, 0.2)';
/** Teal border for bar outline. */
export const BAR_BORDER = '#14B8A6';
/** White divider handles for visibility on dark theme. */
export const BAR_DIVIDER = '#FFFFFF';
/** Amber for "?" unknown sections -- visually distinct. */
export const BAR_UNKNOWN = '#F59E0B';

// --- Layout constants ---

/** Touch target width in dp for divider drag handles. */
export const DIVIDER_WIDTH = 48;
/** Bar height in dp. */
export const BAR_HEIGHT = 80;
/** Dividers snap to nearest percentage for child-friendly precision. */
export const SNAP_PERCENT = 10;
/** Height of each item in the number picker wheel. */
export const NUMBER_PICKER_ITEM_HEIGHT = 48;
/** Number of items visible in the picker at once. */
export const NUMBER_PICKER_VISIBLE_ITEMS = 5;
