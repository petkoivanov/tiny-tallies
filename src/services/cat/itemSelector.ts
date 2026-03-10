/**
 * Item selection for CAT using maximum Fisher information.
 *
 * Selects the item from the available pool that provides the most
 * information at the current ability estimate. This minimizes the
 * standard error most quickly.
 *
 * Content balancing: applies a soft constraint to avoid administering
 * too many items from the same domain.
 */

import type { IrtItem, CatState, ItemSelectionResult } from './types';
import { fisherInformation } from './irt2pl';

/** Maximum items from a single domain before penalty applies */
const DOMAIN_CAP = 3;

/** Penalty multiplier for over-represented domains (0-1, lower = stronger) */
const DOMAIN_PENALTY = 0.3;

/**
 * Select the next item to administer using maximum Fisher information
 * with content balancing.
 *
 * Returns null if no items are available.
 */
export function selectNextItem(
  itemPool: readonly IrtItem[],
  state: CatState,
): ItemSelectionResult | null {
  // Filter out already-administered items
  const available = itemPool.filter(
    (item) => !state.administeredIds.has(item.id),
  );

  if (available.length === 0) return null;

  // Count items administered per domain
  const domainCounts = new Map<string, number>();
  for (const r of state.responses) {
    const op = r.item.operation;
    domainCounts.set(op, (domainCounts.get(op) ?? 0) + 1);
  }

  let bestItem: IrtItem | null = null;
  let bestScore = -Infinity;

  for (const item of available) {
    let info = fisherInformation(state.theta, item);

    // Apply content balancing penalty
    const count = domainCounts.get(item.operation) ?? 0;
    if (count >= DOMAIN_CAP) {
      info *= DOMAIN_PENALTY;
    }

    if (info > bestScore) {
      bestScore = info;
      bestItem = item;
    }
  }

  if (!bestItem) return null;

  return {
    item: bestItem,
    information: fisherInformation(state.theta, bestItem),
  };
}
