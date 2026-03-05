import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, layout } from '@/theme';
import type { BadgeTier } from '@/services/achievement/badgeTypes';

const DEFAULT_SIZE = 64;

/** Tier-specific border colors for earned badges */
const TIER_BORDER_COLORS: Record<BadgeTier, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
};

export interface BadgeIconProps {
  emoji: string;
  earned: boolean;
  size?: number;
  tier?: BadgeTier;
}

/**
 * Reusable badge display component: emoji inside a styled circle.
 *
 * Matches the AVATARS avatarCircle pattern from HomeScreen.
 * When earned=false, applies dimmed opacity and neutral border.
 * When earned=true, full opacity with tier-colored border.
 */
export function BadgeIcon({ emoji, earned, size = DEFAULT_SIZE, tier }: BadgeIconProps) {
  const borderColor = earned
    ? (tier ? TIER_BORDER_COLORS[tier] : colors.primaryLight)
    : colors.surfaceLight;

  return (
    <View
      testID="badge-icon-container"
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: layout.borderRadius.round,
          borderColor,
          opacity: earned ? 1 : 0.4,
        },
      ]}
    >
      <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>
        {emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  emoji: {
    textAlign: 'center',
  },
});
