import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';

import { useAppStore } from '@/store/appStore';
import { useTheme, spacing, typography, layout } from '@/theme';
import { DOMAIN_CATEGORIES } from '@/components/skillMap/domainGroups';
import { DomainCard } from '@/components/skillMap/DomainCard';
import type { RootStackParamList } from '@/navigation/types';
import type { MathDomain } from '@/services/mathEngine/types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'SkillMap'>;

export default function SkillMapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { colors } = useTheme();
  const skillStates = useAppStore((s) => s.skillStates);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          height: 56,
        },
        backButton: {
          width: layout.minTouchTarget,
          height: layout.minTouchTarget,
          justifyContent: 'center',
          alignItems: 'center',
        },
        headerTitle: {
          flex: 1,
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.xl,
          color: colors.textPrimary,
          textAlign: 'center',
        },
        headerSpacer: {
          width: layout.minTouchTarget,
        },
        scrollContent: {
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.xxl,
        },
        sectionHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginTop: spacing.lg,
          marginBottom: spacing.sm,
        },
        sectionEmoji: {
          fontSize: 20,
        },
        sectionTitle: {
          fontFamily: typography.fontFamily.bold,
          fontSize: typography.fontSize.lg,
          color: colors.textPrimary,
        },
      }),
    [colors],
  );

  const handleDomainPress = (domain: MathDomain) => {
    navigation.navigate('DomainDetail', { domain });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="back-button"
        >
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Skill Map</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Domain cards grouped by category */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {DOMAIN_CATEGORIES.map((category) => (
          <View key={category.title}>
            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>{category.emoji}</Text>
              <Text style={styles.sectionTitle}>{category.title}</Text>
            </View>

            {/* Domain cards */}
            {category.domains.map((meta) => (
              <DomainCard
                key={meta.domain}
                meta={meta}
                skillStates={skillStates}
                onPress={() => handleDomainPress(meta.domain)}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
