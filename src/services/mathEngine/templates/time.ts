import type { ProblemTemplate } from '../types';

/**
 * Time templates. Use addition as underlying computation for elapsed time;
 * for clock-reading, operands represent hours and minutes.
 */
export const TIME_TEMPLATES: readonly ProblemTemplate[] = [
  {
    id: 'time_read_hours',
    operation: 'time',
    skillId: 'time.read.hours',
    standards: ['1.MD.3'],
    grades: [1],
    operandRanges: [
      { min: 1, max: 12 },
      { min: 0, max: 0 },
    ],
    resultRange: { min: 1, max: 12 },
    baseElo: 800,
    digitCount: 2,
    domainConfig: { type: 'read_clock', precision: 'hour' },
  },
  {
    id: 'time_read_half_hours',
    operation: 'time',
    skillId: 'time.read.half-hours',
    standards: ['1.MD.3'],
    grades: [1],
    operandRanges: [
      { min: 1, max: 12 },
      { min: 0, max: 30 },
    ],
    resultRange: { min: 1, max: 12 },
    baseElo: 850,
    digitCount: 2,
    domainConfig: { type: 'read_clock', precision: 'half_hour' },
  },
  {
    id: 'time_read_quarter_hours',
    operation: 'time',
    skillId: 'time.read.quarter-hours',
    standards: ['2.MD.7'],
    grades: [2],
    operandRanges: [
      { min: 1, max: 12 },
      { min: 0, max: 45 },
    ],
    resultRange: { min: 1, max: 12 },
    baseElo: 900,
    digitCount: 2,
    domainConfig: { type: 'read_clock', precision: 'quarter_hour' },
  },
  {
    id: 'time_read_five_minutes',
    operation: 'time',
    skillId: 'time.read.five-minutes',
    standards: ['2.MD.7'],
    grades: [2],
    operandRanges: [
      { min: 1, max: 12 },
      { min: 0, max: 55 },
    ],
    resultRange: { min: 1, max: 12 },
    baseElo: 950,
    digitCount: 2,
    domainConfig: { type: 'read_clock', precision: 'five_minutes' },
  },
  {
    id: 'time_am_pm',
    operation: 'time',
    skillId: 'time.am-pm',
    standards: ['2.MD.7'],
    grades: [2],
    operandRanges: [
      { min: 1, max: 12 },
      { min: 0, max: 59 },
    ],
    resultRange: { min: 1, max: 12 },
    baseElo: 920,
    digitCount: 2,
    domainConfig: { type: 'am_pm' },
  },
  {
    id: 'time_read_one_minute',
    operation: 'time',
    skillId: 'time.read.one-minute',
    standards: ['3.MD.1'],
    grades: [3],
    operandRanges: [
      { min: 1, max: 12 },
      { min: 0, max: 59 },
    ],
    resultRange: { min: 1, max: 12 },
    baseElo: 1000,
    digitCount: 2,
    domainConfig: { type: 'read_clock', precision: 'one_minute' },
  },
  {
    id: 'time_elapsed',
    operation: 'time',
    skillId: 'time.elapsed',
    standards: ['3.MD.1'],
    grades: [3],
    operandRanges: [
      { min: 1, max: 12 },
      { min: 5, max: 60 },
    ],
    resultRange: { min: 1, max: 12 },
    baseElo: 1050,
    digitCount: 2,
    domainConfig: { type: 'elapsed' },
  },
];
