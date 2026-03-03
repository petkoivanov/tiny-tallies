import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  CommonActions,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Flame, Check } from 'lucide-react-native';
import { colors, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { calculateLevelFromXp } from '@/services/gamification/levelProgression';
import type { RootStackParamList } from '@/navigation/types';

type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>;

/** Format duration in milliseconds to "Xm Ys" display */
function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

/** Dynamic motivational message based on score percentage */
function getMotivationalMessage(scorePercent: number): string {
  if (scorePercent >= 90) return 'Amazing!';
  if (scorePercent >= 70) return 'Great job!';
  return 'Nice effort!';
}

/** Color for the motivational message based on score percentage */
function getMotivationalColor(scorePercent: number): string {
  if (scorePercent >= 90) return colors.correct;
  if (scorePercent >= 70) return colors.primaryLight;
  return colors.textPrimary;
}

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<ResultsRouteProp>();

  const { score, total, xpEarned, durationMs, leveledUp, newLevel, streakCount } =
    route.params;

  const xp = useAppStore((state) => state.xp);

  const { level, xpIntoCurrentLevel, xpNeededForNextLevel } =
    calculateLevelFromXp(xp);

  const scorePercent = total > 0 ? (score / total) * 100 : 0;
  const motivationalMessage = getMotivationalMessage(scorePercent);
  const motivationalColor = getMotivationalColor(scorePercent);

  const progressFraction =
    xpNeededForNextLevel > 0
      ? xpIntoCurrentLevel / xpNeededForNextLevel
      : 0;
  const progressPercent = Math.min(progressFraction * 100, 100);

  const handleDone = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      }),
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.content}>
        {/* Motivational Message */}
        <Text
          style={[styles.motivationalMessage, { color: motivationalColor }]}
          testID="motivational-message"
        >
          {motivationalMessage}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Session Complete!</Text>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          {/* Score Row */}
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.scoreText}>
              <Text style={styles.scoreCorrect}>{score}</Text>
              <Text style={styles.scoreSeparator}> / </Text>
              <Text>{total}</Text>
            </Text>
          </View>

          <View style={styles.divider} />

          {/* XP Earned Row */}
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>XP Earned</Text>
            <Text style={styles.xpText}>+{xpEarned} XP</Text>
          </View>

          <View style={styles.divider} />

          {/* XP Progress Bar Row */}
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

          {/* Streak Row */}
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

          {/* Level Up Callout (conditional) */}
          {leveledUp && (
            <>
              <View style={styles.divider} />
              <View style={styles.levelUpRow} testID="level-up-callout">
                <Text style={styles.levelUpText}>
                  Level Up! {'\u2192'} Level {newLevel}
                </Text>
              </View>
            </>
          )}

          <View style={styles.divider} />

          {/* Time Row */}
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.timeText}>{formatDuration(durationMs)}</Text>
          </View>
        </View>

        {/* Done Button */}
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
    </View>
  );
}

const styles = StyleSheet.create({
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
  levelUpRow: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  levelUpText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.primaryLight,
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
});
