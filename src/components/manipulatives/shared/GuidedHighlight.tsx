/**
 * Pulsing glow animation wrapper for guided mode highlights.
 *
 * When active, renders a soft green pulsing glow around its children
 * to guide the child toward the next suggested action. Uses Reanimated
 * withRepeat on the UI thread for smooth 60fps animation.
 */

import React, { useEffect } from 'react';
import { Platform, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { GUIDED_GLOW_COLOR, PULSE_GLOW_CONFIG } from './animationConfig';

interface GuidedHighlightProps {
  /** Whether the glow animation is active. */
  active: boolean;
  /** Additional styles to apply to the container. */
  style?: ViewStyle;
  /** Content to wrap with the guided highlight. */
  children: React.ReactNode;
  /** Test ID for the highlight container. */
  testID?: string;
}

/**
 * Wraps children with a pulsing glow when active.
 * Uses shadow on iOS and border-color pulse on Android.
 */
export function GuidedHighlight({
  active,
  style,
  children,
  testID,
}: GuidedHighlightProps) {
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      glowOpacity.value = withRepeat(
        withTiming(1, {
          duration: PULSE_GLOW_CONFIG.duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [active, glowOpacity]);

  const glowStyle = useAnimatedStyle(() => {
    if (Platform.OS === 'ios') {
      return {
        shadowColor: GUIDED_GLOW_COLOR,
        shadowOpacity: glowOpacity.value * 0.8,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
      };
    }
    // Android: border-color pulse (elevation only supports gray)
    return {
      borderWidth: 2,
      borderColor: `rgba(74, 222, 128, ${glowOpacity.value * 0.4})`,
    };
  });

  return (
    <Animated.View
      style={[styles.container, active ? glowStyle : undefined, style]}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
  },
});
