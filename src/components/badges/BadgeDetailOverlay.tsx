import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { BadgeIcon } from './BadgeIcon';
import { useTheme, spacing, typography, layout } from '@/theme';
import type { BadgeDefinition, UnlockCondition } from '@/services/achievement/badgeTypes';

export interface BadgeDetailOverlayProps {
  badge: BadgeDefinition | null;
  earnedAt: string | null;
  emoji: string;
  onClose: () => void;
}

function getRequirementText(condition: UnlockCondition): string {
  switch (condition.type) {
    case 'skill-mastery': {
      const formatted = condition.skillId
        .replace(/\./g, ' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return `Master ${formatted}`;
    }
    case 'category-mastery':
      return `Master all ${condition.operation} skills`;
    case 'grade-mastery':
      return `Master all Grade ${condition.grade} skills`;
    case 'streak-milestone':
      return `Reach a ${condition.weeklyStreakRequired}-week streak`;
    case 'sessions-milestone':
      return `Complete ${condition.sessionsRequired} sessions`;
    case 'remediation-victory':
      return `Resolve ${condition.resolvedCountRequired} misconception${condition.resolvedCountRequired === 1 ? '' : 's'}`;
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BadgeDetailOverlay({
  badge,
  earnedAt,
  emoji,
  onClose,
}: BadgeDetailOverlayProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: layout.borderRadius.lg,
      padding: spacing.lg,
      alignItems: 'center',
      width: '80%',
      maxWidth: 320,
    },
    closeBtn: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      width: 32,
      height: 32,
      borderRadius: layout.borderRadius.round,
      backgroundColor: colors.surfaceLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeBtnText: {
      color: colors.textSecondary,
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.sm,
    },
    name: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xl,
      marginTop: spacing.md,
      textAlign: 'center',
    },
    description: {
      color: colors.textSecondary,
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    requirement: {
      color: colors.textMuted,
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    earnedDate: {
      color: colors.primaryLight,
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
      marginTop: spacing.md,
      textAlign: 'center',
    },
  }), [colors]);

  if (!badge) return null;

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        testID="overlay-backdrop"
        style={styles.backdrop}
        onPress={onClose}
      >
        <Pressable style={styles.card} onPress={() => {}}>
          <Pressable testID="overlay-close" style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>X</Text>
          </Pressable>

          <BadgeIcon
            emoji={emoji}
            earned={!!earnedAt}
            size={96}
            tier={badge.tier}
          />

          <Text style={styles.name}>{badge.name}</Text>
          <Text style={styles.description}>{badge.description}</Text>
          <Text style={styles.requirement}>
            {getRequirementText(badge.condition)}
          </Text>

          <Text style={styles.earnedDate}>
            {earnedAt ? `Earned: ${formatDate(earnedAt)}` : 'Not yet earned'}
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
