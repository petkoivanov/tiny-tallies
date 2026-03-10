/**
 * Basic graphs generators — picture graphs, bar graphs, tally charts.
 *
 * Each generator produces a DomainProblemData with graphData in metadata
 * for SVG rendering, plus a question about the data.
 *
 * Covers grades 1-4 (Common Core 1.MD.C.4, 2.MD.D.10, 3.MD.B.3).
 */

import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import type {
  PictureGraphData,
  BarGraphData,
  TallyChartData,
} from '@/components/session/graphs';

// ─── Name pools for graph data ─────────────────────────────────────────────

const GRAPH_CATEGORIES = [
  ['Cats', 'Dogs', 'Fish', 'Birds'],
  ['Red', 'Blue', 'Green', 'Yellow'],
  ['Apples', 'Bananas', 'Oranges', 'Grapes'],
  ['Soccer', 'Baseball', 'Tennis', 'Swimming'],
  ['Pizza', 'Tacos', 'Burgers', 'Pasta'],
  ['Spring', 'Summer', 'Fall', 'Winter'],
  ['Math', 'Reading', 'Science', 'Art'],
  ['Sunny', 'Rainy', 'Cloudy', 'Snowy'],
];

const GRAPH_TITLES = {
  picture_graph: [
    'Favorite Pets', 'Favorite Colors', 'Fruits We Like',
    'Favorite Sports', 'Favorite Foods', 'Favorite Season',
    'Best Subject', 'Weather This Week',
  ],
  bar_graph: [
    'Favorite Pets', 'Favorite Colors', 'Fruits Picked',
    'Sports Survey', 'Lunch Choices', 'Seasons We Like',
    'Class Favorites', 'Weather Log',
  ],
  tally_chart: [
    'Pet Survey', 'Color Count', 'Fruit Tally',
    'Sports Tally', 'Food Count', 'Season Vote',
    'Subject Vote', 'Weather Tally',
  ],
};

const ICONS = ['⭐', '🍎', '🐱', '🌸', '⚽', '📚', '🎵', '🌈'];

type QuestionType =
  | 'how_many'
  | 'most'
  | 'least'
  | 'more_than'
  | 'fewer_than'
  | 'total'
  | 'difference';

function pickCategories(
  rng: SeededRng,
  count: number,
): { labels: string[]; title: string; titleIdx: number } {
  const titleIdx = rng.intRange(0, GRAPH_CATEGORIES.length - 1);
  const pool = GRAPH_CATEGORIES[titleIdx];
  const labels = pool.slice(0, count);
  return { labels, title: '', titleIdx };
}

function generateValues(
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

function buildQuestion(
  type: QuestionType,
  labels: string[],
  values: number[],
  rng: SeededRng,
): { questionText: string; answer: number } {
  switch (type) {
    case 'how_many': {
      const idx = rng.intRange(0, labels.length - 1);
      return {
        questionText: `How many chose ${labels[idx]}?`,
        answer: values[idx],
      };
    }
    case 'most': {
      const maxVal = Math.max(...values);
      const idx = values.indexOf(maxVal);
      return {
        questionText: `Which has the most? How many?`,
        answer: maxVal,
      };
    }
    case 'least': {
      const minVal = Math.min(...values);
      return {
        questionText: `Which has the fewest? How many?`,
        answer: minVal,
      };
    }
    case 'more_than': {
      const i = rng.intRange(0, labels.length - 1);
      let j = rng.intRange(0, labels.length - 1);
      while (j === i) j = rng.intRange(0, labels.length - 1);
      const diff = Math.abs(values[i] - values[j]);
      return {
        questionText: `How many more ${labels[i]} than ${labels[j]}?`,
        answer: diff,
      };
    }
    case 'fewer_than': {
      const i = rng.intRange(0, labels.length - 1);
      let j = rng.intRange(0, labels.length - 1);
      while (j === i) j = rng.intRange(0, labels.length - 1);
      const diff = Math.abs(values[i] - values[j]);
      return {
        questionText: `How many fewer ${labels[j]} than ${labels[i]}?`,
        answer: diff,
      };
    }
    case 'total': {
      const sum = values.reduce((a, b) => a + b, 0);
      return {
        questionText: `How many in total?`,
        answer: sum,
      };
    }
    case 'difference': {
      const sorted = [...values].sort((a, b) => b - a);
      const diff = sorted[0] - sorted[sorted.length - 1];
      return {
        questionText: `What is the difference between the most and the fewest?`,
        answer: diff,
      };
    }
  }
}

// Grade 1 questions are simpler
const GRADE1_QUESTIONS: QuestionType[] = ['how_many', 'most', 'least'];
const GRADE2_QUESTIONS: QuestionType[] = ['how_many', 'most', 'least', 'more_than', 'total'];
const GRADE3_QUESTIONS: QuestionType[] = [
  'how_many', 'most', 'least', 'more_than', 'fewer_than', 'total', 'difference',
];

function questionTypesForGrade(grade: number): QuestionType[] {
  if (grade <= 1) return GRADE1_QUESTIONS;
  if (grade <= 2) return GRADE2_QUESTIONS;
  return GRADE3_QUESTIONS;
}

// ─── Picture Graph Generator ────────────────────────────────────────────────

export function generatePictureGraph(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const catCount = rng.intRange(3, 4);
  const { labels, titleIdx } = pickCategories(rng, catCount);
  const ranges = template.operandRanges ?? [
    { min: 1, max: 10 },
    { min: 1, max: 1 },
  ];
  const scale = ranges[1].max > 1 ? rng.intRange(1, ranges[1].max) : 1;
  const rawValues = generateValues(rng, catCount, ranges[0].min, ranges[0].max);
  // Round values to scale multiples for picture graphs
  const values = rawValues.map((v) => Math.max(scale, Math.round(v / scale) * scale));

  const icon = ICONS[rng.intRange(0, ICONS.length - 1)];
  const title = GRAPH_TITLES.picture_graph[titleIdx];
  const grade = template.grades[0];
  const qTypes = questionTypesForGrade(grade);
  const qType = qTypes[rng.intRange(0, qTypes.length - 1)];
  const { questionText, answer } = buildQuestion(qType, labels, values, rng);

  const graphData: PictureGraphData = {
    type: 'picture_graph',
    categories: labels.map((label, i) => ({ label, value: values[i] })),
    icon,
    scale,
    title,
  };

  return {
    operands: values.slice(0, 2),
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {
      digitCount: template.digitCount,
      graphData,
    },
  };
}

// ─── Bar Graph Generator ────────────────────────────────────────────────────

export function generateBarGraph(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const catCount = rng.intRange(3, 5);
  const { labels, titleIdx } = pickCategories(rng, catCount);
  const ranges = template.operandRanges ?? [
    { min: 1, max: 20 },
    { min: 1, max: 1 },
  ];
  const values = generateValues(rng, catCount, ranges[0].min, ranges[0].max);

  const title = GRAPH_TITLES.bar_graph[titleIdx];
  const grade = template.grades[0];
  const qTypes = questionTypesForGrade(grade);
  const qType = qTypes[rng.intRange(0, qTypes.length - 1)];
  const { questionText, answer } = buildQuestion(qType, labels, values, rng);

  const graphData: BarGraphData = {
    type: 'bar_graph',
    categories: labels.map((label, i) => ({ label, value: values[i] })),
    yLabel: 'Number',
    title,
  };

  return {
    operands: values.slice(0, 2),
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {
      digitCount: template.digitCount,
      graphData,
    },
  };
}

// ─── Tally Chart Generator ──────────────────────────────────────────────────

export function generateTallyChart(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const catCount = rng.intRange(3, 5);
  const { labels, titleIdx } = pickCategories(rng, catCount);
  const ranges = template.operandRanges ?? [
    { min: 1, max: 15 },
    { min: 1, max: 1 },
  ];
  const values = generateValues(rng, catCount, ranges[0].min, ranges[0].max);

  const title = GRAPH_TITLES.tally_chart[titleIdx];
  const grade = template.grades[0];
  const qTypes = questionTypesForGrade(grade);
  const qType = qTypes[rng.intRange(0, qTypes.length - 1)];
  const { questionText, answer } = buildQuestion(qType, labels, values, rng);

  const tallyData: TallyChartData = {
    type: 'tally_chart',
    categories: labels.map((label, i) => ({ label, value: values[i] })),
    title,
  };

  return {
    operands: values.slice(0, 2),
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {
      digitCount: template.digitCount,
      graphData: tallyData,
    },
  };
}
