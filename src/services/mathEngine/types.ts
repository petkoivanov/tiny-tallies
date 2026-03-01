export type Operation = 'addition' | 'subtraction';
export type Grade = 1 | 2 | 3;

export interface OperandRange {
  min: number;
  max: number;
}

export interface ProblemMetadata {
  digitCount: number;
  requiresCarry: boolean;
  requiresBorrow: boolean;
}

export interface ProblemTemplate {
  id: string;
  operation: Operation;
  skillId: string;
  standards: string[];
  grades: Grade[];
  operandRanges: [OperandRange, OperandRange];
  resultRange: OperandRange;
  requiresCarry?: boolean;
  requiresBorrow?: boolean;
  baseElo: number;
  digitCount: number;
}

export interface Problem {
  id: string;
  templateId: string;
  operation: Operation;
  operands: [number, number];
  correctAnswer: number;
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
}

export interface BatchGenerationParams {
  skillId: string;
  count: number;
  seed: number;
}

export interface SkillDefinition {
  id: string;
  name: string;
  operation: Operation;
  grade: Grade;
  standards: string[];
  prerequisites: string[];
}
