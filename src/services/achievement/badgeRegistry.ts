import type { BadgeCategory, BadgeDefinition } from './badgeTypes';

// Stub: will be populated in GREEN phase
export const BADGES: readonly BadgeDefinition[] = [];

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.id === id);
}

export function getBadgesByCategory(
  category: BadgeCategory,
): BadgeDefinition[] {
  return BADGES.filter((b) => b.category === category);
}
