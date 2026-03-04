import { z } from 'zod';

export type TutorMode = 'hint' | 'teach' | 'boost';
export type AgeBracket = '6-7' | '7-8' | '8-9';

export interface TutorMessage {
  id: string;
  role: 'tutor' | 'child';
  text: string;
  timestamp: number;
}

/**
 * Parameters for building LLM prompts.
 * CRITICAL: correctAnswer is deliberately excluded -- LLM must NEVER see it.
 */
export interface PromptParams {
  ageBracket: AgeBracket;
  cpaStage: 'concrete' | 'pictorial' | 'abstract';
  problemText: string;
  operation: string;
  wrongAnswer?: number;
  bugDescription?: string;
  tutorMode: TutorMode;
  hintLevel: number;
}

/**
 * Extended parameters for BOOST mode prompts.
 * ONLY type that includes correctAnswer -- type system enforces
 * that HINT/TEACH never see it.
 */
export interface BoostPromptParams extends PromptParams {
  correctAnswer: number;
}

/**
 * Zod schema for validating Gemini API responses.
 * Enforces non-empty text with a 1000-char ceiling.
 */
export const geminiResponseSchema = z.object({
  text: z.string().min(1).max(1000),
});

export type GeminiResponse = z.infer<typeof geminiResponseSchema>;
