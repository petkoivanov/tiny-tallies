/**
 * Grid layout sub-component for Counters in array mode.
 *
 * Renders counters in a row x column grid pattern for multiplication
 * visualization. Each counter sits at a computed grid intersection.
 * Tap to flip color; no dragging in grid mode.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { useTheme, spacing } from '@/theme';
import {
  COUNTER_COLORS,
  COUNTER_BORDER_COLORS,
  COUNTER_SIZE,
  type CounterState,
} from './CountersTypes';

// ---- Grid position computation ----

interface GridConfig {
  /** Number of rows in the grid. */
  rows: number;
  /** Number of columns in the grid. */
  cols: number;
  /** Size of each grid cell (counter + spacing). */
  cellSize: number;
  /** X origin offset. */
  originX: number;
  /** Y origin offset. */
  originY: number;
}

/**
 * Compute absolute (x, y) positions for each cell in a row x column grid.
 * Iterates row-first for visual array layout.
 */
export function computeGridPositions(
  config: GridConfig,
): { x: number; y: number }[] {
  const { rows, cols, cellSize, originX, originY } = config;
  const positions: { x: number; y: number }[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      positions.push({
        x: originX + col * cellSize,
        y: originY + row * cellSize,
      });
    }
  }

  return positions;
}

// ---- CountersGrid component ----

interface CountersGridProps {
  /** Counters to render at grid positions. */
  counters: CounterState[];
  /** Number of grid rows. */
  rows: number;
  /** Number of grid columns. */
  cols: number;
  /** Callback when a counter is tapped (to flip color). */
  onFlip: (id: string) => void;
}

/**
 * Renders counters arranged in a rows x cols grid layout.
 *
 * Each counter is a Pressable circle (tap to flip, no drag in grid mode).
 * Row and column labels along edges provide pedagogical clarity.
 * Grid lines rendered behind counters for visual structure.
 */
export function CountersGrid({
  counters,
  rows,
  cols,
  onFlip,
}: CountersGridProps) {
  const { colors } = useTheme();
  const dynamicStyles = React.useMemo(() => StyleSheet.create({
    labelText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    totalText: {
      marginTop: spacing.sm,
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
  }), [colors]);

  const cellSize = COUNTER_SIZE + 8; // counter + gap

  return (
    <View style={styles.container} testID="counters-grid">
      {/* Column labels */}
      <View style={styles.colLabelsRow}>
        <View style={styles.labelCorner} />
        {Array.from({ length: cols }, (_, c) => (
          <View key={`col-label-${c}`} style={[styles.colLabel, { width: cellSize }]}>
            <Text style={dynamicStyles.labelText}>{c + 1}</Text>
          </View>
        ))}
      </View>

      {/* Grid rows */}
      {Array.from({ length: rows }, (_, r) => (
        <View key={`grid-row-${r}`} style={styles.gridRow}>
          {/* Row label */}
          <View style={styles.rowLabel}>
            <Text style={dynamicStyles.labelText}>{r + 1}</Text>
          </View>

          {/* Grid cells for this row */}
          {Array.from({ length: cols }, (_, c) => {
            const idx = r * cols + c;
            const counter = counters[idx];

            return (
              <View
                key={`cell-${r}-${c}`}
                style={[styles.gridCell, { width: cellSize, height: cellSize }]}
              >
                {counter ? (
                  <Pressable
                    onPress={() => onFlip(counter.id)}
                    testID={`grid-counter-${counter.id}`}
                    accessibilityLabel={`${counter.color} counter at row ${r + 1}, column ${c + 1}`}
                    accessibilityRole="button"
                    style={[
                      styles.gridCounter,
                      {
                        backgroundColor: COUNTER_COLORS[counter.color],
                        borderColor: COUNTER_BORDER_COLORS[counter.color],
                      },
                    ]}
                  />
                ) : (
                  <View style={styles.emptyCell} />
                )}
              </View>
            );
          })}
        </View>
      ))}

      {/* Total label */}
      <Text style={dynamicStyles.totalText}>
        {rows} x {cols} = {rows * cols}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  colLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  labelCorner: {
    width: 24,
  },
  colLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gridCounter: {
    width: COUNTER_SIZE,
    height: COUNTER_SIZE,
    borderRadius: COUNTER_SIZE / 2,
    borderWidth: 2,
  },
  emptyCell: {
    width: COUNTER_SIZE,
    height: COUNTER_SIZE,
    borderRadius: COUNTER_SIZE / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'dashed',
  },
});
