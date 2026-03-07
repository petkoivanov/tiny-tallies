import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Lock, Check } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { THEMES } from '@/theme/colors';
import type { ThemeId, ThemeColors } from '@/theme/colors';
import { useAppStore } from '@/store/appStore';
import { THEME_COSMETICS } from '@/store/constants/themes';
import { isCosmeticUnlocked } from '@/store/constants/avatars';
import { CosmeticDetailOverlay } from '@/components/avatars/CosmeticDetailOverlay';

interface DetailItem {
  label: string;
  emoji: string;
  badgeId: string;
  itemType: 'avatar' | 'frame';
}

const SWATCH_SIZE = 16;

/** Mini preview card showing a theme's color palette. */
function ThemePreview({ themeColors }: { themeColors: ThemeColors }) {
  const previewStyles = useMemo(() => StyleSheet.create({
    container: {
      width: '100%',
      borderRadius: layout.borderRadius.lg,
      overflow: 'hidden',
      backgroundColor: themeColors.background,
      padding: spacing.md,
      gap: spacing.sm,
    },
    innerCard: {
      backgroundColor: themeColors.surface,
      borderRadius: layout.borderRadius.md,
      padding: spacing.sm,
      gap: spacing.xs,
    },
    accentBar: {
      height: 6,
      width: '40%',
      borderRadius: layout.borderRadius.sm,
      backgroundColor: themeColors.primary,
    },
    textPrimary: {
      color: themeColors.textPrimary,
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
    },
    textSecondary: {
      color: themeColors.textSecondary,
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
    },
  }), [themeColors]);

  return (
    <View testID="theme-preview" style={previewStyles.container}>
      <View style={previewStyles.innerCard}>
        <View style={previewStyles.accentBar} />
        <Text style={previewStyles.textPrimary}>Preview</Text>
        <Text style={previewStyles.textSecondary}>How it looks</Text>
      </View>
    </View>
  );
}

/** Color swatch dots for a theme. */
function ThemeSwatches({ themeColors }: { themeColors: ThemeColors }) {
  const dotColors = [
    themeColors.background,
    themeColors.surface,
    themeColors.primary,
    themeColors.textPrimary,
  ];

  return (
    <View style={swatchStyles.row}>
      {dotColors.map((color, i) => (
        <View
          key={i}
          style={[swatchStyles.dot, { backgroundColor: color }]}
        />
      ))}
    </View>
  );
}

const swatchStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});

export default function ThemePickerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();

  const currentThemeId = useAppStore((s) => s.themeId) ?? 'dark';
  const earnedBadges = useAppStore((s) => s.earnedBadges);
  const setChildProfile = useAppStore((s) => s.setChildProfile);

  const [previewThemeId, setPreviewThemeId] = useState<ThemeId>(currentThemeId as ThemeId);
  const [detailItem, setDetailItem] = useState<DetailItem | null>(null);

  const previewColors = THEMES[previewThemeId] ?? THEMES.dark;

  const handleEquip = (id: ThemeId) => {
    setChildProfile({ themeId: id });
    setPreviewThemeId(id);
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    backButton: {
      width: layout.minTouchTarget,
      height: layout.minTouchTarget,
      borderRadius: layout.borderRadius.round,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerText: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    title: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xl,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
    },
    previewSection: {
      paddingVertical: spacing.lg,
    },
    previewLabel: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    sectionHeader: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.lg,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    themeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: layout.borderRadius.md,
      backgroundColor: colors.surface,
      marginBottom: spacing.sm,
      gap: spacing.md,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    equippedCard: {
      borderColor: colors.primary,
    },
    emoji: {
      fontSize: 28,
    },
    cardContent: {
      flex: 1,
      gap: spacing.xs,
    },
    cardLabel: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
    },
    lockedCard: {
      opacity: 0.5,
    },
    lockContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  }), [colors]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          testID="back-button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={28} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Themes</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        {/* Live Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>Theme Preview</Text>
          <ThemePreview themeColors={previewColors} />
        </View>

        {/* Default Theme */}
        <Text style={styles.sectionHeader}>Default</Text>
        <Pressable
          testID="theme-card-dark"
          style={[
            styles.themeCard,
            currentThemeId === 'dark' && styles.equippedCard,
          ]}
          onPress={() => handleEquip('dark')}
        >
          <Text style={styles.emoji}>{'\uD83C\uDF11'}</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Default Dark</Text>
            <ThemeSwatches themeColors={THEMES.dark} />
          </View>
          {currentThemeId === 'dark' && (
            <View testID="equipped-indicator-dark" style={styles.checkContainer}>
              <Check size={20} color={colors.correct} strokeWidth={3} />
            </View>
          )}
        </Pressable>

        {/* Unlockable Themes */}
        <Text style={styles.sectionHeader}>Unlockable Themes</Text>
        {THEME_COSMETICS.map((theme) => {
          const unlocked = isCosmeticUnlocked(theme.badgeId, earnedBadges);
          const isEquipped = currentThemeId === theme.id;

          return (
            <Pressable
              key={theme.id}
              testID={unlocked ? `theme-card-${theme.id}` : 'locked-theme'}
              style={[
                styles.themeCard,
                isEquipped && styles.equippedCard,
                !unlocked && styles.lockedCard,
              ]}
              onPress={() => {
                if (unlocked) {
                  handleEquip(theme.id);
                } else {
                  setDetailItem({
                    label: theme.label,
                    emoji: theme.emoji,
                    badgeId: theme.badgeId,
                    itemType: 'avatar', // reuse overlay; itemType only affects label text
                  });
                }
              }}
            >
              <Text style={styles.emoji}>{theme.emoji}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>{theme.label}</Text>
                <ThemeSwatches themeColors={THEMES[theme.id]} />
              </View>
              {!unlocked && (
                <View style={styles.lockContainer}>
                  <Lock size={20} color={colors.textSecondary} />
                </View>
              )}
              {unlocked && isEquipped && (
                <View testID={`equipped-indicator-${theme.id}`} style={styles.checkContainer}>
                  <Check size={20} color={colors.correct} strokeWidth={3} />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Cosmetic Detail Overlay for locked themes */}
      <CosmeticDetailOverlay
        visible={detailItem !== null}
        onClose={() => setDetailItem(null)}
        itemLabel={detailItem?.label ?? ''}
        itemEmoji={detailItem?.emoji ?? ''}
        badgeId={detailItem?.badgeId ?? ''}
        itemType={detailItem?.itemType ?? 'avatar'}
      />
    </View>
  );
}
