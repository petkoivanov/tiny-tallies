import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Flame, Check, Focus, GitBranch } from 'lucide-react-native';
import { colors, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { AVATARS, DEFAULT_AVATAR_ID } from '@/store/constants/avatars';
import { calculateLevelFromXp } from '@/services/gamification/levelProgression';
import { isSameISOWeek } from '@/services/gamification/weeklyStreak';
import { BADGES } from '@/services/achievement';
import { getConfirmedMisconceptions } from '@/store/slices/misconceptionSlice';
import { ExploreGrid } from '@/components/home';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const childName = useAppStore((state) => state.childName);
  const avatarId = useAppStore((state) => state.avatarId);
  const xp = useAppStore((state) => state.xp);
  const level = useAppStore((state) => state.level);
  const weeklyStreak = useAppStore((state) => state.weeklyStreak);
  const lastSessionDate = useAppStore((state) => state.lastSessionDate);
  const misconceptions = useAppStore((state) => state.misconceptions);
  const earnedBadges = useAppStore((state) => state.earnedBadges);

  const earnedBadgeCount = Object.keys(earnedBadges).length;

  const confirmedMisconceptions = getConfirmedMisconceptions(misconceptions);
  const showRemediation = confirmedMisconceptions.length >= 2;
  const remediationSkillIds = [
    ...new Set(confirmedMisconceptions.map((r) => r.skillId)),
  ];

  const { xpIntoCurrentLevel, xpNeededForNextLevel } =
    calculateLevelFromXp(xp);

  const practicedThisWeek =
    lastSessionDate !== null &&
    isSameISOWeek(new Date(lastSessionDate), new Date());

  const progressFraction =
    xpNeededForNextLevel > 0
      ? xpIntoCurrentLevel / xpNeededForNextLevel
      : 0;
  const progressPercent = Math.min(progressFraction * 100, 100);

  const avatar =
    AVATARS.find((a) => a.id === (avatarId ?? DEFAULT_AVATAR_ID)) ??
    AVATARS[0];

  const greeting = childName ? `Hi, ${childName}!` : 'Hi, Mathematician!';

  const streakLabel =
    weeklyStreak > 0
      ? `${weeklyStreak} week streak`
      : 'Start your streak!';

  const streakNudge =
    !practicedThisWeek && weeklyStreak > 0
      ? 'Ready to keep your streak going?'
      : null;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom },
      ]}
    >
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
        </View>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.levelBadge}>Level {level}</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        {/* XP Progress Bar */}
        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>
            {xpIntoCurrentLevel} / {xpNeededForNextLevel} XP
          </Text>
          <View style={styles.xpBarBackground}>
            <View
              style={[
                styles.xpBarFill,
                {
                  width:
                    xpIntoCurrentLevel > 0
                      ? `${Math.max(progressPercent, 2)}%`
                      : '0%',
                },
              ]}
            />
          </View>
        </View>

        {/* Streak Display */}
        <View style={styles.streakContainer}>
          <View style={styles.streakRow}>
            <Flame
              size={20}
              color={colors.primaryLight}
              strokeWidth={2}
            />
            <Text style={styles.streakText}>{streakLabel}</Text>
            {practicedThisWeek && (
              <Check size={18} color={colors.correct} strokeWidth={3} />
            )}
          </View>
          {streakNudge !== null && (
            <Text style={styles.streakNudge}>{streakNudge}</Text>
          )}
          {weeklyStreak === 0 && (
            <Text style={styles.streakNudge}>
              Complete a session to begin!
            </Text>
          )}
        </View>

        {/* Badge Count */}
        <Pressable
          onPress={() => navigation.navigate('BadgeCollection')}
          style={styles.badgeCountButton}
          accessibilityRole="button"
          accessibilityLabel={`${earnedBadgeCount} of ${BADGES.length} badges earned. View all badges.`}
          testID="badge-count-button"
        >
          <Text style={styles.badgeCountEmoji}>{'\uD83C\uDFC5'}</Text>
          <Text style={styles.badgeCountText}>
            {earnedBadgeCount} / {BADGES.length} Badges
          </Text>
        </Pressable>

        {/* Skill Map */}
        <Pressable
          onPress={() => navigation.navigate('SkillMap')}
          style={styles.skillMapButton}
          accessibilityRole="button"
          accessibilityLabel="View skill map"
          testID="skill-map-button"
        >
          <GitBranch size={20} color={colors.primaryLight} strokeWidth={2} />
          <Text style={styles.skillMapButtonText}>Skill Map</Text>
        </Pressable>
      </View>

      {/* Explore Section */}
      <View style={styles.exploreSection}>
        <ExploreGrid />
      </View>

      {/* Start Practice Button */}
      <View style={styles.buttonSection}>
        <Pressable
          onPress={() =>
            navigation.navigate('Session', {
              sessionId: String(Date.now()),
            })
          }
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Start Practice"
        >
          <Text style={styles.buttonText}>Start Practice</Text>
        </Pressable>
        {showRemediation && (
          <Pressable
            onPress={() =>
              navigation.navigate('Session', {
                sessionId: String(Date.now()),
                mode: 'remediation',
                remediationSkillIds,
              })
            }
            style={({ pressed }) => [
              styles.remediationButton,
              pressed && styles.remediationButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Practice Tricky Skills"
            testID="remediation-button"
          >
            <View style={styles.remediationRow}>
              <Focus size={20} color={colors.primaryLight} strokeWidth={2} />
              <Text style={styles.remediationButtonText}>
                Practice Tricky Skills
              </Text>
            </View>
            <Text style={styles.remediationSubtext}>
              {confirmedMisconceptions.length} skills need extra practice
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const AVATAR_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: layout.borderRadius.round,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  greeting: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.display,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  levelBadge: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xl,
    color: colors.primaryLight,
    marginBottom: spacing.xl,
  },
  scrollContent: {
    flexGrow: 1,
  },
  statsSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  exploreSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  xpContainer: {
    gap: spacing.sm,
  },
  xpText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  xpBarBackground: {
    width: '100%',
    height: 12,
    borderRadius: layout.borderRadius.round,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: layout.borderRadius.round,
    backgroundColor: colors.primary,
    minWidth: 0,
  },
  streakContainer: {
    gap: spacing.xs,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  streakText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
  },
  streakNudge: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: 28,
  },
  badgeCountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.lg,
  },
  badgeCountEmoji: {
    fontSize: 20,
  },
  badgeCountText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  skillMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.lg,
  },
  skillMapButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  buttonSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    minHeight: 56,
    borderRadius: layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.primaryDark,
  },
  buttonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
  },
  remediationButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    minHeight: 56,
    borderRadius: layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  remediationButtonPressed: {
    backgroundColor: colors.surfaceLight,
  },
  remediationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  remediationButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    color: colors.primaryLight,
  },
  remediationSubtext: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
