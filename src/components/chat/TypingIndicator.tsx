import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { layout, spacing } from '@/theme';

const TUTOR_BG = '#4338ca';
const DOT_SIZE = 8;
const BOUNCE_HEIGHT = -4;
const DURATION = 300;
const STAGGER = 150;

export function TypingIndicator() {
  const dot0 = useSharedValue(0);
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);

  useEffect(() => {
    const bounce = withRepeat(
      withSequence(
        withTiming(BOUNCE_HEIGHT, { duration: DURATION }),
        withTiming(0, { duration: DURATION }),
      ),
      -1,
      false,
    );
    dot0.value = bounce;
    dot1.value = withDelay(STAGGER, bounce);
    dot2.value = withDelay(STAGGER * 2, bounce);
  }, [dot0, dot1, dot2]);

  const style0 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot0.value }],
  }));
  const style1 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }));
  const style2 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }));

  return (
    <View testID="typing-indicator" style={styles.container}>
      <Animated.View testID="typing-dot-0" style={[styles.dot, style0]} />
      <Animated.View testID="typing-dot-1" style={[styles.dot, style1]} />
      <Animated.View testID="typing-dot-2" style={[styles.dot, style2]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TUTOR_BG,
    borderRadius: layout.borderRadius.lg,
    borderBottomLeftRadius: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    gap: spacing.xs,
    marginVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});
