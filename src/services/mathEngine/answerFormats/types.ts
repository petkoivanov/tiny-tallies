import type { Problem } from '../types';

/** Supported answer presentation formats */
export type AnswerFormat = 'multiple_choice' | 'free_text' | 'multi_select';

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
  readonly allowDecimal: boolean;
  readonly allowNegative?: boolean;
}

/** Multi-select (checkbox) presentation for problems with multiple correct values */
export interface MultiSelectPresentation {
  readonly problem: Problem;
  readonly format: 'multi_select';
  readonly options: readonly ChoiceOption[];
  /** Indices into options[] that are correct — used for binary grading */
  readonly correctIndices: readonly number[];
}

/** Union of all answer format presentations */
export type FormattedProblem = MultipleChoicePresentation | FreeTextPresentation | MultiSelectPresentation;
