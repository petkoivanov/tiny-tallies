import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme, spacing, typography, layout } from '@/theme';
import { setsEqual } from '@/services/mathEngine/types';
import type { ChoiceOption } from '@/services/mathEngine/answerFormats/types';

interface MultiSelectMCProps {
  options: readonly (ChoiceOption & { label?: string })[];
  correctIndices: readonly number[];
  onAnswer: (correct: boolean) => void;
}

export function MultiSelectMC({
  options,
  correctIndices,
  onAnswer,
}: MultiSelectMCProps) {
  const { colors } = useTheme();
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  function toggleOption(index: number) {
    if (submitted) return;
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function handleCheck() {
    if (selectedIndices.size === 0 || submitted) return;
    const selected = Array.from(selectedIndices).sort((a, b) => a - b);
    const correct = setsEqual(selected, [...correctIndices]);
    setSubmitted(true);
    onAnswer(correct);
  }

  const isCheckDisabled = selectedIndices.size === 0 || submitted;

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = selectedIndices.has(index);
        const isCorrect = correctIndices.includes(index);
        const isIncorrectSelected = submitted && isSelected && !isCorrect;

        let optionTestId: string;
        if (submitted && isCorrect) {
          optionTestId = `multiselectmc-option-${index}-correct`;
        } else if (isIncorrectSelected) {
          optionTestId = `multiselectmc-option-${index}-incorrect`;
        } else if (isSelected) {
          optionTestId = `multiselectmc-option-${index}-selected`;
        } else {
          optionTestId = `multiselectmc-option-${index}`;
        }

        const optionStyle = [
          styles.option,
          {
            backgroundColor: colors.surface,
            borderColor: colors.primaryLight + '40',
          },
          isSelected && !submitted && {
            borderColor: colors.primaryLight,
            backgroundColor: colors.primaryLight + '20',
          },
          submitted && isCorrect && {
            borderColor: colors.correct,
            backgroundColor: colors.correct + '30',
          },
          isIncorrectSelected && {
            borderColor: colors.incorrect,
            backgroundColor: colors.incorrect + '30',
          },
        ];

        const label = option.label ?? String(option.value);

        return (
          <Pressable
            key={index}
            testID={optionTestId}
            style={optionStyle}
            onPress={() => toggleOption(index)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
          >
            <View style={styles.checkboxRow}>
              <View
                style={[
                  styles.checkbox,
                  { borderColor: colors.primaryLight },
                  isSelected && { backgroundColor: colors.primaryLight },
                  submitted && isCorrect && { backgroundColor: colors.correct, borderColor: colors.correct },
                  isIncorrectSelected && { backgroundColor: colors.incorrect, borderColor: colors.incorrect },
                ]}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: colors.textPrimary },
                ]}
              >
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}

      <Pressable
        testID="multiselectmc-check-button"
        style={[
          styles.checkButton,
          {
            backgroundColor: isCheckDisabled
              ? colors.surface
              : colors.primaryLight,
            opacity: isCheckDisabled ? 0.4 : 1,
          },
        ]}
        onPress={handleCheck}
        disabled={isCheckDisabled}
        accessibilityRole="button"
        accessibilityLabel="Check answers"
        accessibilityState={{ disabled: isCheckDisabled }}
      >
        <Text
          style={[
            styles.checkButtonText,
            {
              color: isCheckDisabled ? colors.textSecondary : '#fff',
            },
          ]}
        >
          Check
        </Text>
      </Pressable>
    </View>
  );
}

export default MultiSelectMC;

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  option: {
    borderRadius: layout.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
  },
  optionText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
  },
  checkButton: {
    borderRadius: layout.borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
  },
});
