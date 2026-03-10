import type { Operation } from '../types';

export interface WordProblemTemplate {
  id: string;
  operations: Operation[];
  /** Template string with placeholders: {name}, {object}, {a}, {b}, {verb}, etc. */
  template: string;
  /** Question appended after the story */
  question: string;
  /** Minimum grade level for reading comprehension */
  minGrade: number;
}

export interface GeneratedWordProblem {
  text: string;
  question: string;
}
