import { ADDITION_BUGS } from '@/services/mathEngine/bugLibrary/additionBugs';
import { SUBTRACTION_BUGS } from '@/services/mathEngine/bugLibrary/subtractionBugs';

/**
 * Combined bug pattern array for lookups.
 * Includes all addition and subtraction misconception patterns.
 */
const ALL_BUGS = [...ADDITION_BUGS, ...SUBTRACTION_BUGS];

/**
 * Looks up a bug description by its ID.
 * Returns the human-readable description string, or undefined if not found.
 */
export function getBugDescription(
  bugId: string | undefined,
): string | undefined {
  if (!bugId) return undefined;
  return ALL_BUGS.find((b) => b.id === bugId)?.description;
}
