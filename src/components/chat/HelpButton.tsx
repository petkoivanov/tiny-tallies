import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { CircleHelp } from 'lucide-react-native';
import { colors, layout, spacing, typography } from '@/theme';

interface HelpButtonProps {
  visible: boolean;
  onPress: () => void;
  pulsing: boolean;
}

export function HelpButton({ visible, onPress, pulsing }: HelpButtonProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (pulsing) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 400 }),
          withTiming(1.0, { duration: 400 }),
        ),
        2,
        false,
      );
    } else {
      scale.value = withTiming(1.0, { duration: 200 });
    }
  }, [pulsing, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Pressable
      testID="help-button"
      accessibilityRole="button"
      accessibilityLabel="Help"
      onPress={onPress}
      style={styles.pressable}
    >
      <Animated.View style={[styles.fab, animatedStyle]}>
        <CircleHelp size={28} color={colors.textPrimary} />
        <Text style={styles.label}>Help</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
  },
  fab: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    backgroundColor: colors.primary,
    borderRadius: layout.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  label: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
});
