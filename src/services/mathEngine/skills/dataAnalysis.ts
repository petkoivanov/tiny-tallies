import type { SkillDefinition } from '../types';

export const DATA_ANALYSIS_SKILLS: readonly SkillDefinition[] = [
  // ─── Dot Plots / Line Plots (Grade 4-5) ──────────────────────────────────
  {
    id: 'data-analysis.dot-plot-read',
    name: 'Read dot plots',
    operation: 'data_analysis',
    grade: 4,
    standards: ['4.MD.B.4'],
    prerequisites: ['basic-graphs.bar-solve'],
  },
  {
    id: 'data-analysis.dot-plot-analyze',
    name: 'Analyze dot plot data',
    operation: 'data_analysis',
    grade: 5,
    standards: ['5.MD.B.2'],
    prerequisites: ['data-analysis.dot-plot-read'],
  },

  // ─── Central Tendency (Grade 5-7) ─────────────────────────────────────────
  {
    id: 'data-analysis.mean',
    name: 'Find the mean',
    operation: 'data_analysis',
    grade: 5,
    standards: ['6.SP.B.5c'],
    prerequisites: ['data-analysis.dot-plot-read'],
  },
  {
    id: 'data-analysis.median-mode',
    name: 'Find median and mode',
    operation: 'data_analysis',
    grade: 6,
    standards: ['6.SP.B.5c'],
    prerequisites: ['data-analysis.mean'],
  },
  {
    id: 'data-analysis.range',
    name: 'Find the range',
    operation: 'data_analysis',
    grade: 5,
    standards: ['6.SP.B.5c'],
    prerequisites: ['data-analysis.dot-plot-read'],
  },

  // ─── Histograms (Grade 6) ────────────────────────────────────────────────
  {
    id: 'data-analysis.histogram-read',
    name: 'Read histograms',
    operation: 'data_analysis',
    grade: 6,
    standards: ['6.SP.B.4'],
    prerequisites: ['data-analysis.dot-plot-analyze'],
  },
  {
    id: 'data-analysis.histogram-analyze',
    name: 'Analyze histogram distributions',
    operation: 'data_analysis',
    grade: 6,
    standards: ['6.SP.B.5'],
    prerequisites: ['data-analysis.histogram-read'],
  },

  // ─── Box Plots (Grade 6-7) ───────────────────────────────────────────────
  {
    id: 'data-analysis.box-plot-read',
    name: 'Read box-and-whisker plots',
    operation: 'data_analysis',
    grade: 6,
    standards: ['6.SP.B.4'],
    prerequisites: ['data-analysis.median-mode'],
  },
  {
    id: 'data-analysis.box-plot-iqr',
    name: 'Find IQR from box plots',
    operation: 'data_analysis',
    grade: 7,
    standards: ['7.SP.B.3'],
    prerequisites: ['data-analysis.box-plot-read'],
  },

  // ─── Scatter Plots (Grade 8) ─────────────────────────────────────────────
  {
    id: 'data-analysis.scatter-read',
    name: 'Read scatter plots',
    operation: 'data_analysis',
    grade: 8,
    standards: ['8.SP.A.1'],
    prerequisites: ['data-analysis.box-plot-iqr'],
  },
  {
    id: 'data-analysis.scatter-trend',
    name: 'Identify scatter plot trends',
    operation: 'data_analysis',
    grade: 8,
    standards: ['8.SP.A.2', '8.SP.A.3'],
    prerequisites: ['data-analysis.scatter-read'],
  },
];
