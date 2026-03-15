import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { getTodaysChallenge, getTodayDateKey } from '@/services/challenge';
import type { ChallengeCompletion } from '@/services/challenge';
import type { ThemeColors } from '@/theme';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rocketAnim = require('../../../assets/animations/rocket.json');

function ActiveChallengeContent({
  name,
  accuracyTarget,
  streakTarget,
  styles,
  colors,
}: {
  name: string;
  accuracyTarget: number;
  streakTarget: number;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
}) {
  return (
    <>
      <View style={styles.headerRow}>
        <LottieView
          source={rocketAnim}
          autoPlay
          loop
          style={styles.rocketIcon}
          colorFilters={[
            { keypath: 'Layer 2', color: colors.primary },
            { keypath: 'Layer 5', color: colors.primary },
            { keypath: 'Layer 2.Group 3', color: colors.primaryLight },
            { keypath: 'Layer 2.Group 5', color: colors.primaryLight },
            { keypath: 'Layer 2.Group 7', color: colors.primaryLight },
            { keypath: 'Layer 5.Group 1.Group 1', color: colors.primaryLight },
            { keypath: 'Layer 2.Group 10', color: colors.primaryDark },
            { keypath: 'Shape Layer 26', color: colors.primaryLight },
            { keypath: 'Shape Layer 23', color: colors.primaryLight },
            { keypath: 'Shape Layer 22', color: colors.primaryLight },
            { keypath: 'Shape Layer 18', color: colors.primaryLight },
            { keypath: 'Shape Layer 14', color: colors.primaryLight },
            { keypath: 'Shape Layer 6', color: colors.primaryLight },
            { keypath: 'Shape Layer 13', color: colors.primaryLight },
            { keypath: 'Shape Layer 11', color: colors.primaryLight },
            { keypath: 'Shape Layer 10', color: colors.primaryLight },
          ]}
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>Daily Challenge</Text>
        </View>
      </View>
      <Text style={styles.goalText}>
        Get {accuracyTarget}/10 correct and {streakTarget} in a row!
      </Text>
    </>
  );
}

function CompletedChallengeContent({
  emoji,
  name,
  completion,
  colors,
  styles,
}: {
  emoji: string;
  name: string;
  completion: ChallengeCompletion;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.completeLabel}>Challenge Complete!</Text>
        </View>
      </View>
      <View style={styles.completedStats}>
        <Text style={styles.scoreText}>
          {completion.score}/{completion.total}
        </Text>
        <Text style={styles.bonusXpText}>+{completion.bonusXpAwarded} bonus XP</Text>
      </View>
      <View style={styles.goalsRow}>
        <View style={styles.goalItem}>
          {completion.accuracyGoalMet ? (
            <Check size={16} color={colors.correct} strokeWidth={3} />
          ) : (
            <View style={styles.goalDot} />
          )}
          <Text
            style={[
              styles.goalLabel,
              completion.accuracyGoalMet && styles.goalLabelMet,
            ]}
          >
            Accuracy goal
          </Text>
        </View>
        <View style={styles.goalItem}>
          {completion.streakGoalMet ? (
            <Check size={16} color={colors.correct} strokeWidth={3} />
          ) : (
            <View style={styles.goalDot} />
          )}
          <Text
            style={[
              styles.goalLabel,
              completion.streakGoalMet && styles.goalLabelMet,
            ]}
          >
            Streak goal
          </Text>
        </View>
      </View>
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: layout.borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 2,
      borderColor: colors.primaryLight,
    },
    cardCompleted: {
      borderColor: colors.correct,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.sm,
    },
    emoji: {
      fontSize: 32,
    },
    rocketIcon: {
      width: 48,
      height: 48,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.lg,
      color: colors.textPrimary,
    },
    subtitle: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
    completeLabel: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: colors.correct,
    },
    goalText: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    statusText: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
    completedStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      marginBottom: spacing.sm,
    },
    scoreText: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xl,
      color: colors.textPrimary,
    },
    bonusXpText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.primaryLight,
    },
    goalsRow: {
      flexDirection: 'row',
      gap: spacing.lg,
    },
    goalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    goalDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.surfaceLight,
    },
    goalLabel: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
    goalLabelMet: {
      color: colors.correct,
    },
  });
}

export function DailyChallengeCard() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const challengeCompletions = useAppStore((s) => s.challengeCompletions);

  const todayKey = getTodayDateKey();
  const theme = getTodaysChallenge();
  const completion = challengeCompletions[todayKey];
  const isCompleted = completion !== undefined;

  const handlePress = () => {
    if (isCompleted) return;
    navigation.navigate('Session', {
      sessionId: String(Date.now()),
      mode: 'challenge' as const,
      challengeThemeId: theme.id,
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isCompleted}
      style={[styles.card, isCompleted && styles.cardCompleted]}
      testID="daily-challenge-card"
      accessibilityRole="button"
      accessibilityLabel={
        isCompleted
          ? `Daily challenge complete: ${theme.name}`
          : `Start daily challenge: ${theme.name}`
      }
    >
      {isCompleted ? (
        <CompletedChallengeContent
          emoji={theme.emoji}
          name={theme.name}
          completion={completion}
          colors={colors}
          styles={styles}
        />
      ) : (
        <ActiveChallengeContent
          name={theme.name}
          accuracyTarget={theme.goals.accuracyTarget}
          streakTarget={theme.goals.streakTarget}
          styles={styles}
          colors={colors}
        />
      )}
    </Pressable>
  );
}
