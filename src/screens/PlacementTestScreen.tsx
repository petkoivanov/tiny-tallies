/**
 * PlacementTestScreen — CAT-driven adaptive placement test.
 *
 * Generates math problems using the IRT 2PL model, estimates student ability
 * via EAP, and selects items using Fisher information. The test adapts in
 * real-time and terminates when the ability estimate converges (SE < 0.30)
 * or after 20 items maximum.
 *
 * On completion, stores placement results and optionally seeds skill Elo ratings.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import {
  buildItemBank,
  createCatSession,
  getNextItem,
  recordResponse,
  getCatResults,
  computePlacementElos,
} from '@/services/cat';
import type { CatState, IrtItem } from '@/services/cat';
import { generateProblem } from '@/services/mathEngine/generator';
import { getTemplatesBySkill } from '@/services/mathEngine/templates';
import type { Problem } from '@/services/mathEngine/types';
import { answerNumericValue } from '@/services/mathEngine/types';
import { CharacterReaction } from '@/components/animations/CharacterReaction';
import { AppDialog } from '@/components/AppDialog';
import { SKILLS } from '@/services/mathEngine/skills';

type PlacementPhase = 'intro' | 'testing' | 'complete';

interface PlacementProblem {
  problem: Problem;
  item: IrtItem;
}

export default function PlacementTestScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();

  const avatarId = useAppStore((s) => s.avatarId);
  const completePlacement = useAppStore((s) => s.completePlacement);
  const updateSkillState = useAppStore((s) => s.updateSkillState);

  const [phase, setPhase] = useState<PlacementPhase>('intro');
  const [quitDialogVisible, setQuitDialogVisible] = useState(false);

  // CAT state
  const itemPool = useRef(buildItemBank());
  const catState = useRef<CatState>(createCatSession());
  const [currentProblem, setCurrentProblem] = useState<PlacementProblem | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedbackReaction, setFeedbackReaction] = useState<'correct' | 'incorrect' | 'idle' | null>('idle');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Results
  const [results, setResults] = useState<{
    grade: number;
    accuracy: number;
    totalItems: number;
  } | null>(null);

  /** Generate a math problem for the given IRT item */
  const generateForItem = useCallback((item: IrtItem): PlacementProblem | null => {
    const templates = getTemplatesBySkill(item.skillId);
    if (templates.length === 0) return null;
    const seed = Date.now() + Math.floor(Math.random() * 10000);
    const problem = generateProblem({ templateId: templates[0].id, seed });
    return { problem, item };
  }, []);

  /** Select next item and generate problem */
  const advanceToNextItem = useCallback(() => {
    const selection = getNextItem(catState.current, itemPool.current);
    if (!selection) {
      // Test complete
      const catResults = getCatResults(catState.current);
      setResults({
        grade: catResults.estimatedGrade,
        accuracy: catResults.accuracy,
        totalItems: catResults.totalItems,
      });

      // Compute and apply placement Elos
      const skillList = SKILLS.map((s) => ({
        id: s.id,
        grade: s.grade,
        operation: s.operation,
      }));
      const eloMap = computePlacementElos(catState.current, skillList);
      for (const [skillId, elo] of eloMap) {
        updateSkillState(skillId, { eloRating: elo });
      }

      completePlacement(catResults.estimatedGrade, catResults.theta);
      setPhase('complete');
      return;
    }

    const placementProblem = generateForItem(selection.item);
    if (!placementProblem) {
      // Skip this item if we can't generate a problem
      catState.current.administeredIds.add(selection.item.id);
      advanceToNextItem();
      return;
    }

    setCurrentProblem(placementProblem);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setFeedbackReaction('idle');
  }, [generateForItem, completePlacement, updateSkillState]);

  /** Handle answer selection */
  const handleAnswer = useCallback((answer: number) => {
    if (showFeedback || !currentProblem) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const correctValue = answerNumericValue(currentProblem.problem.correctAnswer);
    const correct = answer === correctValue;
    setFeedbackReaction(correct ? 'correct' : 'incorrect');

    // Record response in CAT engine
    recordResponse(catState.current, currentProblem.item, correct);

    // Advance after brief feedback delay
    setTimeout(() => {
      setQuestionIndex((i) => i + 1);
      advanceToNextItem();
    }, 1200);
  }, [showFeedback, currentProblem, advanceToNextItem]);

  /** Start the test */
  const handleStart = useCallback(() => {
    setPhase('testing');
    advanceToNextItem();
  }, [advanceToNextItem]);

  /** Handle skip / quit */
  const handleSkip = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleQuitConfirm = useCallback(() => {
    setQuitDialogVisible(false);
    navigation.goBack();
  }, [navigation]);

  /** Navigate home after completion */
  const handleFinish = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }, [navigation]);

  /** Generate answer options (correct + 3 distractors) */
  const answerOptions = useMemo(() => {
    if (!currentProblem) return [];
    const correct = answerNumericValue(currentProblem.problem.correctAnswer);
    const options = new Set<number>([correct]);

    // Generate distractors close to correct answer
    const offsets = [-2, -1, 1, 2, 3, -3];
    for (const offset of offsets) {
      if (options.size >= 4) break;
      const val = correct + offset;
      if (val >= 0) options.add(val);
    }

    // Ensure we have 4 options
    let fallback = correct + 4;
    while (options.size < 4) {
      options.add(fallback++);
    }

    return [...options].sort((a, b) => a - b);
  }, [currentProblem]);

  const totalAnswered = catState.current.responses.length;
  const progressText = `Question ${totalAnswered + 1}`;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    headerTitle: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
    },
    closeButton: {
      padding: spacing.sm,
      minWidth: layout.minTouchTarget,
      minHeight: layout.minTouchTarget,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressBar: {
      height: 4,
      backgroundColor: colors.surface,
      marginHorizontal: spacing.md,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    introTitle: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.display,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    introSubtitle: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.md,
    },
    startButton: {
      backgroundColor: colors.primary,
      minHeight: 56,
      borderRadius: layout.borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xxl,
      minWidth: 200,
    },
    startButtonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.textPrimary,
    },
    skipButton: {
      marginTop: spacing.md,
      padding: spacing.md,
    },
    skipButtonText: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
      color: colors.textMuted,
    },
    questionText: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xxl,
      color: colors.textPrimary,
      textAlign: 'center',
      marginTop: spacing.lg,
      marginBottom: spacing.xl,
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
      width: 140,
      height: 56,
      borderRadius: layout.borderRadius.md,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    optionCorrect: {
      borderColor: colors.correct,
      backgroundColor: colors.surface,
    },
    optionIncorrect: {
      borderColor: colors.incorrect,
      backgroundColor: colors.surface,
    },
    optionSelected: {
      borderColor: colors.primary,
    },
    optionText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.xl,
      color: colors.textPrimary,
    },
    resultTitle: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.display,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    resultGrade: {
      fontFamily: typography.fontFamily.bold,
      fontSize: 48,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    resultDetail: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    finishButton: {
      backgroundColor: colors.primary,
      minHeight: 56,
      borderRadius: layout.borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xxl,
      minWidth: 200,
      marginTop: spacing.xl,
    },
    finishButtonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.textPrimary,
    },
  }), [colors]);

  // Progress percentage for bar (estimate based on min 5, max 20 items)
  const progressPercent = Math.min(1, totalAnswered / 15);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      {phase === 'testing' && (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{progressText}</Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setQuitDialogVisible(true)}
              accessibilityLabel="Quit placement test"
              accessibilityRole="button"
              testID="quit-button"
            >
              <X size={24} color={colors.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent * 100}%` }]} />
          </View>
        </>
      )}

      <View style={styles.content}>
        {/* Intro Phase */}
        {phase === 'intro' && (
          <>
            <CharacterReaction avatarId={avatarId} reaction="idle" testID="intro-character" />
            <Text style={styles.introTitle}>Quick Math Check</Text>
            <Text style={styles.introSubtitle}>
              {"Answer a few questions so we can find the right level for you. Don't worry — there's no score!"}
            </Text>
            <Pressable
              style={styles.startButton}
              onPress={handleStart}
              accessibilityRole="button"
              testID="start-button"
            >
              <Text style={styles.startButtonText}>{"Let's Go!"}</Text>
            </Pressable>
            <Pressable
              style={styles.skipButton}
              onPress={handleSkip}
              accessibilityRole="button"
              testID="skip-button"
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </Pressable>
          </>
        )}

        {/* Testing Phase */}
        {phase === 'testing' && currentProblem && (
          <>
            <CharacterReaction
              avatarId={avatarId}
              reaction={feedbackReaction}
              resetKey={questionIndex}
              testID="test-character"
            />
            <Text style={styles.questionText}>
              {currentProblem.problem.questionText}
            </Text>
            <View style={styles.optionsGrid}>
              {answerOptions.map((option) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === answerNumericValue(currentProblem.problem.correctAnswer);
                const showResult = showFeedback && (isSelected || isCorrect);

                return (
                  <Pressable
                    key={option}
                    style={[
                      styles.optionButton,
                      showResult && isCorrect && styles.optionCorrect,
                      showResult && isSelected && !isCorrect && styles.optionIncorrect,
                      !showFeedback && isSelected && styles.optionSelected,
                    ]}
                    onPress={() => handleAnswer(option)}
                    disabled={showFeedback}
                    accessibilityRole="button"
                    accessibilityLabel={`Answer ${option}`}
                    testID={`option-${option}`}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Complete Phase */}
        {phase === 'complete' && results && (
          <>
            <CharacterReaction avatarId={avatarId} reaction="streak" testID="result-character" />
            <Text style={styles.resultTitle}>All Done!</Text>
            <Text style={styles.resultGrade}>Grade {results.grade}</Text>
            <Text style={styles.resultDetail}>
              {Math.round(results.accuracy * 100)}% accuracy across {results.totalItems} questions
            </Text>
            <Text style={styles.resultDetail}>
              {"We've set up your practice level. Let's start learning!"}
            </Text>
            <Pressable
              style={styles.finishButton}
              onPress={handleFinish}
              accessibilityRole="button"
              testID="finish-button"
            >
              <Text style={styles.finishButtonText}>Start Practicing</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Quit Confirmation */}
      <AppDialog
        visible={quitDialogVisible}
        title="Quit Placement Test?"
        message="You can always take it later from the home screen."
        buttons={[
          { text: 'Keep Going', style: 'cancel', onPress: () => setQuitDialogVisible(false) },
          { text: 'Quit', style: 'destructive', onPress: handleQuitConfirm },
        ]}
        onDismiss={() => setQuitDialogVisible(false)}
      />
    </View>
  );
}
