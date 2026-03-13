/**
 * ParentReportsScreen — PIN-gated learning progress reports for parents.
 *
 * Displays:
 * - AI-generated progress summary (tap to expand session history)
 * - Mastery donut chart + stats
 * - Elo rating with level and progress bar
 * - Session performance bar chart
 * - Per-domain skill breakdown (expandable)
 * - Activity stats
 * - Detected misconceptions (confirmed + suspected)
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
  PlayCircle,
} from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { SKILLS, getSkillById } from '@/services/mathEngine/skills';
import { EloOverview } from '@/components/reports/EloOverview';
import { SkillDomainSummary } from '@/components/reports/SkillDomainSummary';
import { MasteryDonutChart } from '@/components/reports/MasteryDonutChart';
import { SessionBarChart } from '@/components/reports/SessionBarChart';
import { AiSummaryCard } from '@/components/reports/AiSummaryCard';
import type { ParentSummaryInput } from '@/services/reports';
import type { MisconceptionRecord } from '@/store/slices/misconceptionSlice';

/** Compute average Elo from all practiced skills */
function computeAverageElo(
  skillStates: Record<string, { eloRating: number; attempts: number }>,
): number {
  const practiced = Object.values(skillStates).filter((s) => s.attempts > 0);
  if (practiced.length === 0) return 800;
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

/** Find top 3 domains by mastered-skill count */
function getTopDomains(
  skillStates: Record<string, { attempts: number; masteryLocked: boolean }>,
): string[] {
  const domainCounts: Record<string, number> = {};
  for (const skill of SKILLS) {
    const state = skillStates[skill.id];
    if (state?.masteryLocked) {
      domainCounts[skill.operation] = (domainCounts[skill.operation] ?? 0) + 1;
    }
  }
  return Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([op]) => op.replace(/_/g, ' '));
}

export default function ParentReportsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();

  const skillStates = useAppStore((s) => s.skillStates);
  const misconceptions = useAppStore((s) => s.misconceptions);
  const xp = useAppStore((s) => s.xp);
  const weeklyStreak = useAppStore((s) => s.weeklyStreak);
  const sessionsCompleted = useAppStore((s) => s.sessionsCompleted);
  const earnedBadges = useAppStore((s) => s.earnedBadges);
  const childName = useAppStore((s) => s.childName);
  const sessionHistory = useAppStore((s) => s.sessionHistory);
  const videoVotes = useAppStore((s) => s.videoVotes);

  const averageElo = useMemo(() => computeAverageElo(skillStates), [skillStates]);
  const masteryCounts = useMemo(
    () => computeMasteryCounts(skillStates),
    [skillStates],
  );
  const activeMisconceptions = useMemo(
    () => getActiveMisconceptions(misconceptions),
    [misconceptions],
  );

  const recentAccuracy = useMemo(() => {
    const recent = sessionHistory.slice(0, 5);
    if (recent.length === 0) return null;
    const totalScore = recent.reduce((sum, s) => sum + s.score, 0);
    const totalProblems = recent.reduce((sum, s) => sum + s.total, 0);
    return totalProblems > 0 ? totalScore / totalProblems : null;
  }, [sessionHistory]);

  const summaryInput: ParentSummaryInput = useMemo(
    () => ({
      childName: childName ?? '',
      totalSkills: masteryCounts.total,
      mastered: masteryCounts.mastered,
      inProgress: masteryCounts.inProgress,
      sessionsCompleted,
      weeklyStreak,
      recentAccuracy,
      topDomains: getTopDomains(skillStates),
      misconceptionCount: activeMisconceptions.length,
    }),
    [
      childName,
      masteryCounts,
      sessionsCompleted,
      weeklyStreak,
      recentAccuracy,
      skillStates,
      activeMisconceptions.length,
    ],
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
        masteryRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.lg,
        },
        masteryStats: {
          flex: 1,
          gap: spacing.sm,
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
        {/* AI Summary + Session History */}
        <AiSummaryCard
          summaryInput={summaryInput}
          sessions={sessionHistory}
        />

        {/* Mastery Overview with Donut Chart */}
        <View style={styles.summaryCard} testID="mastery-summary">
          <View style={styles.summaryHeader}>
            <BarChart3 size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Overall Mastery</Text>
          </View>
          <View style={styles.masteryRow}>
            <MasteryDonutChart
              mastered={masteryCounts.mastered}
              inProgress={masteryCounts.inProgress}
              notStarted={masteryCounts.notStarted}
            />
            <View style={styles.masteryStats}>
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
        </View>

        {/* Elo / Level Overview */}
        <EloOverview eloRating={averageElo} />

        {/* Session Performance Chart */}
        <SessionBarChart sessions={sessionHistory} />

        {/* Skills by Domain (expandable) */}
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

        {/* Video Usage */}
        {Object.keys(videoVotes).length > 0 && (
          <View style={styles.activityCard} testID="video-usage-section">
            <View style={styles.summaryHeader}>
              <PlayCircle size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Instructional Videos</Text>
            </View>
            <Text style={[styles.emptyText, { marginBottom: spacing.sm }]}>
              Videos watched in topics where {childName ?? 'your child'} needed
              extra support:
            </Text>
            {Object.entries(videoVotes).map(([domain, vote]) => (
              <View key={domain} style={styles.misconceptionItem}>
                <Text
                  style={[
                    styles.statusBadge,
                    vote === 'helpful' ? styles.confirmedBadge : styles.suspectedBadge,
                  ]}
                >
                  {vote === 'helpful' ? 'Helpful' : 'Not helpful'}
                </Text>
                <Text style={styles.misconceptionBugTag}>
                  {domain.replace(/_/g, ' ')}
                </Text>
              </View>
            ))}
          </View>
        )}

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
