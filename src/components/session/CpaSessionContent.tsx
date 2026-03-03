import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, layout } from '@/theme';
import { useCpaMode } from '@/hooks/useCpaMode';
import { AnswerFeedbackAnimation } from '@/components/animations/AnswerFeedbackAnimation';
import {
  Counters,
  TenFrame,
  BaseTenBlocks,
  NumberLine,
  FractionStrips,
  BarModel,
  ManipulativeShell,
} from '@/components/manipulatives';
import { ManipulativePanel } from './ManipulativePanel';
import { CompactAnswerRow } from './CompactAnswerRow';
import { PictorialDiagram } from './pictorial/PictorialDiagram';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';
import type { Problem } from '@/services/mathEngine/types';

/** Map ManipulativeType to its React component */
const MANIPULATIVE_COMPONENTS: Record<
  ManipulativeType,
  React.ComponentType<{ testID?: string }>
> = {
  counters: Counters,
  ten_frame: TenFrame,
  base_ten_blocks: BaseTenBlocks,
  number_line: NumberLine,
  fraction_strips: FractionStrips,
  bar_model: BarModel,
};

/** Human-readable labels for toggle button text */
const MANIPULATIVE_LABELS: Record<ManipulativeType, string> = {
  counters: 'counters',
  ten_frame: 'ten frame',
  base_ten_blocks: 'blocks',
  number_line: 'number line',
  fraction_strips: 'strips',
  bar_model: 'bar model',
};

interface AnswerOption {
  value: number;
  bugId?: string;
}

interface CpaSessionContentProps {
  problem: Problem;
  skillId: string;
  options: AnswerOption[];
  currentIndex: number;
  onAnswer: (value: number) => void;
  feedbackActive: boolean;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  showCorrectAnswer: boolean;
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

/**
 * CPA-branching renderer for session problems.
 *
 * Switches between concrete, pictorial, and abstract modes based on the
 * skill's CPA stage (resolved via useCpaMode hook):
 * - Concrete: auto-expanded ManipulativePanel with interactive manipulative
 * - Pictorial: inline static diagram + "Need help?" button for panel scaffolding
 * - Abstract: plain problem text + standard 2x2 answer grid
 */
export function CpaSessionContent({
  problem,
  skillId,
  options,
  currentIndex,
  onAnswer,
  feedbackActive,
  selectedAnswer,
  correctAnswer,
  showCorrectAnswer,
}: CpaSessionContentProps) {
  const { stage, manipulativeType } = useCpaMode(skillId);

  // Panel expansion state
  const [panelExpanded, setPanelExpanded] = useState(stage === 'concrete');
  // Tracks whether "Need help?" was activated in pictorial mode
  const [needHelpActive, setNeedHelpActive] = useState(false);

  // Reset panel state when problem advances or stage changes
  useEffect(() => {
    setPanelExpanded(stage === 'concrete');
    setNeedHelpActive(false);
  }, [currentIndex, stage]);

  const showPanel = stage === 'concrete' || needHelpActive;
  const isExpanded = panelExpanded;

  const handleTogglePanel = () => {
    setPanelExpanded((prev) => !prev);
  };

  const handleNeedHelp = () => {
    setNeedHelpActive(true);
    setPanelExpanded(true);
  };

  const manipulativeLabel = manipulativeType
    ? MANIPULATIVE_LABELS[manipulativeType]
    : undefined;

  // Render the manipulative component inside the panel
  const renderManipulative = () => {
    if (!manipulativeType) return null;
    const Component = MANIPULATIVE_COMPONENTS[manipulativeType];
    return <Component key={`manip-${currentIndex}`} testID="session-manipulative" />;
  };

  // Render answer buttons: compact row when panel expanded, standard 2x2 grid otherwise
  const renderAnswers = () => {
    if (isExpanded && showPanel) {
      return (
        <CompactAnswerRow
          options={options}
          onAnswer={onAnswer}
          feedbackActive={feedbackActive}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          showCorrectAnswer={showCorrectAnswer}
        />
      );
    }

    return (
      <View style={styles.optionsGrid}>
        {options.map((option, index) => (
          <AnswerFeedbackAnimation
            key={`option-${index}`}
            feedbackType={
              feedbackActive && option.value === selectedAnswer
                ? option.value === correctAnswer
                  ? 'correct'
                  : 'incorrect'
                : null
            }
          >
            <Pressable
              onPress={() => onAnswer(option.value)}
              disabled={feedbackActive}
              style={({ pressed }) => [
                styles.optionButton,
                pressed && !feedbackActive && styles.optionButtonPressed,
                pressed && !feedbackActive && styles.optionButtonScaled,
                feedbackActive && styles.optionButtonDisabled,
                getOptionFeedbackStyle(
                  option.value,
                  feedbackActive,
                  selectedAnswer,
                  correctAnswer,
                  showCorrectAnswer,
                ),
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
    );
  };

  return (
    <View style={styles.container}>
      {/* Problem Text */}
      <Text style={styles.problemText}>
        {problem.operands[0]} {formatOperator(problem.operation)}{' '}
        {problem.operands[1]} = ?
      </Text>

      {/* Pictorial Mode: inline diagram + "Need help?" */}
      {stage === 'pictorial' && manipulativeType && (
        <>
          <PictorialDiagram
            type={manipulativeType}
            problem={problem}
            testID="pictorial-diagram"
          />
          {!needHelpActive && (
            <Pressable
              onPress={handleNeedHelp}
              style={styles.needHelpButton}
              accessibilityRole="button"
              accessibilityLabel="Need help?"
              testID="need-help-button"
            >
              <Text style={styles.needHelpText}>Need help?</Text>
            </Pressable>
          )}
        </>
      )}

      {/* Answer Buttons */}
      {renderAnswers()}

      {/* Manipulative Panel (concrete mode or "Need help?" in pictorial) */}
      {showPanel && manipulativeType && (
        <ManipulativePanel
          expanded={isExpanded}
          onToggle={handleTogglePanel}
          manipulativeLabel={manipulativeLabel}
          testID="manipulative-panel"
        >
          <ManipulativeShell
            count={0}
            onReset={() => {}}
            testID="manipulative-shell"
          >
            {renderManipulative()}
          </ManipulativeShell>
        </ManipulativePanel>
      )}
    </View>
  );
}

/** Compute the feedback style for an answer button */
function getOptionFeedbackStyle(
  optionValue: number,
  feedbackActive: boolean,
  selectedAnswer: number | null,
  correctAnswer: number | null,
  showCorrectAnswer: boolean,
): object | undefined {
  if (!feedbackActive) return undefined;

  if (optionValue === selectedAnswer) {
    if (optionValue === correctAnswer) {
      return styles.optionButtonCorrect;
    }
    return styles.optionButtonIncorrect;
  }

  if (showCorrectAnswer && optionValue === correctAnswer) {
    return styles.optionButtonRevealCorrect;
  }

  return undefined;
}

const styles = StyleSheet.create({
  container: {
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
  needHelpButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  needHelpText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.primaryLight,
    textDecorationLine: 'underline',
  },
});
