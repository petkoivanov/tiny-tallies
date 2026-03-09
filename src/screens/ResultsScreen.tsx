import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  CommonActions,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Flame, Check } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import type { ThemeColors } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { calculateLevelFromXp } from '@/services/gamification/levelProgression';
import { ConfettiCelebration } from '@/components/animations/ConfettiCelebration';
import { BadgeUnlockPopup } from '@/components/animations/BadgeUnlockPopup';
import { BadgesSummary } from '@/components/badges';
import type { RootStackParamList } from '@/navigation/types';
import type { CpaStage } from '@/services/cpa/cpaTypes';

type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>;

function getCpaAdvanceMessage(
  advances: Array<{ skillId: string; from: CpaStage; to: CpaStage }>,
): string {
  const hasAbstract = advances.some((a) => a.to === 'abstract');
  if (hasAbstract) {
    return 'Amazing! You can solve with just numbers now!';
  }
  return 'You leveled up! Now you can solve with pictures!';
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds}s`;
}

function getMotivationalMessage(scorePercent: number): string {
  if (scorePercent >= 90) return 'Amazing!';
  if (scorePercent >= 70) return 'Great job!';
  return 'Nice effort!';
}

function getMotivationalColor(scorePercent: number, colors: ThemeColors): string {
  if (scorePercent >= 90) return colors.correct;
  if (scorePercent >= 70) return colors.primaryLight;
  return colors.textPrimary;
}

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<ResultsRouteProp>();
  const { colors } = useTheme();

  const {
    score,
    total,
    xpEarned,
    durationMs,
    leveledUp,
    newLevel,
    streakCount,
    cpaAdvances = [],
    isRemediation = false,
    newBadges = [],
    totalNewBadges = 0,
    isChallenge = false,
    challengeBonusXp = 0,
    accuracyGoalMet = false,
    streakGoalMet = false,
  } = route.params;

  const [showBadgePopup, setShowBadgePopup] = useState(newBadges.length > 0);

  const xp = useAppStore((state) => state.xp);

  const { level, xpIntoCurrentLevel, xpNeededForNextLevel } =
    calculateLevelFromXp(xp);

  const scorePercent = total > 0 ? (score / total) * 100 : 0;
  const motivationalMessage = isRemediation
    ? 'Great focus!'
    : getMotivationalMessage(scorePercent);
  const motivationalColor = isRemediation
    ? colors.primaryLight
    : getMotivationalColor(scorePercent, colors);

  const progressFraction =
    xpNeededForNextLevel > 0
      ? xpIntoCurrentLevel / xpNeededForNextLevel
      : 0;
  const progressPercent = Math.min(progressFraction * 100, 100);

  const levelUpScale = useSharedValue(leveledUp ? 0.5 : 1);

  useEffect(() => {
    if (leveledUp) {
      levelUpScale.value = withDelay(
        300,
        withSpring(1, { damping: 6, stiffness: 150 }),
      );
    }
  }, [leveledUp, levelUpScale]);

  const levelUpAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelUpScale.value }],
  }));

  const cpaScale = useSharedValue(cpaAdvances.length > 0 ? 0.5 : 1);
  useEffect(() => {
    if (cpaAdvances.length > 0) {
      cpaScale.value = withDelay(
        400,
        withSpring(1, { damping: 6, stiffness: 150 }),
      );
    }
  }, [cpaAdvances, cpaScale]);

  const cpaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cpaScale.value }],
  }));

  const handleDone = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      }),
    );
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    motivationalMessage: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.display,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.textSecondary,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
    statsCard: {
      backgroundColor: colors.surface,
      borderRadius: layout.borderRadius.lg,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      width: '100%',
      maxWidth: 320,
      marginBottom: spacing.xxl,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    statLabel: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
    },
    scoreText: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xl,
      color: colors.textPrimary,
    },
    scoreCorrect: {
      color: colors.correct,
    },
    scoreSeparator: {
      color: colors.textSecondary,
    },
    xpText: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xl,
      color: colors.primaryLight,
    },
    xpBarContainer: {
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    xpBarLabel: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
    xpBarBackground: {
      width: '100%',
      height: 10,
      borderRadius: layout.borderRadius.round,
      backgroundColor: colors.surfaceLight,
      overflow: 'hidden',
    },
    xpBarFill: {
      height: '100%',
      borderRadius: layout.borderRadius.round,
      backgroundColor: colors.primary,
      minWidth: 0,
    },
    streakRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
    },
    streakText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.textPrimary,
      flex: 1,
    },
    cpaRow: {
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    cpaText: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.md,
      color: colors.primaryLight,
      textAlign: 'center',
    },
    levelUpRow: {
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    levelUpText: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.lg,
      color: colors.primaryLight,
    },
    challengeSection: {
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    challengeTitle: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.md,
      color: colors.primaryLight,
    },
    challengeBonusText: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.lg,
      color: colors.correct,
    },
    challengeGoals: {
      gap: spacing.xs,
    },
    challengeGoalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    challengeGoalIcon: {
      fontSize: 16,
    },
    challengeGoalText: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
    challengeGoalMet: {
      color: colors.correct,
    },
    timeText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.textPrimary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.surfaceLight,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: layout.borderRadius.lg,
      minHeight: layout.minTouchTarget,
      minWidth: 200,
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
  }), [colors]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[styles.motivationalMessage, { color: motivationalColor }]}
          testID="motivational-message"
        >
          {motivationalMessage}
        </Text>

        <Text style={styles.subtitle}>
          {isRemediation
            ? 'Great practice on tricky skills!'
            : 'Session Complete!'}
        </Text>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.scoreText}>
              <Text style={styles.scoreCorrect}>{score}</Text>
              <Text style={styles.scoreSeparator}> / </Text>
              <Text>{total}</Text>
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>XP Earned</Text>
            <Text style={styles.xpText}>+{xpEarned} XP</Text>
          </View>

          {isChallenge && (
            <>
              <View style={styles.divider} />
              <View style={styles.challengeSection} testID="challenge-bonus-section">
                <Text style={styles.challengeTitle}>Daily Challenge</Text>
                <Text style={styles.challengeBonusText}>
                  +{challengeBonusXp} Bonus XP
                </Text>
                <View style={styles.challengeGoals}>
                  <View style={styles.challengeGoalRow}>
                    <Text style={styles.challengeGoalIcon}>
                      {accuracyGoalMet ? '\u2705' : '\u2B1C'}
                    </Text>
                    <Text
                      style={[
                        styles.challengeGoalText,
                        accuracyGoalMet && styles.challengeGoalMet,
                      ]}
                    >
                      {accuracyGoalMet
                        ? 'Accuracy goal met!'
                        : `Accuracy: ${score}/${total}`}
                    </Text>
                  </View>
                  <View style={styles.challengeGoalRow}>
                    <Text style={styles.challengeGoalIcon}>
                      {streakGoalMet ? '\u2705' : '\u2B1C'}
                    </Text>
                    <Text
                      style={[
                        styles.challengeGoalText,
                        streakGoalMet && styles.challengeGoalMet,
                      ]}
                    >
                      {streakGoalMet
                        ? 'Streak goal met!'
                        : `Streak: ${streakCount}`}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.xpBarContainer}>
            <Text style={styles.xpBarLabel}>
              {xpIntoCurrentLevel} / {xpNeededForNextLevel} XP to Level{' '}
              {level + 1}
            </Text>
            <View style={styles.xpBarBackground} testID="xp-progress-bar">
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

          <View style={styles.divider} />

          <View style={styles.streakRow} testID="streak-row">
            <Flame
              size={20}
              color={colors.primaryLight}
              strokeWidth={2}
            />
            <Text style={styles.streakText}>
              Streak: {streakCount} week{streakCount !== 1 ? 's' : ''}
            </Text>
            <Check size={18} color={colors.correct} strokeWidth={3} />
          </View>

          {cpaAdvances.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.cpaRow} testID="cpa-advance-callout">
                <Animated.View style={cpaAnimatedStyle}>
                  <Text style={styles.cpaText}>
                    {getCpaAdvanceMessage(cpaAdvances)}
                  </Text>
                </Animated.View>
              </View>
            </>
          )}

          {leveledUp && (
            <>
              <View style={styles.divider} />
              <View style={styles.levelUpRow} testID="level-up-callout">
                <Animated.View style={levelUpAnimatedStyle}>
                  <Text style={styles.levelUpText}>
                    Level Up! {'\u2192'} Level {newLevel}
                  </Text>
                </Animated.View>
              </View>
            </>
          )}

          <BadgesSummary
            badgeIds={newBadges}
            totalEarned={totalNewBadges}
            onViewAll={() =>
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [{ name: 'Home' }, { name: 'BadgeCollection' }],
                }),
              )
            }
          />

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.timeText}>{formatDuration(durationMs)}</Text>
          </View>
        </View>

        <Pressable
          onPress={handleDone}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Done"
          testID="done-button"
        >
          <Text style={styles.buttonText}>Done</Text>
        </Pressable>
      </View>

      {leveledUp && <ConfettiCelebration />}
      {showBadgePopup && (
        <BadgeUnlockPopup
          badgeIds={newBadges}
          onComplete={() => setShowBadgePopup(false)}
        />
      )}
    </View>
  );
}
