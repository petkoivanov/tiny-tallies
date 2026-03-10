export type MathDomain =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'fractions'
  | 'place_value'
  | 'time'
  | 'money'
  | 'patterns'
  | 'measurement'
  | 'ratios'
  | 'exponents'
  | 'expressions'
  | 'geometry'
  | 'probability'
  | 'number_theory';

export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface OperandRange {
  min: number;
  max: number;
}

// ---------------------------------------------------------------------------
// Answer types — discriminated union for all possible answer formats
// ---------------------------------------------------------------------------

/** Integer or decimal numeric answer */
export interface NumericAnswer {
  readonly type: 'numeric';
  readonly value: number;
}

/** Fraction answer (numerator/denominator) */
export interface FractionAnswer {
  readonly type: 'fraction';
  readonly numerator: number;
  readonly denominator: number;
}

/** Comparison answer (>, <, =) */
export interface ComparisonAnswer {
  readonly type: 'comparison';
  readonly value: '>' | '<' | '=';
}

/** Coordinate pair answer */
export interface CoordinateAnswer {
  readonly type: 'coordinate';
  readonly x: number;
  readonly y: number;
}

/** Algebraic expression answer */
export interface ExpressionAnswer {
  readonly type: 'expression';
  readonly value: string;
}

/** Union of all answer types */
export type Answer =
  | NumericAnswer
  | FractionAnswer
  | ComparisonAnswer
  | CoordinateAnswer
  | ExpressionAnswer;

/** Factory: create a numeric answer */
export function numericAnswer(value: number): NumericAnswer {
  return { type: 'numeric', value };
}

/**
 * Extract the numeric value from any Answer.
 * For non-numeric types, returns a best-effort numeric representation.
 */
export function answerNumericValue(answer: Answer): number {
  switch (answer.type) {
    case 'numeric':
      return answer.value;
    case 'fraction':
      return answer.denominator !== 0
        ? answer.numerator / answer.denominator
        : 0;
    case 'comparison':
      return answer.value === '>' ? 1 : answer.value === '<' ? -1 : 0;
    case 'coordinate':
      return answer.x;
    case 'expression':
      return parseFloat(answer.value) || 0;
  }
}

// ---------------------------------------------------------------------------
// Domain handler interface — each math domain implements this
// ---------------------------------------------------------------------------

import type { SeededRng } from './seededRng';

/** Data produced by a domain handler for a single problem */
export interface DomainProblemData {
  operands: number[];
  correctAnswer: Answer;
  questionText: string;
  metadata: Partial<ProblemMetadata>;
}

/** Domain handler: generates domain-specific problem data from a template */
export interface DomainHandler {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData;
}

// ---------------------------------------------------------------------------
// Problem metadata & templates
// ---------------------------------------------------------------------------

export interface ProblemMetadata {
  digitCount: number;
  requiresCarry: boolean;
  requiresBorrow: boolean;
  /** Time problems: the time to display on the clock face */
  displayTime?: { hours: number; minutes: number };
  /** Money problems: coins to display */
  coinSet?: readonly { coin: string; count: number }[];
  /** Fraction problems: visual fraction data */
  fractionDisplay?: { numerator: number; denominator: number };
  /** Whether this problem is a word problem */
  wordProblem?: boolean;
  /** Display string for non-numeric answers (e.g. "3:45", "$1.25") */
  answerDisplay?: string;
}

export interface ProblemTemplate {
  id: string;
  operation: MathDomain;
  skillId: string;
  standards: string[];
  grades: Grade[];
  /** Operand ranges — required for arithmetic, optional for non-arithmetic domains */
  operandRanges?: [OperandRange, OperandRange];
  /** Result range — required for arithmetic, optional for non-arithmetic domains */
  resultRange?: OperandRange;
  requiresCarry?: boolean;
  requiresBorrow?: boolean;
  baseElo: number;
  digitCount: number;
  /** Domain-specific template configuration */
  domainConfig?: Record<string, unknown>;
}

export interface Problem {
  id: string;
  templateId: string;
  operation: MathDomain;
  operands: number[];
  correctAnswer: Answer;
  questionText: string;
  skillId: string;
  standards: string[];
  grade: Grade;
  baseElo: number;
  metadata: ProblemMetadata;
}

export interface GenerationParams {
  templateId: string;
  seed: number;
  /** Student Elo for word problem probability. Omit to skip word problems. */
  elo?: number;
}

export interface BatchGenerationParams {
  skillId: string;
  count: number;
  seed: number;
}

export interface SkillDefinition {
  id: string;
  name: string;
  operation: MathDomain;
  grade: Grade;
  standards: string[];
  prerequisites: string[];
}
