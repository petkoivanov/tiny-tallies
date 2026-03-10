import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { eloToLevel } from '@/services/adaptive/levelMapping';
import { useTheme, spacing, typography, layout } from '@/theme';

interface LevelBadgeProps {
  elo: number;
}

export function LevelBadge({ elo }: LevelBadgeProps) {
  const { colors } = useTheme();
  const level = eloToLevel(elo);

  return (
    <View
      testID="level-badge"
      style={[styles.badge, { backgroundColor: colors.surface }]}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Level
      </Text>
      <Text style={[styles.level, { color: colors.primaryLight }]}>
        {level}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: layout.borderRadius.round,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
  },
  level: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.md,
  },
});
