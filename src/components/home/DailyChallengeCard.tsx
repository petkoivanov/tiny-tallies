import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { getTodaysChallenge, getTodayDateKey } from '@/services/challenge';
import type { ChallengeCompletion } from '@/services/challenge';
import type { ThemeColors } from '@/theme';

function ActiveChallengeContent({
  emoji,
  name,
  accuracyTarget,
  streakTarget,
  styles,
}: {
  emoji: string;
  name: string;
  accuracyTarget: number;
  streakTarget: number;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>Daily Challenge</Text>
        </View>
      </View>
      <Text style={styles.goalText}>
        Get {accuracyTarget}/10 correct and {streakTarget} in a row!
      </Text>
      <Text style={styles.statusText}>Let's go!</Text>
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
          emoji={theme.emoji}
          name={theme.name}
          accuracyTarget={theme.goals.accuracyTarget}
          streakTarget={theme.goals.streakTarget}
          styles={styles}
        />
      )}
    </Pressable>
  );
}
