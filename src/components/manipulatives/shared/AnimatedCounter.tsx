import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import type { AnimatedCounterProps } from './types';

/**
 * Displays a numeric value with an animated pop transition on change.
 *
 * The value prop is a regular number (not SharedValue) that updates only
 * when a drop event occurs -- not during drag. This means React re-render
 * frequency is low and acceptable.
 *
 * On value change (after initial render), triggers a scale pop animation:
 * scale 1 -> 1.15 (100ms) -> 1 (150ms) for playful visual feedback.
 */
export function AnimatedCounter({ value, label, style }: AnimatedCounterProps) {
  const scale = useSharedValue(1);
  const isInitialRender = useRef(true);

  // Trigger pop animation on value change (skip initial render)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    scale.value = withSequence(
      withTiming(1.15, { duration: 100 }),
      withTiming(1, { duration: 150 }),
    );
  }, [value, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const accessibilityText = label
    ? `${label}: ${value}`
    : `Count: ${value}`;

  return (
    <Animated.View
      testID="animated-counter"
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityText}
      style={[styles.container, style, animatedStyle]}
    >
      <Text style={styles.value}>{value}</Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(90, 127, 255, 0.12)',
    minWidth: 48,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 2,
  },
});
