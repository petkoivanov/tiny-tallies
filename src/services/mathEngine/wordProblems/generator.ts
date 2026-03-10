import type { SeededRng } from '../seededRng';
import type { Operation } from '../types';
import { NAMES, OBJECTS, PLACES, ACTIVITIES, GIVE_AWAY_VERBS } from './namePools';
import { WORD_PROBLEM_TEMPLATES } from './templates';
import type { GeneratedWordProblem } from './types';

/**
 * Determines whether a word problem should be generated based on Elo.
 * Returns true with probability based on the word problem frequency table:
 * - Elo < 850: 0%
 * - 850-1000: 10%
 * - 1000-1100: 20%
 * - 1100-1200: 30%
 * - Elo > 1200: 40%
 */
export function shouldGenerateWordProblem(elo: number, rng: SeededRng): boolean {
  let probability: number;
  if (elo < 850) probability = 0;
  else if (elo < 1000) probability = 0.1;
  else if (elo < 1100) probability = 0.2;
  else if (elo < 1200) probability = 0.3;
  else probability = 0.4;

  return rng.next() < probability;
}

/**
 * Generates a word problem for the given operation and operands.
 * Returns null if no suitable template exists for the operation/grade.
 */
export function generateWordProblem(
  operation: Operation,
  a: number,
  b: number,
  grade: number,
  rng: SeededRng,
): GeneratedWordProblem | null {
  const applicable = WORD_PROBLEM_TEMPLATES.filter(
    (t) => t.operations.includes(operation) && t.minGrade <= grade,
  );

  if (applicable.length === 0) return null;

  const template = applicable[rng.intRange(0, applicable.length - 1)];

  const name = NAMES[rng.intRange(0, NAMES.length - 1)];
  let name2 = NAMES[rng.intRange(0, NAMES.length - 1)];
  while (name2 === name) {
    name2 = NAMES[rng.intRange(0, NAMES.length - 1)];
  }

  const object = OBJECTS.countable[rng.intRange(0, OBJECTS.countable.length - 1)];
  const container = OBJECTS.containers[rng.intRange(0, OBJECTS.containers.length - 1)];
  const containerSingular = container.endsWith('es')
    ? container.slice(0, -2)
    : container.slice(0, -1);
  const place = PLACES[rng.intRange(0, PLACES.length - 1)];
  const verb = ACTIVITIES[rng.intRange(0, ACTIVITIES.length - 1)];
  const giveVerb = GIVE_AWAY_VERBS[rng.intRange(0, GIVE_AWAY_VERBS.length - 1)];

  const vars: Record<string, string> = {
    name,
    name2,
    a: String(a),
    b: String(b),
    object,
    container,
    container_s: containerSingular,
    place,
    verb,
    giveVerb,
  };

  const text = interpolate(template.template, vars);
  const question = interpolate(template.question, vars);

  return { text, question };
}

function interpolate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}
