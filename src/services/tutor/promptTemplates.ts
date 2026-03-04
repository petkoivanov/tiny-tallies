import type { PromptParams } from './types';

const WORD_LIMITS: Record<string, number> = {
  '6-7': 8,
  '7-8': 10,
  '8-9': 12,
};

/**
 * Builds the system instruction for the Gemini model.
 * Sets persona, word limits, growth mindset language, and safety guardrails.
 */
export function buildSystemInstruction(params: PromptParams): string {
  const wordLimit = WORD_LIMITS[params.ageBracket] ?? 10;

  return [
    'You are a friendly Math Helper for a child.',
    `Keep sentences under ${wordLimit} words.`,
    'Use simple, encouraging language with growth mindset.',
    'Praise effort, not talent.',
    `The child is working at the ${params.cpaStage} stage (CPA framework).`,
    'NEVER reveal the answer.',
    'NEVER compute math for the child.',
    'Ask guiding questions to help them discover the answer.',
  ].join(' ');
}

/**
 * Builds the user message (hint prompt) sent to Gemini.
 * Includes problem context and optional misconception info.
 * CRITICAL: correctAnswer is deliberately excluded from PromptParams.
 */
export function buildHintPrompt(params: PromptParams): string {
  const lines: string[] = [
    `The child is working on: ${params.problemText}`,
    `Operation: ${params.operation}`,
  ];

  if (params.wrongAnswer !== undefined) {
    lines.push(`The child answered: ${params.wrongAnswer}`);
  }

  if (params.bugDescription) {
    lines.push(`Possible misconception: ${params.bugDescription}`);
  }

  lines.push(`This is hint level ${params.hintLevel}. Give a Socratic hint.`);

  return lines.join('\n');
}
