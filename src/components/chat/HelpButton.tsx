import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { useTheme, layout, spacing } from '@/theme';

const LOTTIE_SIZE = 72;

interface HelpButtonProps {
  visible: boolean;
  onPress: () => void;
  pulsing: boolean;
}

export function HelpButton({ visible, onPress, pulsing }: HelpButtonProps) {
  const { colors } = useTheme();
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

  const styles = useMemo(() => StyleSheet.create({
    pressable: {
      position: 'absolute',
      bottom: spacing.lg,
      right: spacing.lg,
    },
    fab: {
      width: LOTTIE_SIZE,
      height: LOTTIE_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lottie: {
      width: LOTTIE_SIZE,
      height: LOTTIE_SIZE,
    },
  }), [colors]);

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
        <LottieView
          source={require('../../../assets/animations/math-teacher.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </Animated.View>
    </Pressable>
  );
}
