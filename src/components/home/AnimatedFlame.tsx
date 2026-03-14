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
import { Flame } from 'lucide-react-native';

const AnimatedView = Animated.View;

interface AnimatedFlameProps {
  size: number;
  color: string;
}

/** Flickering flame icon with subtle scale + opacity loop. */
export function AnimatedFlame({ size, color }: AnimatedFlameProps) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) return;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 350, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 350, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 350, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 350, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [reducedMotion, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedView style={animatedStyle}>
      <Flame size={size} color={color} strokeWidth={2} />
    </AnimatedView>
  );
}
