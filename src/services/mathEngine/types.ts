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
  | 'number_theory'
  | 'basic_graphs'
  | 'data_analysis'
  | 'linear_equations'
  | 'coordinate_geometry'
  | 'sequences_series'
  | 'statistics_hs'
  | 'systems_equations'
  | 'quadratic_equations'
  | 'polynomials'
  | 'exponential_functions'
  | 'logarithms';

export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export const MAX_GRADE: Grade = 12;

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

/** Multi-select answer — student must select ALL correct values (e.g. quadratic roots) */
export interface MultiSelectAnswer {
  readonly type: 'multi_select';
  readonly values: readonly number[];
}

/** Union of all answer types */
export type Answer =
  | NumericAnswer
  | FractionAnswer
  | ComparisonAnswer
  | CoordinateAnswer
  | ExpressionAnswer
  | MultiSelectAnswer;

/** Factory: create a numeric answer */
export function numericAnswer(value: number): NumericAnswer {
  return { type: 'numeric', value };
}

/** Factory: create a fraction answer */
export function fractionAnswer(numerator: number, denominator: number): FractionAnswer {
  return { type: 'fraction', numerator, denominator };
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
    case 'multi_select':
      return answer.values[0] ?? 0; // Elo proxy — not used for grading
  }
}

/** Factory: create a multi-select answer */
export function multiSelectAnswer(values: number[]): MultiSelectAnswer {
  return { type: 'multi_select', values: Object.freeze([...values]) };
}

/**
 * Compare two number arrays as sets (order-independent equality).
 * Used by MultiSelectMC for all-or-nothing grading.
 */
export function setsEqual(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((v) => setA.has(v));
}

/**
 * Human-readable display string for any Answer.
 * Used in BOOST-mode tutor prompts (must NOT be called in HINT or TEACH mode).
 */
export function answerDisplayValue(answer: Answer): string {
  switch (answer.type) {
    case 'numeric': return String(answer.value);
    case 'fraction': return `${answer.numerator}/${answer.denominator}`;
    case 'comparison': return answer.value;
    case 'coordinate': return `(${answer.x}, ${answer.y})`;
    case 'expression': return answer.value;
    case 'multi_select': return answer.values.join(' and ');
  }
}

/**
 * Controls distractor generation strategy for a problem template.
 * 'default' = bug library + ±1 adjacent + random fill
 * 'domain_specific' = skip ±1 adjacent phase (domain provides meaningful distractors)
 */
export type DistractorStrategy = 'default' | 'domain_specific';

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
  /** Graph data for Data & Statistics domain problems */
  graphData?: import('@/components/session/graphs').GraphData;
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
  /** Controls distractor generation strategy */
  distractorStrategy?: DistractorStrategy;
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
  /** Controls distractor generation strategy */
  distractorStrategy?: DistractorStrategy;
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
