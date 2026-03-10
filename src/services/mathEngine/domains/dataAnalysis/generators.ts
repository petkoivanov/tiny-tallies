/**
 * Data analysis generators — dot plots, histograms, box plots, scatter plots,
 * and central tendency (mean/median/mode/range).
 *
 * Each generator produces DomainProblemData with graphData in metadata
 * for SVG rendering, plus a statistical question about the data.
 *
 * Covers grades 4-8 (Common Core 4.MD.B.4, 5.MD.B.2, 6.SP.B.4/5, 7.SP.B.3, 8.SP.A.1-3).
 */

import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import type {
  DotPlotData,
  HistogramData,
  BoxPlotData,
  ScatterPlotData,
} from '@/components/session/graphs';

// ─── Shared helpers ──────────────────────────────────────────────────────────

function generateDataSet(
  rng: SeededRng,
  count: number,
  min: number,
  max: number,
): number[] {
  const values: number[] = [];
  for (let i = 0; i < count; i++) {
    values.push(rng.intRange(min, max));
  }
  return values;
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function mode(values: number[]): number {
  const counts = new Map<number, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let maxCount = 0;
  let modeVal = values[0];
  for (const [val, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      modeVal = val;
    }
  }
  return modeVal;
}

function range(values: number[]): number {
  return Math.max(...values) - Math.min(...values);
}

function quartiles(values: number[]): {
  q1: number;
  median: number;
  q3: number;
} {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const lower = sorted.slice(0, mid);
  const upper = sorted.length % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);

  return {
    q1: median(lower),
    median: median(sorted),
    q3: median(upper),
  };

  function median(arr: number[]): number {
    const m = Math.floor(arr.length / 2);
    if (arr.length % 2 === 0) {
      return (arr[m - 1] + arr[m]) / 2;
    }
    return arr[m];
  }
}

const DOT_PLOT_TITLES = [
  'Test Scores', 'Number of Books Read', 'Daily Temperatures',
  'Heights (inches)', 'Shoe Sizes', 'Hours of Sleep',
  'Points Scored', 'Minutes of Practice',
];

const HISTOGRAM_TITLES = [
  'Test Score Distribution', 'Age Distribution', 'Height Distribution',
  'Time Spent Reading', 'Daily Steps', 'Weekly Allowance',
];

const BOX_PLOT_TITLES = [
  'Quiz Scores', 'Race Times (seconds)', 'Plant Heights (cm)',
  'Daily Temperatures (°F)', 'Homework Minutes',
];

const SCATTER_LABELS = [
  { x: 'Hours Studied', y: 'Test Score', title: 'Study Time vs Score' },
  { x: 'Height (in)', y: 'Shoe Size', title: 'Height vs Shoe Size' },
  { x: 'Age (years)', y: 'Height (in)', title: 'Age vs Height' },
  { x: 'Practice (min)', y: 'Points Scored', title: 'Practice vs Points' },
  { x: 'Temperature (°F)', y: 'Ice Cream Sales', title: 'Temp vs Sales' },
];

type DotPlotQuestion = 'count_value' | 'most_frequent' | 'range' | 'total' | 'median';
type HistogramQuestion = 'tallest_bin' | 'bin_count' | 'total' | 'range';
type BoxPlotQuestion = 'median' | 'range' | 'iqr' | 'q1' | 'q3';
type ScatterQuestion = 'count_points' | 'max_x' | 'max_y';
type CentralTendencyQuestion = 'mean' | 'median' | 'mode' | 'range';

// ─── Dot Plot / Line Plot Generator (G4-5) ──────────────────────────────────

export function generateDotPlot(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [{ min: 1, max: 10 }];
  const min = ranges[0].min;
  const max = ranges[0].max;
  const step = max - min <= 10 ? 1 : 2;
  const dataCount = rng.intRange(10, 18);
  const values = generateDataSet(rng, dataCount, min, max);

  const titleIdx = rng.intRange(0, DOT_PLOT_TITLES.length - 1);
  const title = DOT_PLOT_TITLES[titleIdx];

  const qTypes: DotPlotQuestion[] =
    template.grades[0] <= 4
      ? ['count_value', 'most_frequent', 'total']
      : ['count_value', 'most_frequent', 'range', 'total', 'median'];
  const qType = qTypes[rng.intRange(0, qTypes.length - 1)];

  const { questionText, answer } = buildDotPlotQuestion(
    qType, values, min, max, rng,
  );

  const graphData: DotPlotData = {
    type: 'dot_plot',
    values,
    min,
    max,
    step,
    label: title,
    title,
  };

  return {
    operands: [values.length, answer],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: { digitCount: template.digitCount, graphData },
  };
}

function buildDotPlotQuestion(
  type: DotPlotQuestion,
  values: number[],
  min: number,
  max: number,
  rng: SeededRng,
): { questionText: string; answer: number } {
  switch (type) {
    case 'count_value': {
      const target = values[rng.intRange(0, values.length - 1)];
      const count = values.filter((v) => v === target).length;
      return {
        questionText: `How many data points have the value ${target}?`,
        answer: count,
      };
    }
    case 'most_frequent': {
      return {
        questionText: 'What is the most frequent value?',
        answer: mode(values),
      };
    }
    case 'range': {
      return {
        questionText: 'What is the range of the data?',
        answer: range(values),
      };
    }
    case 'total': {
      return {
        questionText: 'How many data points are there in total?',
        answer: values.length,
      };
    }
    case 'median': {
      const med = median(values);
      // Only ask median when it's an integer
      if (Number.isInteger(med)) {
        return {
          questionText: 'What is the median of the data?',
          answer: med,
        };
      }
      // Fallback to count
      return {
        questionText: 'How many data points are there in total?',
        answer: values.length,
      };
    }
  }
}

// ─── Histogram Generator (G6) ───────────────────────────────────────────────

export function generateHistogram(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const binCount = rng.intRange(4, 6);
  const binWidth = rng.intRange(5, 10) * 2; // even widths: 10, 12, 14, 16, 18, 20
  const startVal = rng.intRange(0, 5) * 10;

  const bins: { range: string; count: number }[] = [];
  for (let i = 0; i < binCount; i++) {
    const lo = startVal + i * binWidth;
    const hi = lo + binWidth;
    const count = rng.intRange(1, 12);
    bins.push({ range: `${lo}-${hi}`, count });
  }

  const titleIdx = rng.intRange(0, HISTOGRAM_TITLES.length - 1);
  const title = HISTOGRAM_TITLES[titleIdx];

  const qTypes: HistogramQuestion[] = ['tallest_bin', 'bin_count', 'total', 'range'];
  const qType = qTypes[rng.intRange(0, qTypes.length - 1)];
  const { questionText, answer } = buildHistogramQuestion(qType, bins, rng);

  const graphData: HistogramData = {
    type: 'histogram',
    bins,
    xLabel: title,
    yLabel: 'Frequency',
    title,
  };

  return {
    operands: [bins.length, answer],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: { digitCount: template.digitCount, graphData },
  };
}

function buildHistogramQuestion(
  type: HistogramQuestion,
  bins: { range: string; count: number }[],
  rng: SeededRng,
): { questionText: string; answer: number } {
  switch (type) {
    case 'tallest_bin': {
      const maxCount = Math.max(...bins.map((b) => b.count));
      return {
        questionText: 'What is the frequency of the tallest bar?',
        answer: maxCount,
      };
    }
    case 'bin_count': {
      const idx = rng.intRange(0, bins.length - 1);
      return {
        questionText: `How many values are in the ${bins[idx].range} range?`,
        answer: bins[idx].count,
      };
    }
    case 'total': {
      const total = bins.reduce((s, b) => s + b.count, 0);
      return {
        questionText: 'How many total data values are shown?',
        answer: total,
      };
    }
    case 'range': {
      return {
        questionText: 'How many bins (bars) are in the histogram?',
        answer: bins.length,
      };
    }
  }
}

// ─── Box Plot Generator (G6-7) ──────────────────────────────────────────────

export function generateBoxPlot(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [{ min: 10, max: 100 }];
  const dataCount = rng.intRange(11, 21); // odd count makes integer median
  const values = generateDataSet(rng, dataCount, ranges[0].min, ranges[0].max);
  const sorted = [...values].sort((a, b) => a - b);
  const stats = quartiles(values);
  const dataMin = sorted[0];
  const dataMax = sorted[sorted.length - 1];

  const titleIdx = rng.intRange(0, BOX_PLOT_TITLES.length - 1);
  const title = BOX_PLOT_TITLES[titleIdx];

  const qTypes: BoxPlotQuestion[] = ['median', 'range', 'iqr', 'q1', 'q3'];
  const qType = qTypes[rng.intRange(0, qTypes.length - 1)];
  const { questionText, answer } = buildBoxPlotQuestion(
    qType, dataMin, dataMax, stats,
  );

  const graphData: BoxPlotData = {
    type: 'box_plot',
    min: dataMin,
    q1: stats.q1,
    median: stats.median,
    q3: stats.q3,
    max: dataMax,
    label: title,
    title,
  };

  return {
    operands: [dataMin, dataMax],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: { digitCount: template.digitCount, graphData },
  };
}

function buildBoxPlotQuestion(
  type: BoxPlotQuestion,
  dataMin: number,
  dataMax: number,
  stats: { q1: number; median: number; q3: number },
): { questionText: string; answer: number } {
  // Ensure integer answers — if a stat is non-integer, fall back to range
  switch (type) {
    case 'median':
      if (Number.isInteger(stats.median)) {
        return {
          questionText: 'What is the median shown on the box plot?',
          answer: stats.median,
        };
      }
      return {
        questionText: 'What is the range of the data?',
        answer: dataMax - dataMin,
      };
    case 'range':
      return {
        questionText: 'What is the range of the data?',
        answer: dataMax - dataMin,
      };
    case 'iqr': {
      const iqr = stats.q3 - stats.q1;
      if (Number.isInteger(iqr)) {
        return {
          questionText: 'What is the interquartile range (IQR)?',
          answer: iqr,
        };
      }
      return {
        questionText: 'What is the range of the data?',
        answer: dataMax - dataMin,
      };
    }
    case 'q1':
      if (Number.isInteger(stats.q1)) {
        return {
          questionText: 'What is the first quartile (Q1)?',
          answer: stats.q1,
        };
      }
      return {
        questionText: 'What is the range of the data?',
        answer: dataMax - dataMin,
      };
    case 'q3':
      if (Number.isInteger(stats.q3)) {
        return {
          questionText: 'What is the third quartile (Q3)?',
          answer: stats.q3,
        };
      }
      return {
        questionText: 'What is the range of the data?',
        answer: dataMax - dataMin,
      };
  }
}

// ─── Scatter Plot Generator (G8) ────────────────────────────────────────────

export function generateScatterPlot(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [
    { min: 1, max: 20 },
    { min: 10, max: 100 },
  ];
  const pointCount = rng.intRange(8, 14);

  // Generate correlated data with noise
  const slope = rng.intRange(1, 5);
  const intercept = rng.intRange(0, 20);
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < pointCount; i++) {
    const x = rng.intRange(ranges[0].min, ranges[0].max);
    const noise = rng.intRange(-5, 5);
    const y = Math.max(
      ranges[1].min,
      Math.min(ranges[1].max, slope * x + intercept + noise),
    );
    points.push({ x, y: Math.round(y) });
  }

  const labelIdx = rng.intRange(0, SCATTER_LABELS.length - 1);
  const { x: xLabel, y: yLabel, title } = SCATTER_LABELS[labelIdx];

  const qTypes: ScatterQuestion[] = ['count_points', 'max_x', 'max_y'];
  const qType = qTypes[rng.intRange(0, qTypes.length - 1)];
  const { questionText, answer } = buildScatterQuestion(qType, points);

  const graphData: ScatterPlotData = {
    type: 'scatter_plot',
    points,
    xLabel,
    yLabel,
    trendLine: { slope, intercept },
    title,
  };

  return {
    operands: [pointCount, answer],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: { digitCount: template.digitCount, graphData },
  };
}

function buildScatterQuestion(
  type: ScatterQuestion,
  points: { x: number; y: number }[],
): { questionText: string; answer: number } {
  switch (type) {
    case 'count_points':
      return {
        questionText: 'How many data points are shown on the scatter plot?',
        answer: points.length,
      };
    case 'max_x':
      return {
        questionText: 'What is the largest x-value in the scatter plot?',
        answer: Math.max(...points.map((p) => p.x)),
      };
    case 'max_y':
      return {
        questionText: 'What is the largest y-value in the scatter plot?',
        answer: Math.max(...points.map((p) => p.y)),
      };
  }
}

// ─── Central Tendency Generator (G5-7) ──────────────────────────────────────

export function generateCentralTendency(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const ranges = template.operandRanges ?? [{ min: 1, max: 20 }];
  const dataCount = rng.intRange(5, 9);
  const values = generateDataSet(rng, dataCount, ranges[0].min, ranges[0].max);

  const grade = template.grades[0];
  const qTypes: CentralTendencyQuestion[] =
    grade <= 5
      ? ['mean', 'mode', 'range']
      : ['mean', 'median', 'mode', 'range'];
  const qType = qTypes[rng.intRange(0, qTypes.length - 1)];

  const { questionText, answer } = buildCentralTendencyQuestion(
    qType, values, rng,
  );

  // Show data as a dot plot for visual context
  const sorted = [...values].sort((a, b) => a - b);
  const graphData: DotPlotData = {
    type: 'dot_plot',
    values,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    step: 1,
    label: 'Data Set',
    title: 'Data Set',
  };

  return {
    operands: values.slice(0, 2),
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: { digitCount: template.digitCount, graphData },
  };
}

function buildCentralTendencyQuestion(
  type: CentralTendencyQuestion,
  values: number[],
  rng: SeededRng,
): { questionText: string; answer: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const display = sorted.join(', ');

  switch (type) {
    case 'mean': {
      const m = mean(values);
      // Ensure integer answer
      if (Number.isInteger(m)) {
        return {
          questionText: `Find the mean of: ${display}`,
          answer: m,
        };
      }
      // Fallback to range if mean isn't integer
      return {
        questionText: `Find the range of: ${display}`,
        answer: range(values),
      };
    }
    case 'median': {
      const med = median(values);
      if (Number.isInteger(med)) {
        return {
          questionText: `Find the median of: ${display}`,
          answer: med,
        };
      }
      return {
        questionText: `Find the range of: ${display}`,
        answer: range(values),
      };
    }
    case 'mode':
      return {
        questionText: `Find the mode of: ${display}`,
        answer: mode(values),
      };
    case 'range':
      return {
        questionText: `Find the range of: ${display}`,
        answer: range(values),
      };
  }
}
