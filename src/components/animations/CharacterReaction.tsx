/**
 * CharacterReaction — shows the selected avatar with animated reactions.
 *
 * Displays the avatar emoji with contextual expressions:
 * - correct: bounce + sparkle text
 * - incorrect: gentle wobble + encouraging text
 * - streak: extra celebration animation
 * - idle: gentle floating animation
 *
 * Uses react-native-reanimated for smooth 60fps animations.
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useTheme, spacing, typography } from '@/theme';
import { resolveAvatar } from '@/store/constants/avatars';

export type ReactionType = 'correct' | 'incorrect' | 'streak' | 'idle' | null;

interface CharacterReactionProps {
  /** Avatar ID to display */
  avatarId: string | null;
  /** Current reaction to show */
  reaction: ReactionType;
  /** Key to trigger new animation (e.g., problem index) */
  resetKey?: number;
  testID?: string;
}

const CORRECT_MESSAGES = [
  'Great job!',
  'You got it!',
  'Awesome!',
  'Nice work!',
  'Super!',
  'Perfect!',
];

const INCORRECT_MESSAGES = [
  'Try again!',
  'Almost!',
  'Keep going!',
  'You can do it!',
  "Don't give up!",
];

const STREAK_MESSAGES = [
  'On fire!',
  'Unstoppable!',
  'Amazing streak!',
  'Math star!',
];

function pickMessage(messages: string[], key: number): string {
  return messages[key % messages.length];
}

export function CharacterReaction({
  avatarId,
  reaction,
  resetKey = 0,
  testID,
}: CharacterReactionProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const messageOpacity = useSharedValue(0);

  const avatar = useMemo(
    () => resolveAvatar(avatarId ?? 'fox'),
    [avatarId],
  );

  useEffect(() => {
    // Reset
    scale.value = 1;
    translateY.value = 0;
    rotation.value = 0;
    messageOpacity.value = 0;

    if (reaction === 'correct') {
      scale.value = withSequence(
        withSpring(1.3, { damping: 4, stiffness: 300 }),
        withSpring(1.0, { damping: 8, stiffness: 200 }),
      );
      translateY.value = withSequence(
        withTiming(-12, { duration: 150 }),
        withSpring(0, { damping: 8 }),
      );
      messageOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 1200 }),
        withTiming(0, { duration: 400 }),
      );
    } else if (reaction === 'incorrect') {
      rotation.value = withSequence(
        withTiming(-0.05, { duration: 80 }),
        withTiming(0.05, { duration: 80 }),
        withTiming(-0.03, { duration: 80 }),
        withTiming(0.03, { duration: 80 }),
        withTiming(0, { duration: 80 }),
      );
      messageOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 1200 }),
        withTiming(0, { duration: 400 }),
      );
    } else if (reaction === 'streak') {
      scale.value = withSequence(
        withSpring(1.4, { damping: 3, stiffness: 400 }),
        withSpring(1.1, { damping: 6 }),
        withSpring(1.0, { damping: 10 }),
      );
      translateY.value = withSequence(
        withTiming(-20, { duration: 200 }),
        withSpring(0, { damping: 6 }),
      );
      messageOpacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 400 }),
      );
    } else if (reaction === 'idle') {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    }
  }, [reaction, resetKey, scale, translateY, rotation, messageOpacity]);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const message = useMemo(() => {
    if (reaction === 'correct') return pickMessage(CORRECT_MESSAGES, resetKey);
    if (reaction === 'incorrect') return pickMessage(INCORRECT_MESSAGES, resetKey);
    if (reaction === 'streak') return pickMessage(STREAK_MESSAGES, resetKey);
    return '';
  }, [reaction, resetKey]);

  const messageColor = reaction === 'correct' || reaction === 'streak'
    ? colors.primary
    : reaction === 'incorrect'
      ? colors.textSecondary
      : colors.textPrimary;

  return (
    <View style={styles.container} testID={testID}>
      <Animated.View style={avatarStyle}>
        <Text style={styles.emoji}>{avatar?.emoji ?? '🦊'}</Text>
      </Animated.View>
      {message !== '' && (
        <Animated.View style={[styles.messageWrap, messageStyle]}>
          <Text style={[styles.message, { color: messageColor }]}>
            {message}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  emoji: {
    fontSize: 48,
  },
  messageWrap: {
    marginTop: spacing.xs,
  },
  message: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
  },
});
