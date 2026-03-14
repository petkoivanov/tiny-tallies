import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';

const AnimatedView = Animated.View;

interface AnimatedChallengeGlowProps {
  color: string;
  children: React.ReactNode;
}

/** Pulsing border glow on the daily challenge card to draw attention. */
export function AnimatedChallengeGlow({ color, children }: AnimatedChallengeGlowProps) {
  const reducedMotion = useReducedMotion();
  const borderOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (reducedMotion) return;
    borderOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [reducedMotion, borderOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: color,
    borderWidth: 2,
    borderRadius: 16,
    opacity: borderOpacity.value,
  }));

  return (
    <AnimatedView style={animatedStyle}>
      {children}
    </AnimatedView>
  );
}
