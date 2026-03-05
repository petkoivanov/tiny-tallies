import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme, spacing, typography, layout } from '@/theme';
import { getBadgeById } from '@/services/achievement';
import { BadgeIcon, BADGE_EMOJIS } from '@/components/badges';
import { getCosmeticUnlockText } from '@/store/constants/avatars';

interface BadgeUnlockPopupProps {
  badgeIds: string[];
  onComplete: () => void;
}

const ENTRANCE_DELAY = 400;
const GLOW_SIZE = 120;

/**
 * Full-screen badge celebration overlay with sequential display.
 *
 * Shows each earned badge one at a time with a scale-up + glow animation.
 * Tap to advance through badges, then closes via onComplete.
 */
export function BadgeUnlockPopup({ badgeIds, onComplete }: BadgeUnlockPopupProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    card: {
      alignItems: 'center',
      padding: spacing.xxl,
      gap: spacing.md,
      zIndex: 1,
    },
    glow: {
      position: 'absolute',
      top: spacing.xxl - 12,
      width: GLOW_SIZE,
      height: GLOW_SIZE,
      borderRadius: layout.borderRadius.round,
      backgroundColor: colors.primaryLight,
    },
    badgeName: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.display,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    badgeDescription: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 260,
    },
    cosmeticText: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
      color: '#ffd700',
      textAlign: 'center',
      maxWidth: 260,
    },
    hintText: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      position: 'absolute',
      bottom: 80,
      zIndex: 1,
    },
  }), [colors]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const backdropOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  const triggerEntrance = useCallback(() => {
    backdropOpacity.value = withDelay(
      ENTRANCE_DELAY,
      withTiming(1, { duration: 200 }),
    );
    badgeScale.value = withDelay(
      ENTRANCE_DELAY,
      withSequence(
        withSpring(1.15, { damping: 6, stiffness: 200 }),
        withSpring(1.0, { damping: 10 }),
      ),
    );
    glowOpacity.value = withDelay(
      ENTRANCE_DELAY,
      withSequence(
        withTiming(0.6, { duration: 300 }),
        withTiming(0.3, { duration: 400 }),
      ),
    );
  }, [backdropOpacity, badgeScale, glowOpacity]);

  useEffect(() => {
    if (badgeIds.length > 0) {
      triggerEntrance();
    }
  }, [badgeIds.length, triggerEntrance]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (badgeIds.length === 0) {
    return null;
  }

  const currentBadgeId = badgeIds[currentIndex];
  const badge = getBadgeById(currentBadgeId);
  const emoji = BADGE_EMOJIS[currentBadgeId] ?? '?';
  const cosmeticText = getCosmeticUnlockText(currentBadgeId);

  const handleTap = () => {
    if (currentIndex >= badgeIds.length - 1) {
      onComplete();
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      // Reset and re-trigger animation
      badgeScale.value = 0;
      glowOpacity.value = 0;
      triggerEntrance();
    }
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="auto">
      <Pressable
        testID="badge-popup-overlay"
        style={styles.overlay}
        onPress={handleTap}
      >
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Glow effect behind badge */}
          <Animated.View style={[styles.glow, glowStyle]} />
          <BadgeIcon
            emoji={emoji}
            earned={true}
            size={96}
            tier={badge?.tier}
          />
          <Text style={styles.badgeName}>{badge?.name ?? 'Badge'}</Text>
          <Text style={styles.badgeDescription}>
            {badge?.description ?? ''}
          </Text>
          {cosmeticText && (
            <Text testID="cosmetic-unlock-text" style={styles.cosmeticText}>
              {cosmeticText}
            </Text>
          )}
        </Animated.View>
        <Text style={styles.hintText}>Tap to continue</Text>
      </Pressable>
    </View>
  );
}
