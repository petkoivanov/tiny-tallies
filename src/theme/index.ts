/**
 * Theme system for Tiny Tallies.
 *
 * ThemeProvider delivers dynamic colors via React Context.
 * Static spacing, typography, and layout constants remain unchanged.
 */
import React, { createContext, useContext } from 'react';

import { useAppStore } from '@/store/appStore';

import { THEMES } from './colors';
import type { ThemeColors, ThemeId } from './colors';

export { THEMES } from './colors';
export type { ThemeColors, ThemeId } from './colors';
export { springConfigs, durations } from './animations';

const ThemeContext = createContext<ThemeColors>(THEMES.dark);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useAppStore((s) => s.themeId) ?? 'dark';
  const colors = THEMES[themeId as ThemeId] ?? THEMES.dark;
  return React.createElement(ThemeContext.Provider, { value: colors }, children);
}

export function useTheme(): { colors: ThemeColors } {
  return { colors: useContext(ThemeContext) };
}

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
