/**
 * Types and constants for the FractionStrips manipulative.
 *
 * FractionStrips teach fraction comparison via visual alignment
 * of shaded sections across stacked strips.
 */

/** Allowed denominators for fraction strips. */
export const DENOMINATORS = [2, 3, 4, 6, 8] as const;

/** Union type of allowed denominators. */
export type Denominator = (typeof DENOMINATORS)[number];

/** State of a single fraction strip. */
export interface StripState {
  denominator: Denominator;
  shaded: boolean[];
}

/** Props for the FractionStrips component. */
export interface FractionStripsProps {
  /** Initial strip configurations. Defaults to 1 strip with denominator 2. */
  initialStrips?: StripState[];
  /** ID of the element to highlight with guided mode glow. */
  guidedTargetId?: string | null;
  /** Test ID for testing. */
  testID?: string;
}

// ---------- Visual constants ----------

/** Primary purple for fraction strip elements (per CONTEXT.md). */
export const FRACTION_PRIMARY = '#A855F7';

/** Solid purple for shaded sections. */
export const FRACTION_SHADED = '#A855F7';

/** Faint purple for unshaded sections. */
export const FRACTION_UNSHADED = 'rgba(168, 85, 247, 0.15)';

/** Border color for section dividers. */
export const FRACTION_BORDER = '#7C3AED';

/** Maximum number of strips that can be stacked. */
export const MAX_STRIPS = 3;

/** Minimum section width for touch targets (48dp). */
export const MIN_SECTION_WIDTH = 48;

/** Section height for easy tapping. */
export const SECTION_HEIGHT = 56;
