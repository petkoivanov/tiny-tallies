import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  CommonActions,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, layout } from '@/theme';
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

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<ResultsRouteProp>();

  const { score, total, xpEarned, durationMs } = route.params;

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
        {/* Title */}
        <Text style={styles.title}>Session Complete!</Text>

        {/* Score Card */}
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

          <View style={styles.divider} />

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
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxl,
    color: colors.textPrimary,
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
