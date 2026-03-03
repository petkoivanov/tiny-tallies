import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X } from 'lucide-react-native';
import { colors, spacing, typography, layout } from '@/theme';
import { AnswerFeedbackAnimation } from '@/components/animations/AnswerFeedbackAnimation';
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

/** Get progress bar fill color based on session phase */
function getPhaseColor(phase: SessionPhase): string {
  switch (phase) {
    case 'warmup':
      return colors.primaryLight; // #818cf8, soft indigo
    case 'practice':
      return colors.primary; // #6366f1, full indigo
    case 'cooldown':
      return colors.correct; // #84cc16, lime green
    case 'complete':
      return colors.correct;
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
    selectedAnswer,
    correctAnswer,
    isComplete,
    score,
    handleAnswer,
    handleQuit,
    sessionResult,
  } = useSession();

  // Track whether to reveal the correct answer after wrong tap
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  // When feedback activates with incorrect answer, reveal correct after 500ms
  useEffect(() => {
    if (feedbackState && !feedbackState.correct) {
      const timer = setTimeout(() => {
        setShowCorrectAnswer(true);
      }, 500);
      return () => clearTimeout(timer);
    }
    // Reset when feedback clears
    setShowCorrectAnswer(false);
  }, [feedbackState]);

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
        leveledUp: sessionResult.feedback?.leveledUp ?? false,
        newLevel: sessionResult.feedback?.newLevel ?? 1,
        streakCount: sessionResult.feedback?.streakCount ?? 0,
      });
    }
  }, [isComplete, sessionResult, navigation]);

  const isFeedbackActive = feedbackState !== null;

  // Progress bar fill percentage: count current question as done when feedback is showing
  const progressDone = currentIndex + (feedbackState ? 1 : 0);
  const progressPercent = totalProblems > 0 ? (progressDone / totalProblems) * 100 : 0;

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

  /** Compute the style for an answer button based on feedback state */
  function getOptionFeedbackStyle(
    optionValue: number,
  ): object | undefined {
    if (!isFeedbackActive) return undefined;

    // The button the child tapped
    if (optionValue === selectedAnswer) {
      if (feedbackState!.correct) {
        return styles.optionButtonCorrect;
      }
      return styles.optionButtonIncorrect;
    }

    // Reveal the correct answer after delay (only on wrong answers)
    if (showCorrectAnswer && optionValue === correctAnswer) {
      return styles.optionButtonRevealCorrect;
    }

    return undefined;
  }

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

      {/* Progress Bar */}
      <View style={styles.progressBarContainer} testID="progress-bar">
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: getPhaseColor(sessionPhase),
              },
            ]}
            testID="progress-bar-fill"
          />
        </View>
      </View>

      {/* Problem Display */}
      <View style={styles.content}>
        {problem && (
          <Text style={styles.problemText}>
            {problem.operands[0]} {formatOperator(problem.operation)}{' '}
            {problem.operands[1]} = ?
          </Text>
        )}

        {/* Answer Options (2x2 grid) */}
        <View style={styles.optionsGrid}>
          {options.map((option, index) => (
            <AnswerFeedbackAnimation
              key={`option-${index}`}
              feedbackType={
                isFeedbackActive && option.value === selectedAnswer
                  ? feedbackState!.correct
                    ? 'correct'
                    : 'incorrect'
                  : null
              }
            >
              <Pressable
                onPress={() => handleAnswer(option.value)}
                disabled={isFeedbackActive}
                style={({ pressed }) => [
                  styles.optionButton,
                  pressed && !isFeedbackActive && styles.optionButtonPressed,
                  pressed && !isFeedbackActive && styles.optionButtonScaled,
                  isFeedbackActive && styles.optionButtonDisabled,
                  getOptionFeedbackStyle(option.value),
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Answer ${option.value}`}
                testID={`answer-option-${index}`}
              >
                <Text style={styles.optionText}>{option.value}</Text>
              </Pressable>
            </AnswerFeedbackAnimation>
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
  progressBarContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: layout.borderRadius.round,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: layout.borderRadius.round,
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonPressed: {
    backgroundColor: colors.surfaceLight,
  },
  optionButtonScaled: {
    transform: [{ scale: 0.95 }],
  },
  optionButtonDisabled: {
    opacity: 0.6,
  },
  optionButtonCorrect: {
    borderColor: colors.correct,
    backgroundColor: '#84cc1620',
    opacity: 1,
  },
  optionButtonIncorrect: {
    borderColor: colors.incorrect,
    backgroundColor: '#f8717120',
    opacity: 1,
  },
  optionButtonRevealCorrect: {
    borderColor: colors.correct,
    backgroundColor: '#84cc1620',
    opacity: 1,
  },
  optionText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xxl,
    color: colors.textPrimary,
  },
});
