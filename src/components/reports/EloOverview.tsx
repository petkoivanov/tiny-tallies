/**
 * EloOverview — displays Elo rating, current level, and level progress bar.
 *
 * Used in ParentReportsScreen to give parents a quick view of their
 * child's overall difficulty level.
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import {
  eloToLevel,
  levelProgress,
} from '@/services/adaptive/levelMapping';

interface EloOverviewProps {
  eloRating: number;
}

export function EloOverview({ eloRating }: EloOverviewProps) {
  const { colors } = useTheme();
  const level = eloToLevel(eloRating);
  const progress = levelProgress(eloRating);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.surface,
          borderRadius: layout.borderRadius.lg,
          padding: spacing.lg,
          gap: spacing.md,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        },
        title: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.lg,
          color: colors.textPrimary,
        },
        statsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        statBlock: {
          alignItems: 'center',
        },
        statValue: {
          fontFamily: typography.fontFamily.bold,
          fontSize: typography.fontSize.xxl,
          color: colors.primary,
        },
        statLabel: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.textMuted,
        },
        progressContainer: {
          gap: spacing.xs,
        },
        progressLabel: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
        },
        progressBarBackground: {
          height: 10,
          backgroundColor: colors.backgroundLight,
          borderRadius: layout.borderRadius.round,
          overflow: 'hidden',
        },
        progressBarFill: {
          height: '100%',
          backgroundColor: colors.primary,
          borderRadius: layout.borderRadius.round,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.card} testID="elo-overview">
      <View style={styles.header}>
        <TrendingUp size={20} color={colors.primary} />
        <Text style={styles.title}>Difficulty Level</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{Math.round(eloRating)}</Text>
          <Text style={styles.statLabel}>Elo Rating</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>
          Progress to Level {level < 10 ? level + 1 : 'Max'}
        </Text>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.round(progress * 100)}%` },
            ]}
            testID="elo-progress-bar"
          />
        </View>
      </View>
    </View>
  );
}
