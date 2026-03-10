import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Flame, Check, Focus, GitBranch, Palette, Settings, Award, Target, RefreshCw } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { AVATARS, DEFAULT_AVATAR_ID, SPECIAL_AVATARS, FRAMES, resolveAvatar } from '@/store/constants/avatars';
import { AvatarCircle } from '@/components/avatars';
import { ProfileSwitcherSheet } from '@/components/profile';
import { calculateLevelFromXp } from '@/services/gamification/levelProgression';
import { eloToLevel } from '@/services/adaptive/levelMapping';
import { isSameISOWeek } from '@/services/gamification/weeklyStreak';
import { BADGES } from '@/services/achievement';
import { getConfirmedMisconceptions } from '@/store/slices/misconceptionSlice';
import { ExploreGrid, DailyChallengeCard } from '@/components/home';
import { useAbsenceCheck } from '@/hooks/useAbsenceCheck';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [switcherVisible, setSwitcherVisible] = useState(false);

  const childName = useAppStore((state) => state.childName);
  const avatarId = useAppStore((state) => state.avatarId);
  const isSessionActive = useAppStore((state) => state.isSessionActive);
  const xp = useAppStore((state) => state.xp);
  const skillStates = useAppStore((state) => state.skillStates);

  // Level derived from average Elo (matches ParentReportsScreen)
  const level = useMemo(() => {
    const practiced = Object.values(skillStates).filter((s) => s.attempts > 0);
    if (practiced.length === 0) return 1;
    const avgElo = practiced.reduce((acc, s) => acc + s.eloRating, 0) / practiced.length;
    return eloToLevel(avgElo);
  }, [skillStates]);
  const weeklyStreak = useAppStore((state) => state.weeklyStreak);
  const lastSessionDate = useAppStore((state) => state.lastSessionDate);
  const misconceptions = useAppStore((state) => state.misconceptions);
  const earnedBadges = useAppStore((state) => state.earnedBadges);
  const frameId = useAppStore((state) => state.frameId);
  const placementComplete = useAppStore((state) => state.placementComplete);

  const { suggestReassessment, decayedSkillCount } = useAbsenceCheck();

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

  const avatar = resolveAvatar(avatarId ?? DEFAULT_AVATAR_ID) ?? AVATARS[0];
  const isSpecial = SPECIAL_AVATARS.some((a) => a.id === avatarId);
  const frameColor = frameId
    ? FRAMES.find((f) => f.id === frameId)?.color
    : undefined;

  const greeting = childName ? `Hi, ${childName}!` : 'Hi, Mathematician!';

  const streakLabel =
    weeklyStreak > 0
      ? `${weeklyStreak} week streak`
      : 'Start your streak!';

  const streakNudge =
    !practicedThisWeek && weeklyStreak > 0
      ? 'Ready to keep your streak going?'
      : null;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    toolbar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      gap: spacing.xs,
    },
    toolbarButton: {
      padding: spacing.sm,
      minWidth: layout.minTouchTarget,
      minHeight: layout.minTouchTarget,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileSection: {
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
    },
    avatarContainer: {
      marginBottom: spacing.md,
    },
    greeting: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.display,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
    },
    statsRowLevel: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.primaryLight,
    },
    statsRowSeparator: {
      fontSize: typography.fontSize.md,
      color: colors.textMuted,
    },
    statsRowXp: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
    },
    statsRowBadgeText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.textPrimary,
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
    challengeSection: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
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
    placementCard: {
      backgroundColor: colors.surface,
      borderRadius: layout.borderRadius.lg,
      padding: spacing.md,
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
    },
    placementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    placementText: {
      flex: 1,
    },
    placementTitle: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.textPrimary,
    },
    placementSubtitle: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
  }), [colors]);

  return (
    <>
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom },
      ]}
    >
      {/* Top Toolbar */}
      <View style={styles.toolbar}>
        <Pressable
          style={styles.toolbarButton}
          onPress={() => navigation.navigate('BadgeCollection')}
          accessibilityLabel={`${earnedBadgeCount} of ${BADGES.length} badges earned. View all badges.`}
          accessibilityRole="button"
          testID="badge-count-button"
        >
          <Award size={20} color={colors.textMuted} />
        </Pressable>
        <Pressable
          style={styles.toolbarButton}
          onPress={() => navigation.navigate('SkillMap')}
          accessibilityLabel="View skill map"
          accessibilityRole="button"
          testID="skill-map-button"
        >
          <GitBranch size={20} color={colors.textMuted} />
        </Pressable>
        <Pressable
          style={styles.toolbarButton}
          onPress={() => navigation.navigate('ThemePicker')}
          accessibilityLabel="Choose theme"
          accessibilityRole="button"
          testID="theme-picker-button"
        >
          <Palette size={20} color={colors.textMuted} />
        </Pressable>
        <Pressable
          style={styles.toolbarButton}
          onPress={() => navigation.navigate('ParentalControls' as never)}
          accessibilityLabel="Parental Controls"
          accessibilityRole="button"
          testID="settings-button"
        >
          <Settings size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <AvatarCircle
            emoji={avatar.emoji}
            size={AVATAR_SIZE}
            frameColor={frameColor}
            isSpecial={isSpecial}
            onPress={() => {
              if (!isSessionActive) {
                setSwitcherVisible(true);
              }
            }}
          />
        </View>
        <Text style={styles.greeting}>{greeting}</Text>
        {/* Level · XP · Badges — compact single row */}
        <View style={styles.statsRow}>
          <Text style={styles.statsRowLevel}>Level {level}</Text>
          <Text style={styles.statsRowSeparator}>{'\u00B7'}</Text>
          <Text style={styles.statsRowXp}>
            {xpIntoCurrentLevel}/{xpNeededForNextLevel} XP
          </Text>
          <Text style={styles.statsRowSeparator}>|</Text>
          <Text style={styles.statsRowBadgeText}>
            {earnedBadgeCount}/{BADGES.length} {'\uD83C\uDFC5'}
          </Text>
        </View>
      </View>

      {/* Streak Display */}
      <View style={styles.statsSection}>
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
      </View>

      {/* Placement Test Card — shown when not yet completed */}
      {!placementComplete && (
        <Pressable
          style={styles.placementCard}
          onPress={() => navigation.navigate('PlacementTest')}
          accessibilityRole="button"
          accessibilityLabel="Take placement test"
          testID="placement-card"
        >
          <View style={styles.placementRow}>
            <Target size={24} color={colors.primary} />
            <View style={styles.placementText}>
              <Text style={styles.placementTitle}>Find Your Level</Text>
              <Text style={styles.placementSubtitle}>
                Take a quick quiz to personalize your practice
              </Text>
            </View>
          </View>
        </Pressable>
      )}

      {/* Re-assessment Card — shown when absence decay is significant */}
      {suggestReassessment && (
        <Pressable
          style={styles.placementCard}
          onPress={() => navigation.navigate('PlacementTest')}
          accessibilityRole="button"
          accessibilityLabel="Retake placement test"
          testID="reassessment-card"
        >
          <View style={styles.placementRow}>
            <RefreshCw size={24} color={colors.primaryLight} />
            <View style={styles.placementText}>
              <Text style={styles.placementTitle}>Welcome Back!</Text>
              <Text style={styles.placementSubtitle}>
                {decayedSkillCount} skills may need a refresher — retake the quiz?
              </Text>
            </View>
          </View>
        </Pressable>
      )}

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

      {/* Daily Challenge */}
      <View style={styles.challengeSection}>
        <DailyChallengeCard />
      </View>

      {/* Explore Section */}
      <View style={styles.exploreSection}>
        <ExploreGrid />
      </View>
    </ScrollView>

      <ProfileSwitcherSheet
        visible={switcherVisible}
        onClose={() => setSwitcherVisible(false)}
        onManageProfiles={() => {
          setSwitcherVisible(false);
          navigation.navigate('ProfileManagement' as never);
        }}
      />
    </>
  );
}

const AVATAR_SIZE = 80;
