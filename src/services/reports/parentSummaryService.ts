/**
 * parentSummaryService — generates an AI-powered parent-friendly progress summary
 * using the existing Gemini client.
 */

import { callGemini } from '../tutor/geminiClient';

export interface ParentSummaryInput {
  childName: string;
  totalSkills: number;
  mastered: number;
  inProgress: number;
  sessionsCompleted: number;
  weeklyStreak: number;
  recentAccuracy: number | null;
  topDomains: string[];
  misconceptionCount: number;
}

const SYSTEM_INSTRUCTION = `You are writing a brief, warm progress update for a parent about their child's math learning. Keep it encouraging but honest. Use 2-3 short sentences. Do not use emojis. Do not mention specific technical terms like "Elo rating" or "BKT". Focus on what the child has achieved and what they're working on.`;

function buildUserMessage(input: ParentSummaryInput): string {
  const parts: string[] = [];
  parts.push(`Child: ${input.childName || 'Your child'}`);
  parts.push(`Skills mastered: ${input.mastered} of ${input.totalSkills}`);
  parts.push(`Skills in progress: ${input.inProgress}`);
  parts.push(`Sessions completed: ${input.sessionsCompleted}`);
  parts.push(`Weekly streak: ${input.weeklyStreak} weeks`);

  if (input.recentAccuracy !== null) {
    parts.push(
      `Recent accuracy: ${Math.round(input.recentAccuracy * 100)}%`,
    );
  }

  if (input.topDomains.length > 0) {
    parts.push(`Strongest domains: ${input.topDomains.join(', ')}`);
  }

  if (input.misconceptionCount > 0) {
    parts.push(
      `Active misconceptions being addressed: ${input.misconceptionCount}`,
    );
  }

  return parts.join('\n');
}

/**
 * Generate a parent-friendly AI summary of the child's progress.
 * Returns null if the API call fails or is unavailable.
 */
export async function generateParentSummary(
  input: ParentSummaryInput,
  abortSignal?: AbortSignal,
): Promise<string | null> {
  try {
    return await callGemini({
      systemInstruction: SYSTEM_INSTRUCTION,
      userMessage: buildUserMessage(input),
      abortSignal,
    });
  } catch {
    return null;
  }
}
