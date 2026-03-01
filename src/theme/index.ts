/**
 * Theme constants for Tiny Tallies.
 *
 * Single source of truth for colors, spacing, typography, and layout.
 * Deep navy backgrounds with bright accents for child-friendly dark theme.
 */

export const colors = {
  // Backgrounds
  background: '#1a1a2e',
  backgroundLight: '#16213e',
  surface: '#0f3460',
  surfaceLight: '#1a4a7a',

  // Primary
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',

  // Feedback
  correct: '#84cc16',
  incorrect: '#f87171',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#cbd5e1',
  textMuted: '#64748b',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  fontFamily: {
    regular: 'Lexend_400Regular',
    medium: 'Lexend_500Medium',
    semiBold: 'Lexend_600SemiBold',
    bold: 'Lexend_700Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    display: 48,
  },
} as const;

export const layout = {
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  /** Minimum 48dp touch target for ages 6-9 motor skills (UI-04). */
  minTouchTarget: 48,
} as const;
