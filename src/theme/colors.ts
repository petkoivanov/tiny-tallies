/**
 * Theme color palette definitions for Tiny Tallies.
 *
 * 5 themes with 12 color tokens each. Correct/incorrect are universal
 * across all themes for instant feedback recognition.
 */

export type ThemeId = 'dark' | 'ocean' | 'forest' | 'sunset' | 'space';

export interface ThemeColors {
  background: string;
  backgroundLight: string;
  surface: string;
  surfaceLight: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  correct: string;
  incorrect: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}

export const THEMES: Record<ThemeId, ThemeColors> = {
  dark: {
    background: '#1a1a2e',
    backgroundLight: '#16213e',
    surface: '#0f3460',
    surfaceLight: '#1a4a7a',
    primary: '#6366f1',
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',
    correct: '#84cc16',
    incorrect: '#f87171',
    textPrimary: '#ffffff',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',
  },
  ocean: {
    background: '#0a1628',
    backgroundLight: '#0d2137',
    surface: '#0c3547',
    surfaceLight: '#115566',
    primary: '#22d3ee',
    primaryLight: '#67e8f9',
    primaryDark: '#06b6d4',
    correct: '#84cc16',
    incorrect: '#f87171',
    textPrimary: '#f0f9ff',
    textSecondary: '#bae6fd',
    textMuted: '#7dd3fc',
  },
  forest: {
    background: '#0f1a0f',
    backgroundLight: '#1a2e1a',
    surface: '#1e3a1e',
    surfaceLight: '#2d5a2d',
    primary: '#4ade80',
    primaryLight: '#86efac',
    primaryDark: '#22c55e',
    correct: '#84cc16',
    incorrect: '#f87171',
    textPrimary: '#f0fdf4',
    textSecondary: '#bbf7d0',
    textMuted: '#6ee7b7',
  },
  sunset: {
    background: '#1a0f0a',
    backgroundLight: '#2e1a10',
    surface: '#3d2214',
    surfaceLight: '#5c3520',
    primary: '#fb923c',
    primaryLight: '#fdba74',
    primaryDark: '#f97316',
    correct: '#84cc16',
    incorrect: '#f87171',
    textPrimary: '#fff7ed',
    textSecondary: '#fed7aa',
    textMuted: '#fdba74',
  },
  space: {
    background: '#0f0a1a',
    backgroundLight: '#1a1030',
    surface: '#2a1a4a',
    surfaceLight: '#3d2a6a',
    primary: '#a78bfa',
    primaryLight: '#c4b5fd',
    primaryDark: '#8b5cf6',
    correct: '#84cc16',
    incorrect: '#f87171',
    textPrimary: '#f5f3ff',
    textSecondary: '#ddd6fe',
    textMuted: '#a78bfa',
  },
};
