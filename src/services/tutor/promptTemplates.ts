import type {
  PromptParams,
  BoostPromptParams,
  ConfirmedMisconceptionContext,
  TutorMode,
} from './types';

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

/** Per-mode guidance text for historical misconception context. */
const MISCONCEPTION_GUIDANCE: Record<TutorMode, string> = {
  hint: 'The child has shown these patterns before. Steer them away from these mistakes through your questions without naming the patterns directly.',
  teach:
    'The child has shown these patterns before. Address these step by step in your explanation without naming them directly.',
  boost:
    'The child has shown these patterns before. Explain why these patterns lead to wrong answers.',
};

/**
 * Formats confirmed misconception data for inclusion in prompts.
 * Caps at 3 entries. Returns empty string if array is empty/undefined.
 */
function formatMisconceptionContext(
  misconceptions: ConfirmedMisconceptionContext[] | undefined,
  mode: TutorMode,
): string {
  if (!misconceptions || misconceptions.length === 0) return '';

  const capped = misconceptions.slice(0, 3);
  const bullets = capped.map((m) => `- ${m.description}`).join('\n');
  return `Historical misconception patterns for this skill:\n${bullets}\n${MISCONCEPTION_GUIDANCE[mode]}`;
}

/**
 * Builds hint-mode system instruction for hint ladder generation.
 * Asks the LLM to return a JSON array of 3-4 progressive hints.
 * CRITICAL: LLM must NEVER reveal the answer in any hint.
 */
function buildHintSystemInstruction(
  wordLimit: number,
  cpaStage: PromptParams['cpaStage'],
): string {
  return [
    'You are a friendly Math Helper for a child.',
    `Keep each hint to 1-2 sentences, under ${wordLimit} words per sentence.`,
    'Use simple, encouraging language with growth mindset.',
    'Praise effort, not talent. Say things like "great try" not "you are smart".',
    `The child is working at the ${cpaStage} stage (CPA framework).`,
    'RESPONSE FORMAT: Return ONLY a JSON array of 3-4 hint strings. No markdown, no explanation, just the JSON array.',
    'PROGRESSIVE HINT RULES:',
    '1. Hint 1: Explain the concept for someone seeing it for the first time. What does the operation mean?',
    '2. Hint 2: Show how to set up the problem. Break it into steps without computing.',
    '3. Hint 3: Show intermediate work, leaving ONLY the final step for the child.',
    '4. Optional Hint 4: Give one more nudge if the problem is complex, but STILL do not reveal the final answer.',
    'CRITICAL SAFETY RULES:',
    '5. NEVER reveal the final answer as a digit or word in ANY hint.',
    '6. NEVER compute the final result. Stop one step before.',
    '7. Use guiding statements, NOT questions. The child cannot type answers back.',
    ...getSharedSafetyRules(8),
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
 * Builds the user message for hint ladder generation.
 * Asks Gemini to return a JSON array of 3-4 progressive hints.
 * CRITICAL: correctAnswer is deliberately excluded from PromptParams.
 */
export function buildHintPrompt(params: PromptParams): string {
  const lines: string[] = [
    `The child is working on: ${params.problemText}`,
    `MathDomain: ${params.operation}`,
  ];

  if (params.wrongAnswer !== undefined) {
    lines.push(`The child answered: ${params.wrongAnswer}`);
  }

  if (params.bugDescription) {
    lines.push(`Possible misconception: ${params.bugDescription}`);
  }

  const misconceptionBlock = formatMisconceptionContext(
    params.confirmedMisconceptions,
    'hint',
  );
  if (misconceptionBlock) {
    lines.push(misconceptionBlock);
  }

  lines.push(
    'Generate 3-4 progressive hints as a JSON array of strings.',
    'Each hint should be MORE revealing than the last, but NEVER reveal the final answer.',
    'Hint 1: Explain the concept. Hint 2: Set up the steps. Hint 3: Show work up to the last step. Hint 4 (optional): One more nudge.',
    'Example format: ["Hint 1 text", "Hint 2 text", "Hint 3 text"]',
  );

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
    `MathDomain: ${params.operation}`,
  ];

  if (params.wrongAnswer !== undefined) {
    lines.push(`The child answered: ${params.wrongAnswer}`);
  }

  if (params.bugDescription) {
    lines.push(
      `The child may have ${params.bugDescription}. Address this without naming it directly.`,
    );
  }

  const misconceptionBlock = formatMisconceptionContext(
    params.confirmedMisconceptions,
    'teach',
  );
  if (misconceptionBlock) {
    lines.push(misconceptionBlock);
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
    `MathDomain: ${params.operation}`,
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

  const misconceptionBlock = formatMisconceptionContext(
    params.confirmedMisconceptions,
    'boost',
  );
  if (misconceptionBlock) {
    lines.push(misconceptionBlock);
  }

  lines.push(
    'Explain the answer with a teaching tone. Show WHY it is correct.',
  );

  return lines.join('\n');
}
