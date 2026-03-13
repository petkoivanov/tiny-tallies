import type { MathDomain } from '@/services/mathEngine/types';
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
  multiplication: {
    primary: '#d97706',
    light: '#fbbf24',
    lighter: '#fde68a',
  },
  division: {
    primary: '#dc2626',
    light: '#f87171',
    lighter: '#fca5a5',
  },
  fractions: {
    primary: '#2563eb',
    light: '#60a5fa',
    lighter: '#93c5fd',
  },
  place_value: {
    primary: '#059669',
    light: '#34d399',
    lighter: '#6ee7b7',
  },
  time: {
    primary: '#7c3aed',
    light: '#a78bfa',
    lighter: '#c4b5fd',
  },
  money: {
    primary: '#16a34a',
    light: '#4ade80',
    lighter: '#86efac',
  },
  patterns: {
    primary: '#9333ea',
    light: '#c084fc',
    lighter: '#d8b4fe',
  },
  measurement: {
    primary: '#0891b2',
    light: '#22d3ee',
    lighter: '#67e8f9',
  },
  ratios: {
    primary: '#be185d',
    light: '#f472b6',
    lighter: '#f9a8d4',
  },
  exponents: {
    primary: '#4f46e5',
    light: '#818cf8',
    lighter: '#a5b4fc',
  },
  expressions: {
    primary: '#b45309',
    light: '#f59e0b',
    lighter: '#fcd34d',
  },
  geometry: {
    primary: '#0e7490',
    light: '#06b6d4',
    lighter: '#67e8f9',
  },
  probability: {
    primary: '#7e22ce',
    light: '#a855f7',
    lighter: '#c084fc',
  },
  number_theory: {
    primary: '#15803d',
    light: '#22c55e',
    lighter: '#86efac',
  },
  basic_graphs: {
    primary: '#ea580c',
    light: '#fb923c',
    lighter: '#fdba74',
  },
  data_analysis: {
    primary: '#0f766e',
    light: '#14b8a6',
    lighter: '#5eead4',
  },
  linear_equations: {
    primary: '#1d4ed8',
    light: '#3b82f6',
    lighter: '#93c5fd',
  },
  coordinate_geometry: {
    primary: '#6d28d9',
    light: '#8b5cf6',
    lighter: '#c4b5fd',
  },
  sequences_series: {
    primary: '#0369a1',
    light: '#38bdf8',
    lighter: '#7dd3fc',
  },
  statistics_hs: {
    primary: '#065f46',
    light: '#10b981',
    lighter: '#6ee7b7',
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
  operation: MathDomain,
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
