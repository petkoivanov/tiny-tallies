import { findNearestSnap, isInsideZone } from '@/components/manipulatives/shared/snapMath';
import type { SnapTarget } from '@/components/manipulatives/shared/types';

describe('snapMath', () => {
  describe('findNearestSnap', () => {
    const targetA: SnapTarget = { id: 'a', cx: 100, cy: 100, width: 50, height: 50 };
    const targetB: SnapTarget = { id: 'b', cx: 200, cy: 200, width: 50, height: 50 };
    const targetC: SnapTarget = { id: 'c', cx: 150, cy: 150, width: 50, height: 50 };

    it('returns nearest target when point is within threshold distance', () => {
      const result = findNearestSnap(105, 105, [targetA, targetB], 50);
      expect(result).toEqual(targetA);
    });

    it('returns null when no target is within threshold', () => {
      const result = findNearestSnap(500, 500, [targetA, targetB], 50);
      expect(result).toBeNull();
    });

    it('returns closest target when multiple targets are within threshold', () => {
      // Point at (140, 140) is closer to targetC (150,150) than targetA (100,100)
      const result = findNearestSnap(140, 140, [targetA, targetC, targetB], 50);
      expect(result).toEqual(targetC);
    });

    it('returns null for empty targets array', () => {
      const result = findNearestSnap(100, 100, [], 50);
      expect(result).toBeNull();
    });

    it('returns first found when equidistant targets exist', () => {
      const targetD: SnapTarget = { id: 'd', cx: 110, cy: 100, width: 50, height: 50 };
      const targetE: SnapTarget = { id: 'e', cx: 90, cy: 100, width: 50, height: 50 };
      // Point at (100, 100) is equidistant from both (distance 10 each)
      const result = findNearestSnap(100, 100, [targetD, targetE], 50);
      expect(result).toEqual(targetD);
    });

    it('returns target when point is exactly on target center', () => {
      const result = findNearestSnap(100, 100, [targetA], 50);
      expect(result).toEqual(targetA);
    });

    it('returns null when point is exactly at threshold boundary (exclusive)', () => {
      // targetA center is at (100, 100). Point at (150, 100) is exactly distance 50.
      // Threshold check is strictly less than, so distance === threshold should return null.
      const result = findNearestSnap(150, 100, [targetA], 50);
      expect(result).toBeNull();
    });
  });

  describe('isInsideZone', () => {
    const zone: SnapTarget = { id: 'zone1', cx: 100, cy: 100, width: 60, height: 40 };
    // Half-width = 30, half-height = 20
    // Zone bounds: x: [70, 130], y: [80, 120]

    it('returns true when point is inside zone bounds', () => {
      expect(isInsideZone(100, 100, zone)).toBe(true);
    });

    it('returns false when point is to the left of zone', () => {
      expect(isInsideZone(60, 100, zone)).toBe(false);
    });

    it('returns false when point is to the right of zone', () => {
      expect(isInsideZone(140, 100, zone)).toBe(false);
    });

    it('returns false when point is above zone', () => {
      expect(isInsideZone(100, 70, zone)).toBe(false);
    });

    it('returns false when point is below zone', () => {
      expect(isInsideZone(100, 130, zone)).toBe(false);
    });

    it('returns true when point is exactly on zone edge (inclusive)', () => {
      // Left edge
      expect(isInsideZone(70, 100, zone)).toBe(true);
      // Right edge
      expect(isInsideZone(130, 100, zone)).toBe(true);
      // Top edge
      expect(isInsideZone(100, 80, zone)).toBe(true);
      // Bottom edge
      expect(isInsideZone(100, 120, zone)).toBe(true);
    });

    it('returns true at corner of zone (inclusive)', () => {
      // Top-left corner
      expect(isInsideZone(70, 80, zone)).toBe(true);
      // Bottom-right corner
      expect(isInsideZone(130, 120, zone)).toBe(true);
    });
  });
});
