import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp as RNRouteProp } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

import { getSkillsByOperation } from '@/services/mathEngine/skills';
import type { MathDomain } from '@/services/mathEngine/types';
import { useAppStore } from '@/store/appStore';
import { useTheme, spacing, typography, layout } from '@/theme';
import { skillMapColors } from '@/components/skillMap/skillMapColors';
import { DOMAIN_META } from '@/components/skillMap/domainGroups';
import { DomainSkillList } from '@/components/skillMap/DomainSkillList';
import { SkillDetailOverlay } from '@/components/skillMap/SkillDetailOverlay';
import type { RootStackParamList } from '@/navigation/types';

type ScreenRouteProp = RNRouteProp<RootStackParamList, 'DomainDetail'>;

export default function DomainDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<ScreenRouteProp>();
  const { colors } = useTheme();

  const { domain } = route.params;
  const meta = DOMAIN_META[domain];
  const domainColors = skillMapColors[domain as keyof typeof skillMapColors] as
    { primary: string; light: string; lighter: string };
  const skillStates = useAppStore((s) => s.skillStates);

  const skills = useMemo(() => getSkillsByOperation(domain), [domain]);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const { mastered, total } = useMemo(() => {
    let m = 0;
    for (const skill of skills) {
      const state = skillStates[skill.id];
      if (state?.masteryLocked) m++;
    }
    return { mastered: m, total: skills.length };
  }, [skills, skillStates]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {meta?.emoji ?? ''} {meta?.displayName ?? domain}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Summary bar */}
      <View style={[styles.summary, { backgroundColor: colors.surface }]}>
        <View style={[styles.summaryAccent, { backgroundColor: domainColors.primary }]} />
        <View style={styles.summaryContent}>
          <Text style={[styles.summaryText, { color: colors.textPrimary }]}>
            {mastered}/{total} skills mastered
          </Text>
          <View style={[styles.summaryBar, { backgroundColor: colors.surfaceLight }]}>
            <View
              style={[
                styles.summaryBarFill,
                {
                  width: `${total > 0 ? Math.max(mastered > 0 ? 3 : 0, (mastered / total) * 100) : 0}%`,
                  backgroundColor: mastered === total ? '#fbbf24' : domainColors.primary,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Skill list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DomainSkillList
          meta={meta ?? { domain, displayName: domain, emoji: '?' }}
          skills={skills}
          skillStates={skillStates}
          onSkillPress={setSelectedSkillId}
        />
      </ScrollView>

      {/* Skill detail overlay */}
      <SkillDetailOverlay
        skillId={selectedSkillId}
        skillStates={skillStates}
        onClose={() => setSelectedSkillId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    textAlign: 'center',
  },
  headerSpacer: {
    width: layout.minTouchTarget,
  },
  summary: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    borderRadius: layout.borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  summaryAccent: {
    width: 5,
  },
  summaryContent: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
  },
  summaryBar: {
    height: 8,
    borderRadius: layout.borderRadius.round,
    overflow: 'hidden',
  },
  summaryBarFill: {
    height: 8,
    borderRadius: layout.borderRadius.round,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
