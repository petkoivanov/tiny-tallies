import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { spacing, typography } from '@/theme';
import type { ThemeColors } from '@/theme/colors';

interface AnimatedXpBarProps {
  current: number;
  total: number;
  colors: ThemeColors;
}

/** XP progress bar that animates fill width on mount and value changes. */
export function AnimatedXpBar({ current, total, colors }: AnimatedXpBarProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const targetPercent = Math.min((current / total) * 100, 100);

  useEffect(() => {
    if (reducedMotion) {
      progress.value = targetPercent;
    } else {
      progress.value = withTiming(targetPercent, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [targetPercent, reducedMotion, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: colors.surface }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: colors.primary }, fillStyle]}
        />
      </View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {current}/{total} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
});
