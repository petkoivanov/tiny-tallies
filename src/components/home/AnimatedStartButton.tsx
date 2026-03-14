import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import type { ThemeColors } from '@/theme';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const startButtonAnim = require('../../../assets/animations/start-button.json');

interface AnimatedStartButtonProps {
  onPress: () => void;
  disabled?: boolean;
  colors: ThemeColors;
}

export function AnimatedStartButton({
  onPress,
  disabled,
  colors,
}: AnimatedStartButtonProps) {
  const lottieRef = useRef<LottieView>(null);

  const handlePressIn = useCallback(() => {
    lottieRef.current?.play(0, 15);
  }, []);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      disabled={disabled}
      style={[styles.container, disabled && styles.disabled]}
      accessibilityRole="button"
      accessibilityLabel="Start Practice"
      testID="start-practice-button"
    >
      <LottieView
        ref={lottieRef}
        source={startButtonAnim}
        style={styles.lottie}
        autoPlay
        loop
        speed={1}
        colorFilters={[
          { keypath: 'Shape Layer 1', color: colors.primary },
          { keypath: 'Shape Layer 2', color: colors.primary },
          { keypath: 'Start Trial', color: colors.surface },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
