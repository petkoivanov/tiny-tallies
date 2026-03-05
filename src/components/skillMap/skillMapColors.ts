import type { Operation } from '@/services/mathEngine/types';
import type { NodeState } from './skillMapTypes';

/**
 * Color constants for the skill map visualization.
 *
 * Addition uses a purple family, subtraction uses a teal family.
 * State colors provide visual feedback for locked/mastered nodes.
 */
export const skillMapColors = {
  addition: {
    primary: '#7c3aed',
    light: '#a78bfa',
    lighter: '#c4b5fd',
  },
  subtraction: {
    primary: '#0d9488',
    light: '#2dd4bf',
    lighter: '#5eead4',
  },
  state: {
    lockedFill: '#374151',
    lockedRing: '#6b7280',
    masteredGold: '#fbbf24',
  },
  edge: {
    normal: '#475569',
    glow: '#818cf8',
  },
} as const;

/** Returns fill and ring colors for a skill node based on operation and state. */
export function getNodeColor(
  operation: Operation,
  state: NodeState,
): { fill: string; ring: string } {
  if (state === 'locked') {
    return {
      fill: skillMapColors.state.lockedFill,
      ring: skillMapColors.state.lockedRing,
    };
  }

  if (state === 'mastered') {
    const opColors = skillMapColors[operation];
    return {
      fill: opColors.primary,
      ring: skillMapColors.state.masteredGold,
    };
  }

  // unlocked or in-progress
  const opColors = skillMapColors[operation];
  return {
    fill: state === 'in-progress' ? opColors.primary : opColors.light,
    ring: opColors.lighter,
  };
}
