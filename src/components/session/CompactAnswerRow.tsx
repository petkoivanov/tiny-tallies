import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

import { useTheme, spacing, typography, layout } from '@/theme';

interface AnswerOption {
  readonly value: number;
  readonly bugId?: string;
}

interface CompactAnswerRowProps {
  options: readonly AnswerOption[];
  onAnswer: (value: number) => void;
  feedbackActive: boolean;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  showCorrectAnswer: boolean;
  boostHighlightAnswer?: number | null;
}

/**
 * Horizontal 4-button answer layout for ManipulativePanel-expanded mode.
 *
 * Uses flex:1 per button instead of AnswerFeedbackAnimation's width:'45%'
 * to fit 4 buttons in a single row. Includes inline feedback animations
 * (bounce for correct, shake for incorrect) replicated from AnswerFeedbackAnimation.
 */
export function CompactAnswerRow({
  options,
  onAnswer,
  feedbackActive,
  selectedAnswer,
  correctAnswer,
  showCorrectAnswer,
  boostHighlightAnswer = null,
}: CompactAnswerRowProps) {
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    buttonWrapper: {
      flex: 1,
    },
    button: {
      flex: 1,
      minHeight: layout.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: layout.borderRadius.md,
      borderWidth: 2,
      borderColor: 'transparent',
      paddingVertical: spacing.sm,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonCorrect: {
      borderColor: colors.correct,
      backgroundColor: '#84cc1620',
      opacity: 1,
    },
    buttonIncorrect: {
      borderColor: colors.incorrect,
      backgroundColor: '#f8717120',
      opacity: 1,
    },
    buttonRevealCorrect: {
      borderColor: colors.correct,
      backgroundColor: '#84cc1620',
      opacity: 1,
    },
    buttonBoostHighlight: {
      borderColor: '#a78bfa',
      borderWidth: 3,
      backgroundColor: '#a78bfa20',
    },
    buttonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.textPrimary,
    },
  }), [colors]);

  return (
    <View style={styles.row}>
      {options.map((option, index) => (
        <CompactAnswerButton
          key={`compact-${index}`}
          option={option}
          index={index}
          onAnswer={onAnswer}
          feedbackActive={feedbackActive}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          showCorrectAnswer={showCorrectAnswer}
          boostHighlightAnswer={boostHighlightAnswer}
          styles={styles}
        />
      ))}
    </View>
  );
}

interface CompactAnswerButtonProps {
  option: AnswerOption;
  index: number;
  onAnswer: (value: number) => void;
  feedbackActive: boolean;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  showCorrectAnswer: boolean;
  boostHighlightAnswer?: number | null;
  styles: ReturnType<typeof StyleSheet.create>;
}

function CompactAnswerButton({
  option,
  index,
  onAnswer,
  feedbackActive,
  selectedAnswer,
  correctAnswer,
  showCorrectAnswer,
  boostHighlightAnswer = null,
  styles,
}: CompactAnswerButtonProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);

  const isSelected = feedbackActive && option.value === selectedAnswer;
  const isCorrectSelection = isSelected && option.value === correctAnswer;
  const isIncorrectSelection = isSelected && option.value !== correctAnswer;
  const isRevealedCorrect =
    feedbackActive &&
    showCorrectAnswer &&
    option.value === correctAnswer &&
    option.value !== selectedAnswer;

  const isBoostHighlighted =
    boostHighlightAnswer !== null &&
    option.value === boostHighlightAnswer &&
    !feedbackActive;

  // Boost highlight pulse animation
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (isBoostHighlighted) {
      pulseOpacity.value = withRepeat(
        withTiming(0.6, { duration: 800 }),
        -1,
        true,
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [isBoostHighlighted, pulseOpacity]);

  useEffect(() => {
    if (isCorrectSelection) {
      scale.value = withSequence(
        withSpring(1.1, { damping: 4, stiffness: 300 }),
        withSpring(1.0, { damping: 8 }),
      );
    } else if (isIncorrectSelection) {
      translateX.value = withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    } else {
      scale.value = 1;
      translateX.value = 0;
    }
  }, [
    isCorrectSelection,
    isIncorrectSelection,
    scale,
    translateX,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
    opacity: pulseOpacity.value,
  }));

  function getFeedbackStyle() {
    if (isCorrectSelection) return styles.buttonCorrect;
    if (isIncorrectSelection) return styles.buttonIncorrect;
    if (isRevealedCorrect) return styles.buttonRevealCorrect;
    if (isBoostHighlighted) return styles.buttonBoostHighlight;
    return undefined;
  }

  return (
    <Animated.View style={[styles.buttonWrapper, animatedStyle]}>
      <Pressable
        onPress={() => !feedbackActive && onAnswer(option.value)}
        disabled={feedbackActive}
        style={[
          styles.button,
          feedbackActive && styles.buttonDisabled,
          getFeedbackStyle(),
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Answer ${option.value}`}
        testID={`compact-answer-${index}`}
      >
        <Text style={styles.buttonText}>{option.value}</Text>
      </Pressable>
    </Animated.View>
  );
}
