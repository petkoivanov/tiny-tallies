import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useCpaMode } from '@/hooks/useCpaMode';
import { AnswerFeedbackAnimation } from '@/components/animations/AnswerFeedbackAnimation';
import { MathQuestionDisplay, hasFractionNotation } from './MathQuestionDisplay';
import {
  Counters,
  BaseTenBlocks,
  NumberLine,
  FractionStrips,
  BarModel,
} from '@/components/manipulatives';
import { ManipulativePanel } from './ManipulativePanel';
import { CompactAnswerRow } from './CompactAnswerRow';
import { NumberPad } from './NumberPad';
import { PictorialDiagram } from './pictorial/PictorialDiagram';
import { AnalogClock, clockDetailForSkill } from './AnalogClock';
import { CoinDisplay, shouldShowCoins } from './CoinDisplay';
import { Check, Lightbulb, X as XIcon } from 'lucide-react-native';
import { NarrateButton } from './NarrateButton';
import { GraphDisplay } from './graphs';
import { getNextGuidedStep } from '@/services/cpa';
import { getPrimaryManipulative } from '@/services/cpa/skillManipulativeMap';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';
import type { Problem } from '@/services/mathEngine/types';
import type { FormattedProblem } from '@/services/mathEngine/answerFormats/types';
import { parseIntegerInput, parseDecimalInput } from '@/services/mathEngine/answerFormats';

/** Session-supported manipulative types (ten_frame excluded — sandbox only) */
type SessionManipulative = Exclude<ManipulativeType, 'ten_frame'>;

/** Map ManipulativeType to its React component */
const MANIPULATIVE_COMPONENTS: Record<
  SessionManipulative,
  React.ComponentType<{ testID?: string; guidedTargetId?: string | null }>
> = {
  counters: Counters,
  base_ten_blocks: BaseTenBlocks,
  number_line: NumberLine,
  fraction_strips: FractionStrips,
  bar_model: BarModel,
};

/** Human-readable labels for toggle button text */
const MANIPULATIVE_LABELS: Record<SessionManipulative, string> = {
  counters: 'counters',
  base_ten_blocks: 'blocks',
  number_line: 'number line',
  fraction_strips: 'strips',
  bar_model: 'bar model',
};

interface AnswerOption {
  readonly value: number;
  readonly bugId?: string;
}

interface CpaSessionContentProps {
  problem: Problem;
  skillId: string;
  presentation: FormattedProblem;
  currentIndex: number;
  onAnswer: (value: number) => void;
  feedbackActive: boolean;
  feedbackCorrect: boolean | null;
  onDismissFeedback: () => void;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  showCorrectAnswer: boolean;
  chatOpen?: boolean;
  teachExpand?: boolean;
  boostHighlightAnswer?: number | null;
}

/**
 * CPA-branching renderer for session problems.
 *
 * All modes show the problem text, answer buttons, and a "Need help?" link.
 * Tapping "Need help?" opens the ManipulativePanel with the skill's primary
 * manipulative. Pictorial mode also shows an inline diagram above the answers.
 */
export function CpaSessionContent({
  problem,
  skillId,
  presentation,
  currentIndex,
  onAnswer,
  feedbackActive,
  feedbackCorrect,
  onDismissFeedback,
  selectedAnswer,
  correctAnswer,
  showCorrectAnswer,
  chatOpen,
  teachExpand = false,
  boostHighlightAnswer = null,
}: CpaSessionContentProps) {
  const isFreeText = presentation.format === 'free_text';
  const options: readonly AnswerOption[] = presentation.format === 'multiple_choice'
    ? presentation.options
    : [];
  const { colors } = useTheme();
  const { stage, manipulativeType } = useCpaMode(skillId);

  // Resolve a manipulative for scaffolding, even in abstract mode
  const scaffoldManipulative = manipulativeType ?? getPrimaryManipulative(skillId);

  // Panel state — always collapsed by default; kids tap "Need help?" to open
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [needHelpActive, setNeedHelpActive] = useState(false);

  // Guided mode state -- only populated after help is activated
  const [guidedTargetId, setGuidedTargetId] = useState<string | null>(null);
  const [guidedHintText, setGuidedHintText] = useState<string | null>(null);

  // Reset panel state when problem advances or stage changes
  useEffect(() => {
    setPanelExpanded(false);
    setNeedHelpActive(false);
  }, [currentIndex, stage]);

  // Collapse ManipulativePanel when chat opens to avoid visual overlap
  useEffect(() => {
    if (chatOpen) {
      setPanelExpanded(false);
    }
  }, [chatOpen]);

  // TEACH mode: force panel expansion when tutor signals
  useEffect(() => {
    if (teachExpand) {
      setPanelExpanded(true);
    }
  }, [teachExpand]);

  // Compute guided step only after help is activated
  useEffect(() => {
    if (needHelpActive && scaffoldManipulative) {
      const step = getNextGuidedStep(
        problem.operation,
        scaffoldManipulative,
        problem.operands as [number, number],
        0, // Initial count -- manipulative starts fresh each problem
      );
      setGuidedTargetId(step?.targetId ?? null);
      setGuidedHintText(step?.hintText ?? null);
    } else {
      setGuidedTargetId(null);
      setGuidedHintText(null);
    }
  }, [needHelpActive, scaffoldManipulative, problem, currentIndex]);

  const showPanel = needHelpActive;
  const isExpanded = panelExpanded;

  const handleTogglePanel = () => {
    setPanelExpanded((prev) => !prev);
  };

  const handleNeedHelp = () => {
    setNeedHelpActive(true);
    setPanelExpanded(true);
  };

  const manipulativeLabel = scaffoldManipulative && scaffoldManipulative in MANIPULATIVE_LABELS
    ? MANIPULATIVE_LABELS[scaffoldManipulative as SessionManipulative]
    : undefined;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    topSpacer: {
      flex: 1,
      minHeight: spacing.lg,
    },
    bottomSpacer: {
      height: spacing.xl,
    },
    problemText: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.display,
      color: colors.textPrimary,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
    problemTextSmall: {
      fontSize: typography.fontSize.xxl,
    },
    wordProblemText: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.lg,
      color: colors.textPrimary,
      textAlign: 'left',
      lineHeight: typography.fontSize.lg * 1.5,
    },
    wordProblemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      width: '100%',
      marginBottom: spacing.xl,
    },
    wordProblemScroll: {
      maxHeight: 160,
      flex: 1,
      paddingHorizontal: spacing.sm,
    },
    wordProblemScrollContent: {
      paddingVertical: spacing.sm,
    },
    floatingNarrate: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      zIndex: 5,
    },
    inlineVisual: {
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    problemTextWrap: {
      marginBottom: spacing.xl,
      alignItems: 'center',
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm,
      width: '100%',
    },
    optionButton: {
      backgroundColor: colors.surface,
      borderRadius: layout.borderRadius.lg,
      minHeight: layout.minTouchTarget + 8,
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
    optionButtonBoostHighlight: {
      borderColor: '#a78bfa',
      borderWidth: 3,
      backgroundColor: '#a78bfa20',
    },
    optionText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.xxl,
      color: colors.textPrimary,
    },
    needHelpButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      minHeight: 48,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      marginTop: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: layout.borderRadius.round,
      borderWidth: 1,
      borderColor: colors.primaryLight + '40',
    },
    needHelpText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.primaryLight,
    },
    guidedHint: {
      marginBottom: spacing.sm,
      alignItems: 'center',
    },
    guidedHintText: {
      fontSize: typography.fontSize.sm,
      color: colors.primaryLight,
      fontFamily: typography.fontFamily.medium,
    },
    feedbackRow: {
      alignItems: 'center',
      marginTop: spacing.md,
      gap: spacing.md,
    },
    feedbackIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    feedbackIconCorrect: {
      backgroundColor: colors.correct,
    },
    feedbackIconIncorrect: {
      backgroundColor: colors.incorrect,
    },
    correctAnswerText: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.lg,
      color: colors.correct,
    },
    nextButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xl,
      backgroundColor: colors.primary,
      borderRadius: layout.borderRadius.md,
      minHeight: layout.minTouchTarget,
      justifyContent: 'center',
      alignItems: 'center',
    },
    nextButtonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: '#fff',
    } as TextStyle,
  }), [colors]);

  // Render the manipulative component inside the panel
  const renderManipulative = () => {
    if (!scaffoldManipulative) return null;
    const targetId = stage === 'concrete' ? guidedTargetId : null;

    // Counters: pass problem data for scaffolded mode (counting-on / take-away)
    if (scaffoldManipulative === 'counters') {
      return (
        <Counters
          key={`manip-${currentIndex}`}
          guidedTargetId={targetId}
          problemOperands={problem.operands}
          problemOperation={problem.operation as 'addition' | 'subtraction'}
          testID="session-manipulative"
        />
      );
    }

    // Skip unsupported manipulatives (e.g. ten_frame — sandbox only)
    if (!(scaffoldManipulative in MANIPULATIVE_COMPONENTS)) return null;
    const Component = MANIPULATIVE_COMPONENTS[scaffoldManipulative as SessionManipulative];
    return (
      <Component
        key={`manip-${currentIndex}`}
        guidedTargetId={targetId}
        testID="session-manipulative"
      />
    );
  };

  /** Compute the feedback style for an answer button */
  function getOptionFeedbackStyle(
    optionValue: number,
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

  const allowDecimal = presentation.format === 'free_text' && presentation.allowDecimal;

  const handleFreeTextSubmit = (value: string) => {
    const parsed = allowDecimal ? parseDecimalInput(value) : parseIntegerInput(value);
    if (parsed !== null) {
      onAnswer(parsed);
    }
  };

  // Render answer input: NumberPad for free-text, MC buttons otherwise
  const renderAnswers = () => {
    if (isFreeText) {
      return (
        <NumberPad
          onSubmit={handleFreeTextSubmit}
          maxDigits={presentation.format === 'free_text' ? presentation.maxDigits : 5}
          showDecimal={presentation.format === 'free_text' && presentation.allowDecimal}
          onShowMe={!needHelpActive && scaffoldManipulative ? handleNeedHelp : undefined}
        />
      );
    }

    if (isExpanded && showPanel) {
      return (
        <CompactAnswerRow
          options={options}
          onAnswer={onAnswer}
          feedbackActive={feedbackActive}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          showCorrectAnswer={showCorrectAnswer}
          boostHighlightAnswer={boostHighlightAnswer}
        />
      );
    }

    // 2 rows: 4 → 2+2, 5 → 3+2, 6 → 3+3
    const perRow = Math.ceil(options.length / 2);
    const itemWidth = `${Math.floor(100 / perRow) - 2}%` as const;

    return (
      <View style={styles.optionsGrid}>
        {options.map((option, index) => {
          const isBoostHighlighted =
            boostHighlightAnswer !== null &&
            option.value === boostHighlightAnswer;

          return (
            <AnswerFeedbackAnimation
              key={`option-${index}`}
              style={{ width: itemWidth }}
              feedbackType={
                feedbackActive && option.value === selectedAnswer
                  ? option.value === correctAnswer
                    ? 'correct'
                    : 'incorrect'
                  : null
              }
            >
              <BoostHighlightWrapper active={isBoostHighlighted && !feedbackActive}>
                <Pressable
                  onPress={() => onAnswer(option.value)}
                  disabled={feedbackActive}
                  style={({ pressed }) => [
                    styles.optionButton,
                    pressed && !feedbackActive && styles.optionButtonPressed,
                    pressed && !feedbackActive && styles.optionButtonScaled,
                    feedbackActive && styles.optionButtonDisabled,
                    isBoostHighlighted &&
                      !feedbackActive &&
                      styles.optionButtonBoostHighlight,
                    getOptionFeedbackStyle(option.value),
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Answer ${option.value}`}
                  testID={`answer-option-${index}`}
                >
                  <Text style={styles.optionText}>{option.value}</Text>
                </Pressable>
              </BoostHighlightWrapper>
            </AnswerFeedbackAnimation>
          );
        })}
      </View>
    );
  };

  const isLongQuestion = problem.questionText.length > 30;
  const isWordProblem = problem.metadata.wordProblem === true;
  const isFractionQuestion = problem.operation === 'fractions' && hasFractionNotation(problem.questionText);

  // Inline visuals for time and money problems
  const showClock = problem.operation === 'time' && problem.metadata.displayTime != null;
  const showCoins = shouldShowCoins(problem.skillId) && problem.metadata.coinSet != null;

  const renderQuestionText = () => {
    if (isFractionQuestion) {
      return (
        <View style={styles.problemTextWrap}>
          <MathQuestionDisplay
            questionText={problem.questionText}
            isLong={isLongQuestion}
          />
        </View>
      );
    }

    const textStyle = isWordProblem
      ? styles.wordProblemText
      : [styles.problemText, isLongQuestion && styles.problemTextSmall];

    return <Text style={textStyle}>{problem.questionText}</Text>;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top spacer — centers problem + answers when content fits */}
        <View style={styles.topSpacer} />

        {/* Inline visuals: clock for time problems, coins for money problems */}
        {showClock && (
          <View style={styles.inlineVisual}>
            <AnalogClock
              hours={problem.metadata.displayTime!.hours}
              minutes={problem.metadata.displayTime!.minutes}
              detail={clockDetailForSkill(skillId)}
              size={180}
            />
          </View>
        )}
        {showCoins && (
          <View style={styles.inlineVisual}>
            <CoinDisplay coinSet={problem.metadata.coinSet!} />
          </View>
        )}
        {problem.metadata.graphData && (
          <View style={styles.inlineVisual}>
            <GraphDisplay
              data={problem.metadata.graphData}
              testID="session-graph"
            />
          </View>
        )}

        {/* Problem Text — word problems get a scrollable container */}
        {isWordProblem ? (
          <View style={styles.wordProblemRow}>
            <ScrollView
              style={styles.wordProblemScroll}
              contentContainerStyle={styles.wordProblemScrollContent}
              showsVerticalScrollIndicator
              nestedScrollEnabled
            >
              {renderQuestionText()}
            </ScrollView>
          </View>
        ) : (
          renderQuestionText()
        )}

        {/* Pictorial Mode: inline diagram */}
        {stage === 'pictorial' && scaffoldManipulative && (
          <PictorialDiagram
            type={scaffoldManipulative}
            problem={problem}
            testID="pictorial-diagram"
          />
        )}

        {/* Answer Buttons */}
        {renderAnswers()}

        {/* Feedback icon + Next button on wrong answers */}
        {feedbackActive && feedbackCorrect !== null && (
          <View style={styles.feedbackRow} testID="feedback-row">
            <View
              style={[
                styles.feedbackIcon,
                feedbackCorrect
                  ? styles.feedbackIconCorrect
                  : styles.feedbackIconIncorrect,
              ]}
            >
              {feedbackCorrect ? (
                <Check size={28} color="#fff" strokeWidth={3} />
              ) : (
                <XIcon size={28} color="#fff" strokeWidth={3} />
              )}
            </View>
            {!feedbackCorrect && correctAnswer !== null && (
              <Text style={styles.correctAnswerText} testID="correct-answer-reveal">
                Answer: {correctAnswer}
              </Text>
            )}
            {!feedbackCorrect && (
              <Pressable
                onPress={onDismissFeedback}
                style={styles.nextButton}
                accessibilityRole="button"
                accessibilityLabel="Next question"
                testID="next-button"
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* "Show me!" button — all modes, before panel is activated */}
        {!needHelpActive && !isFreeText && scaffoldManipulative && (
          <Pressable
            onPress={handleNeedHelp}
            style={styles.needHelpButton}
            accessibilityRole="button"
            accessibilityLabel="Show me how"
            testID="need-help-button"
          >
            <GlowingLightbulb />
            <Text style={styles.needHelpText}>Show me!</Text>
          </Pressable>
        )}

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Guided hint text (above panel, no overlap with answers) */}
      {guidedHintText && showPanel && (
        <View style={styles.guidedHint}>
          <Text style={styles.guidedHintText}>{guidedHintText}</Text>
        </View>
      )}

      {/* Floating narrate button */}
      <NarrateButton
        text={problem.questionText}
        resetKey={currentIndex}
        primaryColor={colors.primary}
        primaryLightColor={colors.primaryLight}
        style={styles.floatingNarrate}
      />

      {/* Manipulative Panel (any mode, after "Need help?" activated) */}
      {showPanel && scaffoldManipulative && (
        <ManipulativePanel
          expanded={isExpanded}
          onToggle={handleTogglePanel}
          manipulativeLabel={manipulativeLabel}
          testID="manipulative-panel"
        >
          {renderManipulative()}
        </ManipulativePanel>
      )}
    </View>
  );
}

/**
 * Wrapper that applies a subtle pulsing opacity animation to boost-highlighted
 * answer buttons, drawing the child's attention to the revealed correct answer.
 */
function BoostHighlightWrapper({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (active) {
      pulseOpacity.value = withRepeat(
        withTiming(0.6, { duration: 800 }),
        -1,
        true,
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [active, pulseOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  if (!active) return <>{children}</>;

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

/** Pulsing yellow lightbulb icon for the "Show me!" button. */
function GlowingLightbulb() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Lightbulb size={32} color="#f5c542" fill="#f5c54240" />
    </Animated.View>
  );
}
