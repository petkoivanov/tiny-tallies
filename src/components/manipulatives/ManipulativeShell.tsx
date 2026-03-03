import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { RotateCcw } from 'lucide-react-native';

import { AnimatedCounter } from './shared';
import { colors, spacing } from '@/theme';

/**
 * Props for the ManipulativeShell wrapper.
 */
export interface ManipulativeShellProps {
  /** Current value for the AnimatedCounter display. */
  count: number;
  /** Optional label text below the counter. */
  countLabel?: string;
  /** Callback fired when the reset button is pressed. */
  onReset: () => void;
  /**
   * Optional custom counter renderer. When provided, replaces the default
   * AnimatedCounter — useful for dual-count displays (e.g. Counters red/yellow).
   */
  renderCounter?: () => React.ReactNode;
  /** The manipulative workspace content. */
  children: React.ReactNode;
  /** Test ID for the shell container. */
  testID?: string;
}

const HEADER_HEIGHT = 56;
const ICON_SIZE = 24;
const HIT_SLOP = 8;

/**
 * Shared wrapper for all 6 virtual manipulatives.
 *
 * Layout:
 * - Header bar (56dp): Reset button (top-left), AnimatedCounter (top-right)
 * - Workspace: fills remaining space below header, renders children
 *
 * Every manipulative renders inside this shell for consistent layout and
 * interaction patterns across the app.
 */
export function ManipulativeShell({
  count,
  countLabel,
  onReset,
  renderCounter,
  children,
  testID,
}: ManipulativeShellProps) {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Pressable
          onPress={onReset}
          hitSlop={HIT_SLOP}
          accessibilityLabel="Reset manipulative"
          accessibilityRole="button"
          testID="reset-button"
          style={styles.resetButton}
        >
          <RotateCcw size={ICON_SIZE} color={colors.textSecondary} />
        </Pressable>

        <View testID="counter-area">
          {renderCounter ? (
            renderCounter()
          ) : (
            <AnimatedCounter value={count} label={countLabel} />
          )}
        </View>
      </View>

      <View style={styles.workspace}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  resetButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspace: {
    flex: 1,
  },
});
