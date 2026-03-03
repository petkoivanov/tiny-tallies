import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme';

const PARTICLE_COUNT = 24;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FALL_DURATION = 2500;

const CELEBRATION_COLORS = [
  colors.correct,
  colors.primaryLight,
  colors.primary,
  '#fbbf24', // amber
  '#f472b6', // pink
  '#34d399', // emerald
];

interface ParticleConfig {
  x: number;
  size: number;
  color: string;
  delay: number;
}

function generateParticleConfigs(): ParticleConfig[] {
  const configs: ParticleConfig[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    configs.push({
      x: Math.random() * SCREEN_WIDTH,
      size: 8 + Math.random() * 6,
      color: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length],
      delay: Math.random() * 800,
    });
  }
  return configs;
}

function Particle({ config }: { config: ParticleConfig }) {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      config.delay,
      withTiming(SCREEN_HEIGHT + 20, {
        duration: FALL_DURATION,
        easing: Easing.in(Easing.quad),
      }),
    );

    opacity.value = withDelay(
      config.delay + FALL_DURATION - 500,
      withTiming(0, { duration: 500 }),
    );

    rotation.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.linear }),
        -1,
      ),
    );
  }, [config.delay, opacity, rotation, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: config.x,
          width: config.size,
          height: config.size * 1.4,
          backgroundColor: config.color,
          borderRadius: config.size * 0.2,
        },
        animatedStyle,
      ]}
    />
  );
}

const particleConfigs = generateParticleConfigs();

export function ConfettiCelebration() {
  return (
    <View style={styles.container} pointerEvents="none" testID="confetti-overlay">
      {particleConfigs.map((config, index) => (
        <Particle key={index} config={config} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  particle: {
    position: 'absolute',
    top: 0,
  },
});
