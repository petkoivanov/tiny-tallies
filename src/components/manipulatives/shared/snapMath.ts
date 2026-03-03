import type { SnapTarget } from './types';

/**
 * Find the nearest snap target within a threshold distance from a point.
 * Uses Euclidean distance from point to target center.
 * Returns null if no target is within threshold or targets array is empty.
 *
 * @param x - Point x coordinate
 * @param y - Point y coordinate
 * @param targets - Array of snap targets to search
 * @param threshold - Maximum distance (exclusive) for a valid snap
 * @returns Nearest SnapTarget within threshold, or null
 */
export function findNearestSnap(
  x: number,
  y: number,
  targets: SnapTarget[],
  threshold: number,
): SnapTarget | null {
  'worklet';

  let nearest: SnapTarget | null = null;
  let minDist = threshold;

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const dx = x - t.cx;
    const dy = y - t.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDist) {
      minDist = dist;
      nearest = t;
    }
  }

  return nearest;
}

/**
 * Check if a point is inside a snap zone's bounding box (inclusive of edges).
 * Uses axis-aligned bounding box with half-width/half-height from center.
 *
 * @param x - Point x coordinate
 * @param y - Point y coordinate
 * @param zone - SnapTarget defining the zone bounds
 * @returns true if point is inside or on the edge of the zone
 */
export function isInsideZone(
  x: number,
  y: number,
  zone: SnapTarget,
): boolean {
  'worklet';

  const halfW = zone.width / 2;
  const halfH = zone.height / 2;

  return (
    x >= zone.cx - halfW &&
    x <= zone.cx + halfW &&
    y >= zone.cy - halfH &&
    y <= zone.cy + halfH
  );
}
