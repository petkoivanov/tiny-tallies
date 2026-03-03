/**
 * Sub-components for the Counters manipulative.
 *
 * Extracted to keep Counters.tsx under 500 lines:
 * - DualCountDisplay: red/yellow counter display for ManipulativeShell header
 * - DimensionStepper: inline +/- stepper for grid row/column selection
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { colors, spacing } from '@/theme';
import { COUNTER_COLORS, MAX_GRID_DIMENSION } from './CountersTypes';

// ---- Custom dual-color counter display ----

interface DualCountDisplayProps {
  redCount: number;
  yellowCount: number;
}

export function DualCountDisplay({ redCount, yellowCount }: DualCountDisplayProps) {
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
        <Text style={styles.countText}>{redCount}</Text>
      </View>
      <Text style={styles.countSeparator}>|</Text>
      <View style={styles.countRow}>
        <View style={[styles.colorDot, { backgroundColor: COUNTER_COLORS.yellow }]} />
        <Text style={styles.countText}>{yellowCount}</Text>
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
  return (
    <View style={styles.stepper} testID={testID}>
      <Pressable
        onPress={() => onChange(Math.max(1, value - 1))}
        style={styles.stepButton}
        accessibilityLabel={`Decrease ${label}`}
        accessibilityRole="button"
        testID={`${testID}-minus`}
      >
        <Text style={styles.stepButtonText}>-</Text>
      </Pressable>
      <Text style={styles.stepValue} testID={`${testID}-value`}>
        {label}: {value}
      </Text>
      <Pressable
        onPress={() => onChange(Math.min(MAX_GRID_DIMENSION, value + 1))}
        style={styles.stepButton}
        accessibilityLabel={`Increase ${label}`}
        accessibilityRole="button"
        testID={`${testID}-plus`}
      >
        <Text style={styles.stepButtonText}>+</Text>
      </Pressable>
    </View>
  );
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
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
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
});
