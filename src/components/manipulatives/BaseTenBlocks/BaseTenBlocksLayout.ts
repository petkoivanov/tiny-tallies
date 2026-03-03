/**
 * Pure layout calculation functions for BaseTenBlocks.
 *
 * No React imports -- these are deterministic math functions for positioning
 * blocks within columns and the source tray.
 */

import type { BlockType, PlaceValueColumn } from './BaseTenBlocksTypes';

// ---------------------------------------------------------------------------
// Block sizing constants (dp)
// ---------------------------------------------------------------------------

/** Ones cube: 36x36dp square. */
export const CUBE_SIZE = 36;

/** Tens rod width: 36dp (same as cube width). */
export const ROD_WIDTH = 36;

/** Tens rod height: 108dp (3x cube height for visual distinction). */
export const ROD_HEIGHT = 108;

/** Hundreds flat: 108x108dp square. */
export const FLAT_SIZE = 108;

/** Height of the source tray at the bottom. */
export const TRAY_HEIGHT = 80;

/** Spacing between blocks within a column. */
const BLOCK_GAP = 4;

/** Max cubes per row in ones column. */
const CUBES_PER_ROW = 5;

/** Padding within each column. */
const COLUMN_PADDING = 8;

// ---------------------------------------------------------------------------
// Layout functions
// ---------------------------------------------------------------------------

/**
 * Calculate the width of each place-value column.
 * Each column gets approximately 1/3 of the container width with padding.
 */
export function getColumnWidth(containerWidth: number): number {
  return Math.floor((containerWidth - COLUMN_PADDING * 4) / 3);
}

/**
 * Calculate position for a block within its column.
 * - Cubes stack in rows (max 5 per row, then wrap).
 * - Rods stack horizontally with gap.
 * - Flats stack with diagonal offset.
 */
export function getBlockPosition(
  column: PlaceValueColumn,
  indexInColumn: number,
  containerWidth: number,
): { x: number; y: number } {
  const colWidth = getColumnWidth(containerWidth);
  const columnOrder: PlaceValueColumn[] = ['hundreds', 'tens', 'ones'];
  const colIndex = columnOrder.indexOf(column);
  const colLeft = COLUMN_PADDING + colIndex * (colWidth + COLUMN_PADDING);

  // Top offset to leave room for column label
  const labelHeight = 28;

  if (column === 'ones') {
    // Cubes stack in rows of CUBES_PER_ROW
    const row = Math.floor(indexInColumn / CUBES_PER_ROW);
    const col = indexInColumn % CUBES_PER_ROW;
    return {
      x: colLeft + col * (CUBE_SIZE + BLOCK_GAP),
      y: labelHeight + row * (CUBE_SIZE + BLOCK_GAP),
    };
  }

  if (column === 'tens') {
    // Rods stack horizontally
    const col = indexInColumn % 3;
    const row = Math.floor(indexInColumn / 3);
    return {
      x: colLeft + col * (ROD_WIDTH + BLOCK_GAP),
      y: labelHeight + row * (ROD_HEIGHT + BLOCK_GAP),
    };
  }

  // Hundreds: flats stack with slight diagonal offset
  return {
    x: colLeft + indexInColumn * 6,
    y: labelHeight + indexInColumn * 6,
  };
}

/**
 * Calculate positions for the three source blocks in the tray.
 */
export function getTrayPositions(containerWidth: number): {
  cube: { x: number; y: number };
  rod: { x: number; y: number };
  flat: { x: number; y: number };
} {
  const section = containerWidth / 3;
  const centerY = TRAY_HEIGHT / 2;

  return {
    flat: { x: section * 0.5, y: centerY },
    rod: { x: section * 1.5, y: centerY },
    cube: { x: section * 2.5, y: centerY },
  };
}

/**
 * Return dimensions for a given block type.
 */
export function getBlockSize(type: BlockType): {
  width: number;
  height: number;
} {
  switch (type) {
    case 'cube':
      return { width: CUBE_SIZE, height: CUBE_SIZE };
    case 'rod':
      return { width: ROD_WIDTH, height: ROD_HEIGHT };
    case 'flat':
      return { width: FLAT_SIZE, height: FLAT_SIZE };
  }
}
