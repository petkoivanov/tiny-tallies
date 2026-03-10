/**
 * Data types for SVG graph components used by Data & Statistics domain.
 *
 * Each graph type has a corresponding data interface stored in
 * ProblemMetadata.graphData, keyed by discriminated union on `type`.
 */

/** A single category with a count — used by picture graphs, bar graphs, tally charts */
export interface CategoryCount {
  label: string;
  value: number;
}

/** Picture graph: rows of icons representing counts per category (G1-2) */
export interface PictureGraphData {
  type: 'picture_graph';
  categories: CategoryCount[];
  /** Emoji or symbol repeated for each unit */
  icon: string;
  /** Each icon represents this many units (default 1) */
  scale: number;
  title?: string;
}

/** Bar graph: vertical bars with labeled axes (G2-4, also histograms G6) */
export interface BarGraphData {
  type: 'bar_graph';
  categories: CategoryCount[];
  yLabel?: string;
  title?: string;
}

/** Histogram: contiguous bars for continuous ranges (G6) */
export interface HistogramData {
  type: 'histogram';
  bins: { range: string; count: number }[];
  xLabel?: string;
  yLabel?: string;
  title?: string;
}

/** Tally chart: tally marks grouped by 5 (G1-3) */
export interface TallyChartData {
  type: 'tally_chart';
  categories: CategoryCount[];
  title?: string;
}

/** Dot plot / line plot: dots stacked above a number line (G4-6) */
export interface DotPlotData {
  type: 'dot_plot';
  values: number[];
  min: number;
  max: number;
  step: number;
  label?: string;
  title?: string;
}

/** Box-and-whisker plot (G6-7) */
export interface BoxPlotData {
  type: 'box_plot';
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  label?: string;
  title?: string;
}

/** Scatter plot with optional trend line (G8) */
export interface ScatterPlotData {
  type: 'scatter_plot';
  points: { x: number; y: number }[];
  xLabel: string;
  yLabel: string;
  trendLine?: { slope: number; intercept: number };
  title?: string;
}

/** Discriminated union of all graph data types */
export type GraphData =
  | PictureGraphData
  | BarGraphData
  | HistogramData
  | TallyChartData
  | DotPlotData
  | BoxPlotData
  | ScatterPlotData;
