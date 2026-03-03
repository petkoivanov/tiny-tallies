import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, layout } from '@/theme';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';

interface ExploreCardProps {
  type: ManipulativeType;
  emoji: string;
  name: string;
  bgColor: string;
  isNew: boolean;
  onPress: () => void;
}

export function ExploreCard({
  emoji,
  name,
  bgColor,
  isNew,
  onPress,
}: ExploreCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: bgColor },
        pressed && { transform: [{ scale: 0.95 }] },
      ]}
      accessibilityLabel={name}
      accessibilityRole="button"
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.name}>{name}</Text>
      {isNew && <View testID="new-dot" style={styles.newDot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 36,
  },
  name: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  newDot: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 10,
    height: 10,
    borderRadius: layout.borderRadius.round,
    backgroundColor: colors.primaryLight,
  },
});
