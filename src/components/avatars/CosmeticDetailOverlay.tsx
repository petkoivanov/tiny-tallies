import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { getBadgeById } from '@/services/achievement';
import { BADGE_EMOJIS } from '@/components/badges';

export interface CosmeticDetailOverlayProps {
  visible: boolean;
  onClose: () => void;
  itemLabel: string;
  itemEmoji: string;
  badgeId: string;
  itemType: 'avatar' | 'frame';
}

/**
 * Bottom-sheet-style overlay showing badge requirement for a locked cosmetic item.
 * Uses centered modal pattern matching BadgeDetailOverlay from Phase 33.
 */
export function CosmeticDetailOverlay({
  visible,
  onClose,
  itemLabel,
  itemEmoji,
  badgeId,
  itemType,
}: CosmeticDetailOverlayProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: colors.background,
      borderRadius: layout.borderRadius.lg,
      borderWidth: 2,
      borderColor: colors.primary,
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
    itemEmoji: {
      fontSize: 64,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    itemLabel: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xl,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    typeLabel: {
      color: colors.textMuted,
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      textAlign: 'center',
    },
    divider: {
      width: '80%',
      height: 1,
      backgroundColor: colors.surfaceLight,
      marginVertical: spacing.md,
    },
    unlockHeader: {
      color: colors.textSecondary,
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      textAlign: 'center',
    },
    badgeInfo: {
      color: colors.primaryLight,
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.lg,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    progressHint: {
      color: colors.textMuted,
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
  }), [colors]);

  if (!visible) return null;

  const badge = getBadgeById(badgeId);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
      testID="cosmetic-detail-overlay"
    >
      <Pressable
        testID="cosmetic-overlay-backdrop"
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close details"
      >
        <View style={styles.card}>
          <Pressable
            testID="cosmetic-overlay-close"
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={styles.closeBtnText}>X</Text>
          </Pressable>

          <Text style={styles.itemEmoji}>{itemEmoji}</Text>
          <Text style={styles.itemLabel}>{itemLabel}</Text>
          <Text style={styles.typeLabel}>
            {itemType === 'avatar' ? 'Special Avatar' : 'Frame'}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.unlockHeader}>Unlock by earning:</Text>
          {badge && (
            <Text style={styles.badgeInfo}>
              {BADGE_EMOJIS[badgeId] ?? ''} {badge.name}
            </Text>
          )}
          <Text style={styles.progressHint}>
            Keep playing to earn this badge!
          </Text>
        </View>
      </Pressable>
    </Modal>
  );
}
