import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { RotateCcw, Undo2, Grid3X3, Move } from 'lucide-react-native';

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
  /** Callback for undo button. Button only renders when provided. */
  onUndo?: () => void;
  /** Enables/disables undo button visually. */
  canUndo?: boolean;
  /** Callback for grid/free toggle. Button only renders when provided. */
  onGridToggle?: () => void;
  /** Current grid mode state for icon switching. */
  isGridMode?: boolean;
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
  onUndo,
  canUndo,
  onGridToggle,
  isGridMode,
  renderCounter,
  children,
  testID,
}: ManipulativeShellProps) {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <View style={styles.buttonGroup}>
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

          {onUndo !== undefined && (
            <Pressable
              onPress={onUndo}
              hitSlop={HIT_SLOP}
              disabled={!canUndo}
              accessibilityLabel="Undo last action"
              accessibilityRole="button"
              testID="undo-button"
              style={styles.undoButton}
            >
              <Undo2
                size={ICON_SIZE}
                color={canUndo ? colors.textSecondary : colors.textMuted}
              />
            </Pressable>
          )}

          {onGridToggle !== undefined && (
            <Pressable
              onPress={onGridToggle}
              hitSlop={HIT_SLOP}
              accessibilityLabel={
                isGridMode ? 'Switch to free mode' : 'Switch to grid mode'
              }
              accessibilityRole="button"
              testID="grid-toggle-button"
              style={styles.gridToggleButton}
            >
              {isGridMode ? (
                <Move size={ICON_SIZE} color={colors.textSecondary} />
              ) : (
                <Grid3X3 size={ICON_SIZE} color={colors.textSecondary} />
              )}
            </Pressable>
          )}
        </View>

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
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  resetButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridToggleButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspace: {
    flex: 1,
  },
});
