import type { MathDomain } from '../types';

export interface WordProblemTemplate {
  id: string;
  operations: MathDomain[];
  /** Template string with placeholders: {name}, {object}, {a}, {b}, {verb}, etc. */
  template: string;
  /** Question appended after the story (unused in prefix mode) */
  question: string;
  /** Minimum grade level for reading comprehension */
  minGrade: number;
  /** Maximum grade level — caps reading level for age-appropriate text */
  maxGrade?: number;
  /**
   * 'replace' (default): replaces questionText with story + question.
   * 'prefix': prepends scene-setting text before the original questionText.
   */
  mode?: 'replace' | 'prefix';
}

export interface GeneratedWordProblem {
  text: string;
  question: string;
}
