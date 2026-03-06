/**
 * Sub-components for the BarModel manipulative.
 *
 * PresetButton: Partition count selection button with visual preview.
 * DividerHandle: Draggable divider between adjacent bar sections.
 * SectionView: Individual bar section with tap-to-label behavior.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import { triggerSnapHaptic } from '../shared/haptics';
import { SNAP_SPRING_CONFIG } from '../shared/animationConfig';
import { useTheme, spacing, layout, typography } from '../../../theme';
import {
  type SectionState,
  type PartitionCount,
  BAR_PRIMARY,
  BAR_FILL,
  BAR_BORDER,
  BAR_DIVIDER,
  BAR_UNKNOWN,
  DIVIDER_WIDTH,
} from './BarModelTypes';

// --- Partition Preset Button ---

interface PresetButtonProps {
  count: PartitionCount;
  onSelect: (count: PartitionCount) => void;
}

export function PresetButton({ count, onSelect }: PresetButtonProps) {
  const { colors } = useTheme();
  const dynamicStyles = useMemo(() => StyleSheet.create({
    presetButton: {
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: layout.borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: BAR_BORDER,
      minWidth: 90,
      minHeight: layout.minTouchTarget,
    },
    presetLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.textPrimary,
    },
  }), [colors]);

  const handlePress = useCallback(() => {
    onSelect(count);
  }, [count, onSelect]);

  return (
    <Pressable
      style={dynamicStyles.presetButton}
      onPress={handlePress}
      accessibilityLabel={`${count} equal parts`}
      accessibilityRole="button"
    >
      <View style={styles.presetPreview}>
        {Array.from({ length: count }, (_, i) => (
          <View
            key={i}
            style={[
              styles.presetSection,
              i < count - 1 && styles.presetSectionBorder,
            ]}
          />
        ))}
      </View>
      <Text style={dynamicStyles.presetLabel}>{count} parts</Text>
    </Pressable>
  );
}

// --- Divider Handle ---

interface DividerProps {
  index: number;
  barWidth: number;
  leftFraction: number;
  cumulativeLeft: number;
  onDividerMove: (index: number, newCumulativePosition: number) => void;
  onDividerEnd: () => void;
}

export function DividerHandle({
  index,
  barWidth,
  leftFraction,
  cumulativeLeft,
  onDividerMove,
  onDividerEnd,
}: DividerProps) {
  const offsetX = useSharedValue(0);
  const basePosition = cumulativeLeft + leftFraction;

  const gesture = Gesture.Pan()
    .minDistance(8)
    .onChange((event) => {
      'worklet';
      offsetX.value = event.translationX;
      const newPosition = basePosition + event.translationX / barWidth;
      runOnJS(onDividerMove)(index, newPosition);
    })
    .onEnd(() => {
      'worklet';
      offsetX.value = withSpring(0, SNAP_SPRING_CONFIG);
      runOnJS(onDividerEnd)();
      runOnJS(triggerSnapHaptic)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
  }));

  const positionLeft =
    (cumulativeLeft + leftFraction) * barWidth - DIVIDER_WIDTH / 2;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.dividerTouchArea,
          { left: positionLeft },
          animatedStyle,
        ]}
        accessibilityLabel={`Resize divider between section ${index + 1} and ${index + 2}`}
        accessibilityRole="adjustable"
      >
        <View style={styles.dividerLine} />
        <View style={styles.dividerKnob} />
      </Animated.View>
    </GestureDetector>
  );
}

// --- Section View ---

interface SectionViewProps {
  section: SectionState;
  sectionIndex: number;
  barWidth: number;
  onTap: (sectionId: string) => void;
}

export function SectionView({
  section,
  sectionIndex,
  barWidth,
  onTap,
}: SectionViewProps) {
  const { colors } = useTheme();
  const dynamicStyles = useMemo(() => StyleSheet.create({
    sectionLabel: {
      fontSize: typography.fontSize.xl,
      fontWeight: '700',
      color: colors.textPrimary,
    },
  }), [colors]);

  const width = section.widthFraction * barWidth;

  const handlePress = useCallback(() => {
    onTap(section.id);
  }, [section.id, onTap]);

  const labelText = section.isUnknown
    ? '?'
    : section.label !== null
      ? `${section.label}`
      : '';

  const accessibilityText = `Section ${sectionIndex + 1}, ${
    section.isUnknown
      ? 'unknown'
      : section.label !== null
        ? `${section.label}`
        : 'empty'
  }`;

  return (
    <Pressable
      style={[
        styles.section,
        {
          width,
          backgroundColor: section.isUnknown
            ? 'rgba(245, 158, 11, 0.3)'
            : BAR_FILL,
        },
      ]}
      onPress={handlePress}
      accessibilityLabel={accessibilityText}
      accessibilityRole="button"
    >
      <Text
        style={[
          dynamicStyles.sectionLabel,
          section.isUnknown && styles.sectionLabelUnknown,
        ]}
      >
        {labelText}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // --- Preset Button ---
  presetPreview: {
    flexDirection: 'row',
    width: 60,
    height: 32,
    borderRadius: layout.borderRadius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BAR_PRIMARY,
    marginBottom: spacing.sm,
  },
  presetSection: {
    flex: 1,
    backgroundColor: BAR_FILL,
  },
  presetSectionBorder: {
    borderRightWidth: 1,
    borderRightColor: BAR_PRIMARY,
  },
  // --- Divider ---
  dividerTouchArea: {
    position: 'absolute',
    top: 0,
    width: DIVIDER_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  dividerLine: {
    width: 3,
    height: '100%',
    backgroundColor: BAR_DIVIDER,
    position: 'absolute',
  },
  dividerKnob: {
    width: 16,
    height: 24,
    borderRadius: 8,
    backgroundColor: BAR_DIVIDER,
    opacity: 0.9,
  },

  // --- Section ---
  section: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  sectionLabelUnknown: {
    color: BAR_UNKNOWN,
    fontSize: typography.fontSize.xxl,
  },
});
