/**
 * ParentReportsScreen — PIN-gated learning progress reports for parents.
 *
 * Displays:
 * - Overall mastery summary (mastered / in-progress / not-started counts)
 * - Elo rating with level and progress bar
 * - Per-domain skill breakdown
 * - Detected misconceptions (confirmed + suspected)
 * - Session and streak stats
 *
 * Accessed from ParentalControlsScreen. Parent is already PIN-authenticated.
 */

import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  BarChart3,
  AlertTriangle,
  Activity,
} from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { SKILLS } from '@/services/mathEngine/skills';
import { getSkillById } from '@/services/mathEngine/skills';
import { EloOverview } from '@/components/reports/EloOverview';
import { SkillDomainSummary } from '@/components/reports/SkillDomainSummary';
import type { MisconceptionRecord } from '@/store/slices/misconceptionSlice';

/** Compute average Elo from all practiced skills */
function computeAverageElo(
  skillStates: Record<string, { eloRating: number; attempts: number }>,
): number {
  const practiced = Object.values(skillStates).filter((s) => s.attempts > 0);
  if (practiced.length === 0) return 800; // default starting Elo
  const sum = practiced.reduce((acc, s) => acc + s.eloRating, 0);
  return sum / practiced.length;
}

/** Compute overall mastery counts */
function computeMasteryCounts(
  skillStates: Record<string, { attempts: number; masteryLocked: boolean }>,
) {
  let mastered = 0;
  let inProgress = 0;
  let notStarted = 0;

  for (const skill of SKILLS) {
    const state = skillStates[skill.id];
    if (!state || state.attempts === 0) {
      notStarted++;
    } else if (state.masteryLocked) {
      mastered++;
    } else {
      inProgress++;
    }
  }

  return { mastered, inProgress, notStarted, total: SKILLS.length };
}

/** Filter active misconceptions (confirmed or suspected) */
function getActiveMisconceptions(
  misconceptions: Record<string, MisconceptionRecord>,
): MisconceptionRecord[] {
  return Object.values(misconceptions).filter(
    (r) => r.status === 'confirmed' || r.status === 'suspected',
  );
}

export default function ParentReportsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();

  const skillStates = useAppStore((s) => s.skillStates);
  const misconceptions = useAppStore((s) => s.misconceptions);
  const xp = useAppStore((s) => s.xp);
  const level = useAppStore((s) => s.level);
  const weeklyStreak = useAppStore((s) => s.weeklyStreak);
  const sessionsCompleted = useAppStore((s) => s.sessionsCompleted);
  const earnedBadges = useAppStore((s) => s.earnedBadges);
  const childName = useAppStore((s) => s.childName);

  const averageElo = useMemo(() => computeAverageElo(skillStates), [skillStates]);
  const masteryCounts = useMemo(
    () => computeMasteryCounts(skillStates),
    [skillStates],
  );
  const activeMisconceptions = useMemo(
    () => getActiveMisconceptions(misconceptions),
    [misconceptions],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          paddingHorizontal: spacing.lg,
          gap: spacing.lg,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          gap: spacing.sm,
        },
        backButton: {
          minWidth: layout.minTouchTarget,
          minHeight: layout.minTouchTarget,
          justifyContent: 'center',
          alignItems: 'center',
        },
        headerTitle: {
          fontFamily: typography.fontFamily.bold,
          fontSize: typography.fontSize.xl,
          color: colors.textPrimary,
          flex: 1,
        },
        summaryCard: {
          backgroundColor: colors.surface,
          borderRadius: layout.borderRadius.lg,
          padding: spacing.lg,
          gap: spacing.md,
        },
        summaryHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        },
        sectionTitle: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.lg,
          color: colors.textPrimary,
        },
        statsGrid: {
          flexDirection: 'row',
          justifyContent: 'space-around',
        },
        statBlock: {
          alignItems: 'center',
          gap: spacing.xs,
        },
        statValue: {
          fontFamily: typography.fontFamily.bold,
          fontSize: typography.fontSize.xl,
          color: colors.primary,
        },
        statValueCorrect: {
          fontFamily: typography.fontFamily.bold,
          fontSize: typography.fontSize.xl,
          color: colors.correct,
        },
        statLabel: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.xs,
          color: colors.textMuted,
          textAlign: 'center',
        },
        misconceptionCard: {
          backgroundColor: colors.surface,
          borderRadius: layout.borderRadius.lg,
          padding: spacing.lg,
          gap: spacing.md,
        },
        misconceptionItem: {
          backgroundColor: colors.backgroundLight,
          borderRadius: layout.borderRadius.md,
          padding: spacing.md,
          gap: spacing.xs,
        },
        misconceptionBugTag: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: typography.fontSize.md,
          color: colors.textPrimary,
        },
        misconceptionDetail: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
        },
        statusBadge: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.xs,
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
          borderRadius: layout.borderRadius.sm,
          overflow: 'hidden',
          alignSelf: 'flex-start',
        },
        confirmedBadge: {
          backgroundColor: colors.incorrect,
          color: '#fff',
        },
        suspectedBadge: {
          backgroundColor: colors.primaryLight,
          color: colors.primaryDark,
        },
        emptyText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.md,
          color: colors.textMuted,
          textAlign: 'center',
          paddingVertical: spacing.md,
        },
        activityCard: {
          backgroundColor: colors.surface,
          borderRadius: layout.borderRadius.lg,
          padding: spacing.lg,
          gap: spacing.md,
        },
      }),
    [colors],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          testID="back-button"
        >
          <ChevronLeft size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {childName ? `${childName}'s Progress` : 'Progress Report'}
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        testID="parent-reports-content"
      >
        {/* Overall Mastery Summary */}
        <View style={styles.summaryCard} testID="mastery-summary">
          <View style={styles.summaryHeader}>
            <BarChart3 size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Overall Mastery</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statBlock}>
              <Text style={styles.statValueCorrect}>
                {masteryCounts.mastered}
              </Text>
              <Text style={styles.statLabel}>Mastered</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{masteryCounts.inProgress}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{masteryCounts.notStarted}</Text>
              <Text style={styles.statLabel}>Not Started</Text>
            </View>
          </View>
        </View>

        {/* Elo / Level Overview */}
        <EloOverview eloRating={averageElo} />

        {/* Skills by Domain */}
        <SkillDomainSummary skillStates={skillStates} />

        {/* Activity Stats */}
        <View style={styles.activityCard} testID="activity-stats">
          <View style={styles.summaryHeader}>
            <Activity size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Activity</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{sessionsCompleted}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{weeklyStreak}</Text>
              <Text style={styles.statLabel}>Week Streak</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{xp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>
                {Object.keys(earnedBadges).length}
              </Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </View>
        </View>

        {/* Misconceptions */}
        <View style={styles.misconceptionCard} testID="misconceptions-section">
          <View style={styles.summaryHeader}>
            <AlertTriangle size={20} color={colors.incorrect} />
            <Text style={styles.sectionTitle}>Detected Misconceptions</Text>
          </View>
          {activeMisconceptions.length === 0 ? (
            <Text style={styles.emptyText}>
              No misconceptions detected yet. Keep practicing!
            </Text>
          ) : (
            activeMisconceptions.map((m) => {
              const skill = getSkillById(m.skillId);
              return (
                <View
                  key={`${m.bugTag}::${m.skillId}`}
                  style={styles.misconceptionItem}
                  testID="misconception-item"
                >
                  <Text
                    style={[
                      styles.statusBadge,
                      m.status === 'confirmed'
                        ? styles.confirmedBadge
                        : styles.suspectedBadge,
                    ]}
                  >
                    {m.status === 'confirmed' ? 'Confirmed' : 'Suspected'}
                  </Text>
                  <Text style={styles.misconceptionBugTag}>
                    {m.bugTag.replace(/_/g, ' ')}
                  </Text>
                  <Text style={styles.misconceptionDetail}>
                    Skill: {skill?.name ?? m.skillId} — seen {m.occurrenceCount}{' '}
                    time{m.occurrenceCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
