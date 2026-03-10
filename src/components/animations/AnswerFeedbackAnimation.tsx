import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { springConfigs, durations } from '@/theme';

interface AnswerFeedbackAnimationProps {
  feedbackType: 'correct' | 'incorrect' | null;
  children: React.ReactNode;
}

/**
 * Wraps answer buttons to provide animated feedback.
 * - Correct: satisfying spring bounce (scale 1.0 -> 1.1 -> 1.0)
 * - Incorrect: gentle horizontal shake (~250ms)
 */
export function AnswerFeedbackAnimation({
  feedbackType,
  children,
}: AnswerFeedbackAnimationProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (feedbackType === 'correct') {
      scale.value = withSequence(
        withSpring(1.1, springConfigs.bounce),
        withSpring(1.0, springConfigs.settle),
      );
    } else if (feedbackType === 'incorrect') {
      translateX.value = withSequence(
        withTiming(-6, { duration: durations.quick }),
        withTiming(6, { duration: durations.quick }),
        withTiming(-4, { duration: durations.quick }),
        withTiming(4, { duration: durations.quick }),
        withTiming(0, { duration: durations.quick }),
      );
    } else {
      // Reset when feedback clears
      scale.value = 1;
      translateX.value = 0;
    }
  }, [feedbackType, scale, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '45%',
    minWidth: 140,
  },
});
