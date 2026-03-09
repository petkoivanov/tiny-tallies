/**
 * Sub-components for the Counters manipulative.
 *
 * Extracted to keep Counters.tsx under 500 lines:
 * - DualCountDisplay: red/yellow counter display for ManipulativeShell header
 * - DimensionStepper: inline +/- stepper for grid row/column selection
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { useTheme, spacing } from '@/theme';
import {
  COUNTER_COLORS,
  COUNTER_SIZE,
  GRID_COUNTER_SPACING,
  STAGGER_OFFSET,
  MAX_GRID_DIMENSION,
  type CounterState,
  type CounterColor,
} from './CountersTypes';
import { computeGridPositions } from './CountersGrid';

// ---- Custom dual-color counter display ----

interface DualCountDisplayProps {
  redCount: number;
  yellowCount: number;
}

export function DualCountDisplay({ redCount, yellowCount }: DualCountDisplayProps) {
  const { colors } = useTheme();
  const dynamicStyles = useMemo(() => StyleSheet.create({
    countText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    countSeparator: {
      fontSize: 20,
      fontWeight: '400',
      color: colors.textMuted,
    },
  }), [colors]);

  return (
    <View
      style={styles.dualCount}
      testID="dual-count"
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Red: ${redCount}, Yellow: ${yellowCount}`}
    >
      <View style={styles.countRow}>
        <View style={[styles.colorDot, { backgroundColor: COUNTER_COLORS.red }]} />
        <Text style={dynamicStyles.countText}>{redCount}</Text>
      </View>
      <Text style={dynamicStyles.countSeparator}>|</Text>
      <View style={styles.countRow}>
        <View style={[styles.colorDot, { backgroundColor: COUNTER_COLORS.yellow }]} />
        <Text style={dynamicStyles.countText}>{yellowCount}</Text>
      </View>
    </View>
  );
}

// ---- Grid dimension picker (inline stepper) ----

interface DimensionStepperProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  testID: string;
}

export function DimensionStepper({ label, value, onChange, testID }: DimensionStepperProps) {
  const { colors } = useTheme();
  const dynamicStyles = useMemo(() => StyleSheet.create({
    stepButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepButtonText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    stepValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      minWidth: 60,
      textAlign: 'center',
    },
  }), [colors]);

  return (
    <View style={styles.stepper} testID={testID}>
      <Pressable
        onPress={() => onChange(Math.max(1, value - 1))}
        style={dynamicStyles.stepButton}
        accessibilityLabel={`Decrease ${label}`}
        accessibilityRole="button"
        testID={`${testID}-minus`}
      >
        <Text style={dynamicStyles.stepButtonText}>-</Text>
      </Pressable>
      <Text style={dynamicStyles.stepValue} testID={`${testID}-value`}>
        {label}: {value}
      </Text>
      <Pressable
        onPress={() => onChange(Math.min(MAX_GRID_DIMENSION, value + 1))}
        style={dynamicStyles.stepButton}
        accessibilityLabel={`Increase ${label}`}
        accessibilityRole="button"
        testID={`${testID}-plus`}
      >
        <Text style={dynamicStyles.stepButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

// ---- Builder helpers (extracted from Counters.tsx for line count) ----

export function buildGridCounters(
  rows: number,
  cols: number,
  existing: CounterState[],
  nextIdRef: React.MutableRefObject<number>,
): CounterState[] {
  const cellSize = COUNTER_SIZE + GRID_COUNTER_SPACING;
  const positions = computeGridPositions({
    rows,
    cols,
    cellSize,
    originX: spacing.md,
    originY: spacing.md,
  });

  const total = rows * cols;
  const result: CounterState[] = [];

  for (let i = 0; i < total; i++) {
    if (i < existing.length) {
      result.push({ ...existing[i], x: positions[i].x, y: positions[i].y });
    } else {
      const id = `c-${nextIdRef.current++}`;
      result.push({ id, color: 'red' as CounterColor, x: positions[i].x, y: positions[i].y });
    }
  }

  return result;
}

export function buildScaffoldedCounters(
  count: number,
  color: CounterColor,
  nextIdRef: React.MutableRefObject<number>,
): CounterState[] {
  const counters: CounterState[] = [];
  const cols = 5;
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    counters.push({
      id: `c-${nextIdRef.current++}`,
      color,
      x: spacing.md + col * STAGGER_OFFSET,
      y: spacing.md + row * STAGGER_OFFSET,
    });
  }
  return counters;
}

const styles = StyleSheet.create({
  dualCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: 'rgba(90, 127, 255, 0.12)',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
