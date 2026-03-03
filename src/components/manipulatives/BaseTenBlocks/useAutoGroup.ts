/**
 * Auto-group hook for BaseTenBlocks.
 *
 * Manages the timer-based auto-grouping logic: when 10 cubes accumulate
 * in the ones column, they merge into a rod after AUTO_GROUP_DELAY. When
 * 10 rods accumulate in tens, they merge into a flat.
 *
 * Only one auto-group timer is active at a time (ones takes priority).
 */

import { useRef, useCallback } from 'react';

import { triggerGroupHaptic } from '../shared';
import type { BlockState, BlockType, PlaceValueColumn } from './BaseTenBlocksTypes';
import { AUTO_GROUP_DELAY, GROUP_THRESHOLD } from './BaseTenBlocksTypes';

let blockIdCounter = 0;

/** Generate a unique block ID. */
export function generateBlockId(type: BlockType): string {
  blockIdCounter += 1;
  return `${type}-${blockIdCounter}-${Date.now()}`;
}

/** Reset ID counter (for testing). */
export function resetBlockIdCounter(): void {
  blockIdCounter = 0;
}

interface UseAutoGroupOptions {
  onGroupStart: () => void;
  onGroupEnd: (
    removedIds: string[],
    newBlock: BlockState,
  ) => void;
}

/**
 * Hook that manages auto-group timer logic.
 *
 * Returns `checkAutoGroup(blocks)` -- call after any state change that
 * might trigger grouping (add block, snap, decompose).
 */
export function useAutoGroup({ onGroupStart, onGroupEnd }: UseAutoGroupOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const performGroup = useCallback(
    (
      blocks: BlockState[],
      sourceType: BlockType,
      sourceColumn: PlaceValueColumn,
      targetType: BlockType,
      targetColumn: PlaceValueColumn,
    ) => {
      onGroupStart();

      // Find first GROUP_THRESHOLD blocks of sourceType in sourceColumn
      const candidates = blocks.filter(
        (b) => b.type === sourceType && b.column === sourceColumn,
      );
      const toRemove = candidates.slice(0, GROUP_THRESHOLD);
      const removedIds = toRemove.map((b) => b.id);

      const newBlock: BlockState = {
        id: generateBlockId(targetType),
        type: targetType,
        column: targetColumn,
      };

      // Delay the state swap by MERGE_ANIMATION_DURATION to allow
      // parent to animate first (parent uses the same constant).
      // The actual animation is driven by the parent component.
      triggerGroupHaptic();
      onGroupEnd(removedIds, newBlock);
    },
    [onGroupStart, onGroupEnd],
  );

  const checkAutoGroup = useCallback(
    (blocks: BlockState[]) => {
      clearTimer();

      // Count cubes in ones
      const cubesInOnes = blocks.filter(
        (b) => b.type === 'cube' && b.column === 'ones',
      ).length;

      if (cubesInOnes >= GROUP_THRESHOLD) {
        timerRef.current = setTimeout(() => {
          performGroup(blocks, 'cube', 'ones', 'rod', 'tens');
        }, AUTO_GROUP_DELAY);
        return;
      }

      // Count rods in tens
      const rodsInTens = blocks.filter(
        (b) => b.type === 'rod' && b.column === 'tens',
      ).length;

      if (rodsInTens >= GROUP_THRESHOLD) {
        timerRef.current = setTimeout(() => {
          performGroup(blocks, 'rod', 'tens', 'flat', 'hundreds');
        }, AUTO_GROUP_DELAY);
      }
    },
    [clearTimer, performGroup],
  );

  return { checkAutoGroup, clearTimer };
}
