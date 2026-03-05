import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme';

export interface AvatarCircleProps {
  emoji: string;
  size: number;
  frameColor?: string;
  isSpecial?: boolean;
  onPress?: () => void;
}

const SPARKLE_CHAR = '\u2728';

export function AvatarCircle({
  emoji,
  size,
  frameColor,
  isSpecial,
  onPress,
}: AvatarCircleProps) {
  const rotation = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0.4);

  React.useEffect(() => {
    if (isSpecial) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 4000, easing: Easing.linear }),
        -1,
        false,
      );
      sparkleOpacity.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 1000 }),
          withTiming(0.4, { duration: 1000 }),
        ),
        -1,
        false,
      );
    }
  }, [isSpecial, rotation, sparkleOpacity]);

  const sparkleRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const sparkleOpacityStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  const circleStyle = [
    styles.circle,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    frameColor
      ? { borderWidth: 3, borderColor: frameColor }
      : undefined,
  ];

  const emojiSize = size * 0.5;
  const sparkleOffset = size * 0.05;
  const sparkleSize = 14;

  const content = (
    <View style={styles.wrapper} testID="avatar-circle">
      {isSpecial && (
        <Animated.View
          style={[
            styles.sparkleContainer,
            { width: size + 16, height: size + 16 },
            sparkleRotationStyle,
          ]}
          testID="sparkle-container"
        >
          <Animated.View style={sparkleOpacityStyle}>
            <Text
              style={[
                styles.sparkle,
                { top: -sparkleOffset, left: size / 2 - sparkleSize / 2 + 8 },
              ]}
            >
              {SPARKLE_CHAR}
            </Text>
            <Text
              style={[
                styles.sparkle,
                { top: size / 2 - sparkleSize / 2 + 8, right: -sparkleOffset },
              ]}
            >
              {SPARKLE_CHAR}
            </Text>
            <Text
              style={[
                styles.sparkle,
                { bottom: -sparkleOffset, left: size / 2 - sparkleSize / 2 + 8 },
              ]}
            >
              {SPARKLE_CHAR}
            </Text>
            <Text
              style={[
                styles.sparkle,
                { top: size / 2 - sparkleSize / 2 + 8, left: -sparkleOffset },
              ]}
            >
              {SPARKLE_CHAR}
            </Text>
          </Animated.View>
        </Animated.View>
      )}
      <View style={circleStyle}>
        <Text style={[styles.emoji, { fontSize: emojiSize }]}>{emoji}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.touchTarget, { minWidth: Math.max(size, 48), minHeight: Math.max(size, 48) }]}
        accessibilityRole="button"
        accessibilityLabel="Avatar"
        testID="avatar-pressable"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchTarget: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
  sparkleContainer: {
    position: 'absolute',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 14,
  },
});
