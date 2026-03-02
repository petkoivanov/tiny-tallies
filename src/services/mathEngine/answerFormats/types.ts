import type { Problem } from '../types';

/** Supported answer presentation formats */
export type AnswerFormat = 'multiple_choice' | 'free_text';

/** A single option in a multiple choice presentation */
export interface ChoiceOption {
  /** The numeric answer value */
  readonly value: number;
  /** Bug pattern id if this distractor came from the bug library */
  readonly bugId?: string;
}

/** Multiple choice presentation wrapping a Problem */
export interface MultipleChoicePresentation {
  readonly problem: Problem;
  readonly format: 'multiple_choice';
  readonly options: readonly ChoiceOption[];
  readonly correctIndex: number;
}

/** Free text input presentation wrapping a Problem */
export interface FreeTextPresentation {
  readonly problem: Problem;
  readonly format: 'free_text';
  readonly maxDigits: number;
}

/** Union of all answer format presentations */
export type FormattedProblem = MultipleChoicePresentation | FreeTextPresentation;
