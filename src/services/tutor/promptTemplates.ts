import type { PromptParams, BoostPromptParams } from './types';

export const WORD_LIMITS: Record<string, number> = {
  '6-7': 8,
  '7-8': 10,
  '8-9': 12,
};

/**
 * Returns CPA-stage-specific language guidance for TEACH mode.
 * Helps the LLM frame explanations using the right representation level.
 */
function getCpaLanguageGuidance(
  cpaStage: PromptParams['cpaStage'],
): string {
  switch (cpaStage) {
    case 'concrete':
      return 'Reference blocks and physical objects. Use hands-on language.';
    case 'pictorial':
      return 'Reference pictures and diagrams. Use visual language.';
    case 'abstract':
      return 'Reference math notation and algorithms. Use symbolic language.';
  }
}

/**
 * Shared safety/behavior rules used across all modes (rules 5-7).
 */
function getSharedSafetyRules(ruleStart: number): string[] {
  return [
    `${ruleStart}. Use only age-appropriate, simple words.`,
    `${ruleStart + 1}. Never use sarcasm, irony, or complex humor.`,
    `${ruleStart + 2}. Never discuss topics outside math.`,
  ];
}

/**
 * Builds hint-mode system instruction (original behavior).
 * CRITICAL: LLM must NEVER reveal the answer.
 */
function buildHintSystemInstruction(
  wordLimit: number,
  cpaStage: PromptParams['cpaStage'],
): string {
  return [
    'You are a friendly Math Helper for a child.',
    `Keep sentences under ${wordLimit} words.`,
    'Use simple, encouraging language with growth mindset.',
    'Praise effort, not talent. Say things like "great try" not "you are smart".',
    `The child is working at the ${cpaStage} stage (CPA framework).`,
    'CRITICAL SAFETY RULES:',
    '1. NEVER reveal the answer as a digit or word.',
    '2. NEVER compute math for the child.',
    '3. NEVER say the result of any calculation.',
    '4. Ask guiding questions to help them discover the answer.',
    ...getSharedSafetyRules(5),
  ].join(' ');
}

/**
 * Builds teach-mode system instruction.
 * Walks through the problem step by step but NEVER reveals the final answer.
 */
function buildTeachSystemInstruction(
  wordLimit: number,
  cpaStage: PromptParams['cpaStage'],
): string {
  return [
    'You are a friendly Math Helper for a child.',
    `Keep sentences under ${wordLimit} words.`,
    'Use simple, encouraging language with growth mindset.',
    'Praise effort, not talent. Say things like "great try" not "you are smart".',
    `The child is working at the ${cpaStage} stage (CPA framework).`,
    getCpaLanguageGuidance(cpaStage),
    'TEACHING RULES:',
    '1. Walk through the problem step by step.',
    '2. NEVER reveal the final answer as a digit or word.',
    '3. NEVER compute the final result for the child.',
    '4. Show HOW to solve it, letting the child do the last step.',
    ...getSharedSafetyRules(5),
  ].join(' ');
}

/**
 * Builds boost-mode system instruction.
 * LLM MAY reveal the answer and focuses on explaining WHY.
 */
function buildBoostSystemInstruction(
  wordLimit: number,
  cpaStage: PromptParams['cpaStage'],
): string {
  return [
    'You are a friendly Math Helper for a child.',
    `Keep sentences under ${wordLimit} words.`,
    'Use simple, encouraging language with growth mindset.',
    'Praise effort, not talent. Say things like "great try" not "you are smart".',
    `The child is working at the ${cpaStage} stage (CPA framework).`,
    getCpaLanguageGuidance(cpaStage),
    'BOOST MODE RULES:',
    '1. You MAY reveal the answer.',
    '2. Focus on WHY the answer is correct.',
    '3. Break down the steps clearly.',
    '4. Be encouraging -- this is a learning moment, not a failure.',
    ...getSharedSafetyRules(5),
  ].join(' ');
}

/**
 * Builds the system instruction for the Gemini model.
 * Mode-aware: varies safety rules by tutorMode.
 *
 * - hint: NEVER reveal the answer (Socratic questioning)
 * - teach: Walk through steps but NEVER reveal the final answer
 * - boost: MAY reveal the answer, focus on WHY
 */
export function buildSystemInstruction(params: PromptParams): string {
  const wordLimit = WORD_LIMITS[params.ageBracket] ?? 10;

  switch (params.tutorMode) {
    case 'teach':
      return buildTeachSystemInstruction(wordLimit, params.cpaStage);
    case 'boost':
      return buildBoostSystemInstruction(wordLimit, params.cpaStage);
    case 'hint':
    default:
      return buildHintSystemInstruction(wordLimit, params.cpaStage);
  }
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

/**
 * Builds the user message for TEACH mode.
 * Includes problem context, CPA-stage framing, and optional misconception info.
 * CRITICAL: correctAnswer is deliberately excluded -- LLM must NEVER see it.
 */
export function buildTeachPrompt(params: PromptParams): string {
  const lines: string[] = [
    `The child is working on: ${params.problemText}`,
    `Operation: ${params.operation}`,
  ];

  if (params.wrongAnswer !== undefined) {
    lines.push(`The child answered: ${params.wrongAnswer}`);
  }

  if (params.bugDescription) {
    lines.push(
      `The child may have ${params.bugDescription}. Address this without naming it directly.`,
    );
  }

  lines.push(
    'Walk through this problem step by step. Let the child complete the final step.',
  );

  return lines.join('\n');
}

/**
 * Builds the user message for BOOST mode.
 * Includes correctAnswer (via BoostPromptParams) and teaches WHY.
 * This is the ONLY prompt function that receives the correct answer.
 */
export function buildBoostPrompt(params: BoostPromptParams): string {
  const lines: string[] = [
    `The child is working on: ${params.problemText}`,
    `Operation: ${params.operation}`,
    `The correct answer is: ${params.correctAnswer}`,
  ];

  if (params.wrongAnswer !== undefined) {
    lines.push(`The child answered: ${params.wrongAnswer}`);
  }

  if (params.bugDescription) {
    lines.push(
      `The child may have ${params.bugDescription}. Address this without naming it directly.`,
    );
  }

  lines.push(
    'Explain the answer with a teaching tone. Show WHY it is correct.',
  );

  return lines.join('\n');
}
