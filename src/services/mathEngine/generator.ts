import { z } from 'zod';

import { createRng } from './seededRng';
import { findTemplate, getTemplatesBySkill } from './templates';
import { getHandler } from './domains';
import { shouldGenerateWordProblem, generateWordProblem } from './wordProblems';
import type {
  BatchGenerationParams,
  GenerationParams,
  Problem,
  ProblemMetadata,
} from './types';

export const GenerationParamsSchema = z.object({
  templateId: z.string(),
  seed: z.number().int(),
  elo: z.number().optional(),
});

export const BatchGenerationParamsSchema = z.object({
  skillId: z.string(),
  count: z.number().int().min(1).max(50),
  seed: z.number().int(),
});

export function generateProblem(params: GenerationParams): Problem {
  const validated = GenerationParamsSchema.parse(params);
  const template = findTemplate(validated.templateId);
  const rng = createRng(validated.seed);

  const handler = getHandler(template.operation);
  const data = handler.generate(template, rng);

  const metadata: ProblemMetadata = {
    digitCount: template.digitCount,
    requiresCarry: template.requiresCarry ?? false,
    requiresBorrow: template.requiresBorrow ?? false,
    ...data.metadata,
  };

  let questionText = data.questionText;

  // Word problem wrap: probabilistically replace bare equation with narrative
  if (validated.elo !== undefined && shouldGenerateWordProblem(validated.elo, rng)) {
    const wp = generateWordProblem(
      template.operation,
      data.operands[0],
      data.operands[1],
      template.grades[0],
      rng,
      data.questionText,
    );
    if (wp) {
      questionText = `${wp.text} ${wp.question}`;
      metadata.wordProblem = true;
    }
  }

  return {
    id: `${template.id}_${validated.seed}`,
    templateId: template.id,
    operation: template.operation,
    operands: data.operands,
    correctAnswer: data.correctAnswer,
    questionText,
    skillId: template.skillId,
    standards: template.standards,
    grade: template.grades[0],
    baseElo: template.baseElo,
    metadata,
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
