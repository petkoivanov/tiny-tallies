import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useAppStore } from '@/store/appStore';
import { BadgeGrid } from '@/components/badges/BadgeGrid';
import { BadgeDetailOverlay } from '@/components/badges/BadgeDetailOverlay';
import { BADGE_EMOJIS } from '@/components/badges/badgeEmojis';
import { BADGES } from '@/services/achievement/badgeRegistry';
import { useTheme, spacing, typography, layout } from '@/theme';
import type { BadgeDefinition } from '@/services/achievement/badgeTypes';

const TOTAL_BADGES = BADGES.length;

export default function BadgeCollectionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const earnedBadges = useAppStore((s) => s.earnedBadges);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(
    null,
  );

  const earnedCount = Object.keys(earnedBadges).length;

  const handleBadgePress = useCallback((badge: BadgeDefinition) => {
    setSelectedBadge(badge);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setSelectedBadge(null);
  }, []);

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
    subtitle: {
      color: colors.textSecondary,
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      marginTop: 2,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xxl,
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
          <Text style={styles.title}>Badge Collection</Text>
          <Text style={styles.subtitle}>
            {earnedCount} / {TOTAL_BADGES} earned
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BadgeGrid
          earnedBadges={earnedBadges}
          onBadgePress={handleBadgePress}
        />
      </ScrollView>

      <BadgeDetailOverlay
        badge={selectedBadge}
        earnedAt={
          selectedBadge
            ? (earnedBadges[selectedBadge.id]?.earnedAt ?? null)
            : null
        }
        emoji={selectedBadge ? (BADGE_EMOJIS[selectedBadge.id] ?? '?') : ''}
        onClose={handleCloseOverlay}
      />
    </View>
  );
}
