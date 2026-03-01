import { z } from 'zod';

import {
  requiresCarry as checkCarry,
  requiresBorrow as checkBorrow,
} from './constraints';
import { createRng } from './seededRng';
import { findTemplate, getTemplatesBySkill } from './templates';
import type { SeededRng } from './seededRng';
import type {
  BatchGenerationParams,
  GenerationParams,
  Operation,
  Problem,
  ProblemTemplate,
} from './types';

export const GenerationParamsSchema = z.object({
  templateId: z.string(),
  seed: z.number().int(),
});

export const BatchGenerationParamsSchema = z.object({
  skillId: z.string(),
  count: z.number().int().min(1).max(50),
  seed: z.number().int(),
});

const MAX_ATTEMPTS = 100;

function generateOperands(
  template: ProblemTemplate,
  rng: SeededRng,
): [number, number] {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const a = rng.intRange(
      template.operandRanges[0].min,
      template.operandRanges[0].max,
    );

    // For subtraction, constrain b's upper bound to ensure non-negative result
    let bMax = template.operandRanges[1].max;
    if (template.operation === 'subtraction') {
      bMax = Math.min(bMax, a - 1);
      if (bMax < template.operandRanges[1].min) {
        continue;
      }
    }

    const b = rng.intRange(template.operandRanges[1].min, bMax);

    // Check carry constraint
    if (template.requiresCarry === true && !checkCarry(a, b)) {
      continue;
    }
    if (template.requiresCarry === false && checkCarry(a, b)) {
      continue;
    }

    // Check borrow constraint
    if (template.requiresBorrow === true && !checkBorrow(a, b)) {
      continue;
    }
    if (template.requiresBorrow === false && checkBorrow(a, b)) {
      continue;
    }

    // Compute result and check range
    const result =
      template.operation === 'addition' ? a + b : a - b;

    if (result < template.resultRange.min || result > template.resultRange.max) {
      continue;
    }

    return [a, b];
  }

  throw new Error(
    `Failed to generate operands for template ${template.id} after ${MAX_ATTEMPTS} attempts. Check that operand ranges are compatible with carry/borrow constraints.`,
  );
}

function formatQuestion(
  operation: Operation,
  a: number,
  b: number,
): string {
  if (operation === 'addition') {
    return `${a} + ${b} = ?`;
  }
  return `${a} - ${b} = ?`;
}

function computeAnswer(
  operation: Operation,
  a: number,
  b: number,
): number {
  if (operation === 'addition') {
    return a + b;
  }
  return a - b;
}

export function generateProblem(params: GenerationParams): Problem {
  const validated = GenerationParamsSchema.parse(params);
  const template = findTemplate(validated.templateId);
  const rng = createRng(validated.seed);
  const [a, b] = generateOperands(template, rng);
  const correctAnswer = computeAnswer(template.operation, a, b);

  return {
    id: `${template.id}_${validated.seed}`,
    templateId: template.id,
    operation: template.operation,
    operands: [a, b],
    correctAnswer,
    questionText: formatQuestion(template.operation, a, b),
    skillId: template.skillId,
    standards: template.standards,
    grade: template.grades[0],
    baseElo: template.baseElo,
    metadata: {
      digitCount: template.digitCount,
      requiresCarry: template.requiresCarry ?? false,
      requiresBorrow: template.requiresBorrow ?? false,
    },
  };
}

export function generateProblems(params: BatchGenerationParams): Problem[] {
  const validated = BatchGenerationParamsSchema.parse(params);
  const templates = getTemplatesBySkill(validated.skillId);

  if (templates.length === 0) {
    throw new Error(`No templates found for skill ${validated.skillId}`);
  }

  const problems: Problem[] = [];
  for (let i = 0; i < validated.count; i++) {
    const template = templates[i % templates.length];
    const derivedSeed = validated.seed + i;
    problems.push(
      generateProblem({ templateId: template.id, seed: derivedSeed }),
    );
  }

  return problems;
}
