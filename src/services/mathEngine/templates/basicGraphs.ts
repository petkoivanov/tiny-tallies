import type { ProblemTemplate } from '../types';

export const BASIC_GRAPHS_TEMPLATES: readonly ProblemTemplate[] = [
  // ─── Picture Graphs ───────────────────────────────────────────────────────
  {
    id: 'bg_picture_read',
    operation: 'basic_graphs',
    skillId: 'basic-graphs.picture-read',
    standards: ['1.MD.C.4'],
    grades: [1],
    operandRanges: [
      { min: 1, max: 6 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 1, max: 6 },
    baseElo: 750,
    digitCount: 1,
    domainConfig: { type: 'picture_graph' },
  },
  {
    id: 'bg_picture_compare',
    operation: 'basic_graphs',
    skillId: 'basic-graphs.picture-compare',
    standards: ['2.MD.D.10'],
    grades: [2],
    operandRanges: [
      { min: 1, max: 10 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 0, max: 10 },
    baseElo: 830,
    digitCount: 1,
    domainConfig: { type: 'picture_graph' },
  },
  {
    id: 'bg_picture_scaled',
    operation: 'basic_graphs',
    skillId: 'basic-graphs.picture-scaled',
    standards: ['3.MD.B.3'],
    grades: [3],
    operandRanges: [
      { min: 2, max: 20 },
      { min: 2, max: 5 },
    ],
    resultRange: { min: 2, max: 100 },
    baseElo: 950,
    digitCount: 2,
    domainConfig: { type: 'picture_graph' },
  },

  // ─── Tally Charts ─────────────────────────────────────────────────────────
  {
    id: 'bg_tally_read',
    operation: 'basic_graphs',
    skillId: 'basic-graphs.tally-read',
    standards: ['1.MD.C.4'],
    grades: [1],
    operandRanges: [
      { min: 1, max: 10 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 1, max: 10 },
    baseElo: 750,
    digitCount: 1,
    domainConfig: { type: 'tally_chart' },
  },
  {
    id: 'bg_tally_compare',
    operation: 'basic_graphs',
    skillId: 'basic-graphs.tally-compare',
    standards: ['2.MD.D.10'],
    grades: [2],
    operandRanges: [
      { min: 1, max: 15 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 0, max: 15 },
    baseElo: 830,
    digitCount: 1,
    domainConfig: { type: 'tally_chart' },
  },

  // ─── Bar Graphs ───────────────────────────────────────────────────────────
  {
    id: 'bg_bar_read',
    operation: 'basic_graphs',
    skillId: 'basic-graphs.bar-read',
    standards: ['2.MD.D.10'],
    grades: [2],
    operandRanges: [
      { min: 1, max: 12 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 1, max: 12 },
    baseElo: 830,
    digitCount: 1,
    domainConfig: { type: 'bar_graph' },
  },
  {
    id: 'bg_bar_compare',
    operation: 'basic_graphs',
    skillId: 'basic-graphs.bar-compare',
    standards: ['3.MD.B.3'],
    grades: [3],
    operandRanges: [
      { min: 1, max: 20 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 0, max: 20 },
    baseElo: 950,
    digitCount: 2,
    domainConfig: { type: 'bar_graph' },
  },
  {
    id: 'bg_bar_solve',
    operation: 'basic_graphs',
    skillId: 'basic-graphs.bar-solve',
    standards: ['3.MD.B.3', '4.MD.B.4'],
    grades: [4],
    operandRanges: [
      { min: 1, max: 30 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 0, max: 100 },
    baseElo: 1050,
    digitCount: 2,
    domainConfig: { type: 'bar_graph' },
  },
];
