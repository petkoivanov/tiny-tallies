import type { ProblemTemplate } from '../types';

export const DATA_ANALYSIS_TEMPLATES: readonly ProblemTemplate[] = [
  // ─── Dot Plots / Line Plots ─────────────────────────────────────────────
  {
    id: 'da_dot_plot_read',
    operation: 'data_analysis',
    skillId: 'data-analysis.dot-plot-read',
    standards: ['4.MD.B.4'],
    grades: [4],
    operandRanges: [
      { min: 1, max: 10 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 0, max: 20 },
    baseElo: 900,
    digitCount: 1,
    domainConfig: { type: 'dot_plot' },
  },
  {
    id: 'da_dot_plot_analyze',
    operation: 'data_analysis',
    skillId: 'data-analysis.dot-plot-analyze',
    standards: ['5.MD.B.2'],
    grades: [5],
    operandRanges: [
      { min: 1, max: 15 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 0, max: 30 },
    baseElo: 1000,
    digitCount: 2,
    domainConfig: { type: 'dot_plot' },
  },

  // ─── Central Tendency ───────────────────────────────────────────────────
  {
    id: 'da_mean',
    operation: 'data_analysis',
    skillId: 'data-analysis.mean',
    standards: ['6.SP.B.5c'],
    grades: [5],
    operandRanges: [
      { min: 1, max: 20 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 1, max: 20 },
    baseElo: 1000,
    digitCount: 2,
    domainConfig: { type: 'central_tendency' },
  },
  {
    id: 'da_median_mode',
    operation: 'data_analysis',
    skillId: 'data-analysis.median-mode',
    standards: ['6.SP.B.5c'],
    grades: [6],
    operandRanges: [
      { min: 1, max: 30 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 1, max: 30 },
    baseElo: 1050,
    digitCount: 2,
    domainConfig: { type: 'central_tendency' },
  },
  {
    id: 'da_range',
    operation: 'data_analysis',
    skillId: 'data-analysis.range',
    standards: ['6.SP.B.5c'],
    grades: [5],
    operandRanges: [
      { min: 1, max: 20 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 0, max: 20 },
    baseElo: 950,
    digitCount: 2,
    domainConfig: { type: 'central_tendency' },
  },

  // ─── Histograms ────────────────────────────────────────────────────────
  {
    id: 'da_histogram_read',
    operation: 'data_analysis',
    skillId: 'data-analysis.histogram-read',
    standards: ['6.SP.B.4'],
    grades: [6],
    operandRanges: [
      { min: 0, max: 100 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 0, max: 50 },
    baseElo: 1100,
    digitCount: 2,
    domainConfig: { type: 'histogram' },
  },
  {
    id: 'da_histogram_analyze',
    operation: 'data_analysis',
    skillId: 'data-analysis.histogram-analyze',
    standards: ['6.SP.B.5'],
    grades: [6],
    operandRanges: [
      { min: 0, max: 100 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 0, max: 100 },
    baseElo: 1150,
    digitCount: 2,
    domainConfig: { type: 'histogram' },
  },

  // ─── Box Plots ──────────────────────────────────────────────────────────
  {
    id: 'da_box_plot_read',
    operation: 'data_analysis',
    skillId: 'data-analysis.box-plot-read',
    standards: ['6.SP.B.4'],
    grades: [6],
    operandRanges: [
      { min: 10, max: 100 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 0, max: 100 },
    baseElo: 1100,
    digitCount: 2,
    domainConfig: { type: 'box_plot' },
  },
  {
    id: 'da_box_plot_iqr',
    operation: 'data_analysis',
    skillId: 'data-analysis.box-plot-iqr',
    standards: ['7.SP.B.3'],
    grades: [7],
    operandRanges: [
      { min: 10, max: 100 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 0, max: 100 },
    baseElo: 1200,
    digitCount: 2,
    domainConfig: { type: 'box_plot' },
  },

  // ─── Scatter Plots ─────────────────────────────────────────────────────
  {
    id: 'da_scatter_read',
    operation: 'data_analysis',
    skillId: 'data-analysis.scatter-read',
    standards: ['8.SP.A.1'],
    grades: [8],
    operandRanges: [
      { min: 1, max: 20 },
      { min: 10, max: 100 },
    ],
    resultRange: { min: 0, max: 100 },
    baseElo: 1250,
    digitCount: 2,
    domainConfig: { type: 'scatter_plot' },
  },
  {
    id: 'da_scatter_trend',
    operation: 'data_analysis',
    skillId: 'data-analysis.scatter-trend',
    standards: ['8.SP.A.2', '8.SP.A.3'],
    grades: [8],
    operandRanges: [
      { min: 1, max: 20 },
      { min: 10, max: 100 },
    ],
    resultRange: { min: 0, max: 100 },
    baseElo: 1300,
    digitCount: 2,
    domainConfig: { type: 'scatter_plot' },
  },
];
