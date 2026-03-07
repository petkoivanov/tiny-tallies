/**
 * PrivacyDisclosure — shown once during first profile setup.
 *
 * Displays what data the app collects, how it's used, and third-party services.
 * Parent must tap "I Understand" to proceed to the ProfileCreationWizard.
 */

import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shield, Check } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';

interface PrivacyDisclosureProps {
  onAccept: () => void;
}

const DATA_POINTS = [
  {
    title: 'What we store locally',
    items: [
      'Child name, age, and grade (for age-appropriate content)',
      'Math progress scores and skill levels',
      'Badges and achievements earned',
    ],
  },
  {
    title: 'Cloud sync (when signed in)',
    items: [
      'Progress data syncs to our servers so it works across devices',
      'Your Google or Apple account is used only for authentication',
      'You can delete all cloud data anytime from Parental Controls',
    ],
  },
  {
    title: 'AI Helper (optional)',
    items: [
      'Uses Google Gemini to provide math explanations',
      'No personal information is sent to the AI',
      'Only math problem context is shared — never names or ages',
    ],
  },
  {
    title: 'Error tracking',
    items: [
      'Sentry collects crash reports to help us fix bugs',
      'No child names, ages, or personal data are included',
      'You can opt out anytime from Parental Controls',
    ],
  },
];

export function PrivacyDisclosure({ onAccept }: PrivacyDisclosureProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          paddingHorizontal: spacing.lg,
          alignItems: 'center',
        },
        header: {
          alignItems: 'center',
          marginTop: spacing.xl,
          marginBottom: spacing.lg,
          gap: spacing.sm,
        },
        title: {
          fontFamily: typography.fontFamily.bold,
          fontSize: typography.fontSize.xl,
          color: colors.textPrimary,
        },
        subtitle: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.md,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 24,
        },
        section: {
          width: '100%',
          backgroundColor: colors.surface,
          borderRadius: layout.borderRadius.lg,
          padding: spacing.lg,
          marginBottom: spacing.md,
        },
        sectionTitle: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.md,
          color: colors.textPrimary,
          marginBottom: spacing.sm,
        },
        bulletRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginBottom: spacing.xs,
          paddingLeft: spacing.xs,
        },
        bulletDot: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.md,
          color: colors.primary,
          marginRight: spacing.sm,
          lineHeight: 22,
        },
        bulletText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
          flex: 1,
          lineHeight: 22,
        },
        acceptButton: {
          width: '100%',
          backgroundColor: colors.primary,
          borderRadius: layout.borderRadius.lg,
          paddingVertical: spacing.md,
          marginTop: spacing.md,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: spacing.sm,
          minHeight: layout.minTouchTarget,
        },
        acceptText: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.lg,
          color: '#fff',
        },
      }),
    [colors],
  );

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
      testID="privacy-disclosure"
    >
      <View style={styles.header}>
        <Shield size={40} color={colors.primary} />
        <Text style={styles.title}>Privacy & Data</Text>
        <Text style={styles.subtitle}>
          Before we get started, here is how Tiny Tallies handles your child's
          data.
        </Text>
      </View>

      {DATA_POINTS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>{'\u2022'}</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}

      <Pressable
        style={styles.acceptButton}
        onPress={onAccept}
        accessibilityRole="button"
        accessibilityLabel="I understand, continue to profile setup"
        testID="privacy-accept-button"
      >
        <Check size={20} color="#fff" />
        <Text style={styles.acceptText}>I Understand</Text>
      </Pressable>
    </ScrollView>
  );
}
