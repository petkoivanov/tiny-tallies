import React, { useEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, X } from 'lucide-react-native';
import { colors, spacing, typography, layout } from '@/theme';
import { useSession } from '@/hooks/useSession';
import type { RootStackParamList } from '@/navigation/types';
import type { SessionPhase } from '@/services/session';

type SessionNavProp = NativeStackNavigationProp<RootStackParamList, 'Session'>;

/** Capitalize and format session phase label for the header */
function formatPhaseLabel(phase: SessionPhase): string {
  switch (phase) {
    case 'warmup':
      return 'Warmup';
    case 'practice':
      return 'Practice';
    case 'cooldown':
      return 'Cooldown';
    case 'complete':
      return 'Complete';
  }
}

/** Format operator symbol from operation type */
function formatOperator(operation: string): string {
  switch (operation) {
    case 'addition':
      return '+';
    case 'subtraction':
      return '\u2212';
    default:
      return operation;
  }
}

export default function SessionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SessionNavProp>();

  const {
    currentProblem,
    currentIndex,
    totalProblems,
    sessionPhase,
    feedbackState,
    isComplete,
    score,
    handleAnswer,
    handleQuit,
    sessionResult,
  } = useSession();

  // Prevent back navigation while session is active
  const isSessionActive = !isComplete;
  usePreventRemove(isSessionActive, ({ data }) => {
    Alert.alert(
      'Quit Practice?',
      "Are you sure? Your progress won't be saved.",
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            handleQuit();
            navigation.dispatch(data.action);
          },
        },
      ],
    );
  });

  // Navigate to Results when session completes
  useEffect(() => {
    if (isComplete && sessionResult) {
      navigation.navigate('Results', {
        sessionId: String(Date.now()),
        score: sessionResult.score,
        total: sessionResult.total,
        xpEarned: sessionResult.xpEarned,
        durationMs: sessionResult.durationMs,
      });
    }
  }, [isComplete, sessionResult, navigation]);

  const isFeedbackActive = feedbackState !== null;

  // Loading state (should not happen due to synchronous init, but defensive)
  if (!currentProblem && !isComplete) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.content}>
          <Text style={styles.problemText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const problem = currentProblem?.problem;
  const options = currentProblem?.presentation.options ?? [];

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.phaseLabel}>{formatPhaseLabel(sessionPhase)}</Text>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {totalProblems}
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.quitButton}
          accessibilityRole="button"
          accessibilityLabel="Quit session"
          testID="quit-button"
        >
          <X size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Problem Display */}
      <View style={styles.content}>
        {problem && (
          <Text style={styles.problemText}>
            {problem.operands[0]} {formatOperator(problem.operation)}{' '}
            {problem.operands[1]} = ?
          </Text>
        )}

        {/* Feedback Indicator */}
        {feedbackState && (
          <View style={styles.feedbackContainer} testID="feedback-indicator">
            {feedbackState.correct ? (
              <Check
                size={48}
                color={colors.correct}
                testID="feedback-correct"
              />
            ) : (
              <X
                size={48}
                color={colors.incorrect}
                testID="feedback-incorrect"
              />
            )}
            <Text
              style={[
                styles.feedbackText,
                {
                  color: feedbackState.correct
                    ? colors.correct
                    : colors.incorrect,
                },
              ]}
            >
              {feedbackState.correct ? 'Correct!' : 'Not quite'}
            </Text>
          </View>
        )}

        {/* Answer Options (2x2 grid) */}
        <View style={styles.optionsGrid}>
          {options.map((option, index) => (
            <Pressable
              key={`option-${index}`}
              onPress={() => handleAnswer(option.value)}
              disabled={isFeedbackActive}
              style={({ pressed }) => [
                styles.optionButton,
                pressed && !isFeedbackActive && styles.optionButtonPressed,
                isFeedbackActive && styles.optionButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Answer ${option.value}`}
              testID={`answer-option-${index}`}
            >
              <Text style={styles.optionText}>{option.value}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  phaseLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    minWidth: 80,
  },
  progressText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
  },
  quitButton: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  problemText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.display,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  feedbackContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  feedbackText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    marginTop: spacing.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
    maxWidth: 320,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.lg,
    minHeight: layout.minTouchTarget + 16,
    minWidth: 140,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  optionButtonPressed: {
    backgroundColor: colors.surfaceLight,
  },
  optionButtonDisabled: {
    opacity: 0.6,
  },
  optionText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xxl,
    color: colors.textPrimary,
  },
});
