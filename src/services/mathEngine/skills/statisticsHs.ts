import type { SkillDefinition } from '../types';

export const STATISTICS_HS_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'stats_stddev_concept',
    name: 'Standard Deviation Concept',
    operation: 'statistics_hs',
    grade: 9,
    standards: ['HSS-ID.A.2'],
    prerequisites: ['data-analysis.scatter-trend'],
  },
  {
    id: 'stats_normal_rule',
    name: 'Normal Distribution 68-95 Rule',
    operation: 'statistics_hs',
    grade: 9,
    standards: ['HSS-ID.A.4'],
    prerequisites: ['stats_stddev_concept'],
  },
  {
    id: 'stats_zscore',
    name: 'Z-Score Calculation',
    operation: 'statistics_hs',
    grade: 10,
    standards: ['HSS-ID.A.4'],
    prerequisites: ['stats_normal_rule'],
  },
  {
    id: 'stats_percentile',
    name: 'Percentile from Z-Score',
    operation: 'statistics_hs',
    grade: 10,
    standards: ['HSS-ID.A.4'],
    prerequisites: ['stats_zscore'],
  },
  {
    id: 'stats_word_problem',
    name: 'Statistics Word Problems',
    operation: 'statistics_hs',
    grade: 10,
    standards: ['HSS-ID.A.4'],
    prerequisites: ['stats_zscore'],
  },
] as const;
