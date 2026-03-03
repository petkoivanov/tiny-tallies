/**
 * Types and constants for the NumberLine manipulative.
 *
 * The NumberLine teaches counting-on strategy via cumulative hop arrow trails.
 * Supports configurable ranges: 0-10, 0-20, 0-100 (with decade expansion).
 */

/** Props for the NumberLine component. */
export interface NumberLineProps {
  /** Start and end of the number line range. Default: [0, 10]. */
  range?: [number, number];
  /** Initial marker position. Defaults to range[0]. */
  startPosition?: number;
  /** Test ID for testing. */
  testID?: string;
}

/** Represents a single hop arc between two tick values. */
export interface HopArrow {
  fromValue: number;
  toValue: number;
}

/** SVG sub-component props. */
export interface NumberLineSvgProps {
  range: [number, number];
  width: number;
  lineY: number;
  hops: HopArrow[];
  expandedDecade: number | null;
}

// ---------- Visual constants ----------

/** Primary color for number line elements (green per CONTEXT.md). */
export const NUMBER_LINE_COLOR = '#4ADE80';

/** Accent color for highlights. */
export const NUMBER_LINE_ACCENT = '#22C55E';

/** Height of regular tick marks in SVG units. */
export const TICK_HEIGHT = 20;

/** Height of major tick marks (multiples of 5 or 10). */
export const MAJOR_TICK_HEIGHT = 30;

/** Font size for tick labels. */
export const LABEL_FONT_SIZE = 14;

/** Color for hop arrow arcs. */
export const ARC_COLOR = '#4ADE80';

/** Total height of the SVG canvas. */
export const SVG_HEIGHT = 140;

/** Horizontal padding inside the SVG to prevent tick clipping. */
export const SVG_PADDING = 24;

/** Marker radius. */
export const MARKER_RADIUS = 14;
