import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, spacing, typography } from '@/theme';
import { getBadgeById } from '@/services/achievement';
import { BadgeIcon } from './BadgeIcon';
import { BADGE_EMOJIS } from './badgeEmojis';

interface BadgesSummaryProps {
  badgeIds: string[];
  /** Total badges earned this session (may exceed badgeIds.length) */
  totalEarned?: number;
  onViewAll: () => void;
}

/**
 * Badges section for the Results stats card.
 *
 * Shows earned badges with emoji + name, plus a "View All Badges" link.
 * Returns null when no badges earned (non-punitive design).
 */
export function BadgesSummary({ badgeIds, totalEarned = 0, onViewAll }: BadgesSummaryProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    divider: {
      height: 1,
      backgroundColor: colors.surfaceLight,
    },
    header: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    badgeName: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      color: colors.textPrimary,
    },
    moreText: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      paddingTop: spacing.xs,
    },
    viewAllButton: {
      paddingVertical: spacing.md,
    },
    viewAllText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: colors.primaryLight,
    },
  }), [colors]);

  if (badgeIds.length === 0) {
    return null;
  }

  return (
    <View testID="badges-summary">
      <View style={styles.divider} />
      <Text style={styles.header}>Badges Earned</Text>
      {badgeIds.map((badgeId) => {
        const badge = getBadgeById(badgeId);
        const emoji = BADGE_EMOJIS[badgeId] ?? '?';
        return (
          <View key={badgeId} style={styles.badgeRow}>
            <BadgeIcon emoji={emoji} earned={true} size={32} tier={badge?.tier} />
            <Text style={styles.badgeName}>{badge?.name ?? 'Badge'}</Text>
          </View>
        );
      })}
      {totalEarned > badgeIds.length && (
        <Text style={styles.moreText}>
          +{totalEarned - badgeIds.length} more in your collection!
        </Text>
      )}
      <Pressable onPress={onViewAll} style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>View All Badges</Text>
      </Pressable>
    </View>
  );
}
