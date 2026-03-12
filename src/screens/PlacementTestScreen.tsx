/**
 * PlacementTestScreen — staircase adaptive placement test.
 *
 * Simple grade-climbing algorithm:
 * - Start at child's grade - 2 (minimum grade 1)
 * - Below child's grade: 1 correct in a row → move up
 * - One below child's grade: 2 correct in a row → move up
 * - At or above child's grade: 3 correct in a row → move up
 * - 5 total questions at any grade without promoting → that's the placement grade
 * - Wrong / "Don't know" resets the consecutive correct streak
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { generateProblem } from '@/services/mathEngine/generator';
import { getTemplatesBySkill } from '@/services/mathEngine/templates';
import { getSkillsByGrade } from '@/services/mathEngine/skills';
import type { Problem } from '@/services/mathEngine/types';
import { answerNumericValue } from '@/services/mathEngine/types';
import type { Grade } from '@/services/mathEngine/types';
import { CharacterReaction } from '@/components/animations/CharacterReaction';
import { GraphDisplay } from '@/components/session/graphs';
import { NarrateButton } from '@/components/session/NarrateButton';
import { AppDialog } from '@/components/AppDialog';
import { useSoundSync } from '@/hooks/useSoundEffects';
import { playCorrect, playIncorrect } from '@/services/sound';

type PlacementPhase = 'intro' | 'testing' | 'complete';

/** Max questions at a single grade before settling */
const GRADE_SETTLE_COUNT = 5;

/** Max grade we support */
const MAX_GRADE = 8;

/** Staircase state — tracks progress through the grade-climbing algorithm */
interface StaircaseState {
  currentGrade: number;
  consecutiveCorrect: number;
  questionsAtGrade: number;
  totalQuestions: number;
  totalCorrect: number;
  usedSkillIds: Set<string>;
}

function createStaircaseState(startGrade: number): StaircaseState {
  return {
    currentGrade: Math.max(1, startGrade),
    consecutiveCorrect: 0,
    questionsAtGrade: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    usedSkillIds: new Set(),
  };
}

/** How many consecutive correct answers needed to promote from this grade */
function requiredStreak(testGrade: number, childGrade: number): number {
  if (testGrade < childGrade - 1) return 1;
  if (testGrade === childGrade - 1) return 2;
  return 3; // at or above child's grade
}

/** Generate a random problem for a given grade level */
function generateForGrade(
  grade: number,
  usedSkillIds: Set<string>,
): Problem | null {
  const skills = getSkillsByGrade(grade as Grade);
  if (skills.length === 0) return null;

  // Prefer unused skills, fall back to any skill at this grade
  const unused = skills.filter((s) => !usedSkillIds.has(s.id));
  const pool = unused.length > 0 ? unused : skills;
  const skill = pool[Math.floor(Math.random() * pool.length)];

  const templates = getTemplatesBySkill(skill.id);
  if (templates.length === 0) return null;

  const template = templates[Math.floor(Math.random() * templates.length)];
  const seed = Date.now() + Math.floor(Math.random() * 10000);

  try {
    return generateProblem({ templateId: template.id, seed });
  } catch {
    return null;
  }
}

export default function PlacementTestScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();

  useSoundSync();

  const avatarId = useAppStore((s) => s.avatarId);
  const childGrade = useAppStore((s) => s.childGrade);
  const completePlacement = useAppStore((s) => s.completePlacement);

  const [phase, setPhase] = useState<PlacementPhase>('intro');
  const [quitDialogVisible, setQuitDialogVisible] = useState(false);

  const grade = childGrade ?? 1;
  const startGrade = Math.max(1, grade - 2);
  const staircase = useRef<StaircaseState>(createStaircaseState(startGrade));

  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedbackReaction, setFeedbackReaction] = useState<
    'correct' | 'incorrect' | 'idle' | null
  >('idle');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const [results, setResults] = useState<{
    grade: number;
    totalItems: number;
    accuracy: number;
  } | null>(null);

  /** Generate next problem at current staircase grade */
  const advanceToNext = useCallback(() => {
    const s = staircase.current;
    const problem = generateForGrade(s.currentGrade, s.usedSkillIds);

    if (!problem) {
      // No skills at this grade — settle here
      finishTest(s);
      return;
    }

    s.usedSkillIds.add(problem.skillId);
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setFeedbackReaction('idle');
  }, []);

  /** Complete the test and store results */
  const finishTest = useCallback(
    (s: StaircaseState) => {
      const accuracy =
        s.totalQuestions > 0 ? s.totalCorrect / s.totalQuestions : 0;
      setResults({
        grade: s.currentGrade,
        totalItems: s.totalQuestions,
        accuracy,
      });
      completePlacement(s.currentGrade, 0);
      setPhase('complete');
    },
    [completePlacement],
  );

  /** Process answer result and advance staircase */
  const processAnswer = useCallback(
    (correct: boolean) => {
      const s = staircase.current;
      s.totalQuestions++;
      s.questionsAtGrade++;
      if (correct) {
        s.totalCorrect++;
        s.consecutiveCorrect++;
      } else {
        s.consecutiveCorrect = 0;
      }

      const needed = requiredStreak(s.currentGrade, grade);

      // Check promotion
      if (s.consecutiveCorrect >= needed) {
        if (s.currentGrade >= MAX_GRADE) {
          // Can't go higher — settle at max grade
          finishTest(s);
          return;
        }
        // Move up one grade
        s.currentGrade++;
        s.consecutiveCorrect = 0;
        s.questionsAtGrade = 0;
      } else if (s.questionsAtGrade >= GRADE_SETTLE_COUNT) {
        // Spent 5 questions here without promoting — this is their level
        finishTest(s);
        return;
      }

      setQuestionIndex((i) => i + 1);
      advanceToNext();
    },
    [grade, finishTest, advanceToNext],
  );

  const handleAnswer = useCallback(
    (answer: number) => {
      if (showFeedback || !currentProblem) return;

      setSelectedAnswer(answer);
      setShowFeedback(true);

      const correctValue = answerNumericValue(currentProblem.correctAnswer);
      const correct = answer === correctValue;
      setFeedbackReaction(correct ? 'correct' : 'incorrect');
      if (correct) playCorrect(); else playIncorrect();

      setTimeout(() => processAnswer(correct), 1200);
    },
    [showFeedback, currentProblem, processAnswer],
  );

  const handleSkipQuestion = useCallback(() => {
    if (showFeedback || !currentProblem) return;

    setShowFeedback(true);
    setFeedbackReaction('idle');

    setTimeout(() => processAnswer(false), 600);
  }, [showFeedback, currentProblem, processAnswer]);

  const handleStart = useCallback(() => {
    setPhase('testing');
    advanceToNext();
  }, [advanceToNext]);

  const handleSkip = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleQuitConfirm = useCallback(() => {
    setQuitDialogVisible(false);
    navigation.goBack();
  }, [navigation]);

  const handleFinish = useCallback(() => {
    navigation.reset({
      index: 1,
      routes: [
        { name: 'Home' },
        { name: 'Session', params: { sessionId: String(Date.now()) } },
      ],
    });
  }, [navigation]);

  const handleRetake = useCallback(() => {
    staircase.current = createStaircaseState(startGrade);
    setResults(null);
    setQuestionIndex(0);
    setPhase('testing');
    advanceToNext();
  }, [startGrade, advanceToNext]);

  const handleBackToHome = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  /** Generate shuffled answer options (correct + 3 distractors) */
  const answerOptions = useMemo(() => {
    if (!currentProblem) return [];
    const correct = answerNumericValue(currentProblem.correctAnswer);
    const options = new Set<number>([correct]);

    const hasGraph = !!currentProblem.metadata.graphData;
    const offsets = hasGraph
      ? [
          -Math.round(correct * 0.15) - 3,
          -Math.round(correct * 0.08) - 1,
          Math.round(correct * 0.08) + 1,
          Math.round(correct * 0.15) + 3,
        ]
      : [-2, -1, 1, 2, 3, -3];
    for (const offset of offsets) {
      if (options.size >= 4) break;
      const val = correct + offset;
      if (val >= 0) options.add(val);
    }

    let fallback = correct + (hasGraph ? 8 : 4);
    while (options.size < 4) {
      options.add(fallback++);
    }

    // Shuffle (Fisher-Yates)
    const arr = [...options];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [currentProblem]);

  const totalAnswered = staircase.current.totalQuestions;
  const progressText = `Question ${totalAnswered + 1}`;
  // Estimate progress: typically 3-15 questions
  const progressPercent = Math.min(1, totalAnswered / 10);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
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
        skipButton: { marginTop: spacing.md, padding: spacing.md },
        skipButtonText: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.sm,
          color: colors.textMuted,
        },
        questionRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: spacing.lg,
          marginBottom: spacing.xl,
        },
        questionText: {
          fontFamily: typography.fontFamily.bold,
          fontSize: typography.fontSize.xxl,
          color: colors.textPrimary,
          textAlign: 'center',
          flex: 1,
        },
        questionTextLong: {
          fontSize: typography.fontSize.xl,
        },
        questionTextWord: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.lg,
          textAlign: 'left',
          lineHeight: typography.fontSize.lg * 1.5,
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
        optionSelected: { borderColor: colors.primary },
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
        secondaryButton: {
          marginTop: spacing.sm,
          padding: spacing.md,
          minHeight: layout.minTouchTarget,
          justifyContent: 'center',
          alignItems: 'center',
        },
        secondaryButtonText: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.sm,
          color: colors.textMuted,
        },
        skipQuestionButton: { marginTop: spacing.md, padding: spacing.md },
        skipQuestionText: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.sm,
          color: colors.textMuted,
        },
      }),
    [colors],
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
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
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent * 100}%` },
              ]}
            />
          </View>
        </>
      )}

      <View style={styles.content}>
        {/* Intro Phase */}
        {phase === 'intro' && (
          <>
            <CharacterReaction
              avatarId={avatarId}
              reaction="idle"
              testID="intro-character"
            />
            <Text style={styles.introTitle}>Quick Math Check</Text>
            <Text style={styles.introSubtitle}>
              {
                "Answer a few questions so we can find the right level for you. Don't worry — there's no score!"
              }
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
            {currentProblem.metadata.graphData && (
              <GraphDisplay
                data={currentProblem.metadata.graphData}
                testID="placement-graph"
              />
            )}
            <View style={styles.questionRow}>
              <Text
                style={[
                  styles.questionText,
                  currentProblem.questionText.length > 60 && styles.questionTextWord,
                  currentProblem.questionText.length > 30 &&
                    currentProblem.questionText.length <= 60 &&
                    styles.questionTextLong,
                ]}
              >
                {currentProblem.questionText}
              </Text>
              <NarrateButton
                text={currentProblem.questionText}
                resetKey={questionIndex}
                primaryColor={colors.primary}
                primaryLightColor={colors.textSecondary}
                testID="narrate-button"
              />
            </View>
            <View style={styles.optionsGrid}>
              {answerOptions.map((option) => {
                const isSelected = selectedAnswer === option;
                const isCorrect =
                  option === answerNumericValue(currentProblem.correctAnswer);
                const showResult =
                  showFeedback && (isSelected || isCorrect);

                return (
                  <Pressable
                    key={option}
                    style={[
                      styles.optionButton,
                      showResult && isCorrect && styles.optionCorrect,
                      showResult &&
                        isSelected &&
                        !isCorrect &&
                        styles.optionIncorrect,
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
            {!showFeedback && (
              <Pressable
                style={styles.skipQuestionButton}
                onPress={handleSkipQuestion}
                accessibilityRole="button"
                testID="skip-question-button"
              >
                <Text style={styles.skipQuestionText}>{"Don't know"}</Text>
              </Pressable>
            )}
          </>
        )}

        {/* Complete Phase */}
        {phase === 'complete' && results && (
          <>
            <CharacterReaction
              avatarId={avatarId}
              reaction="streak"
              testID="result-character"
            />
            <Text style={styles.resultTitle}>All Done!</Text>
            <Text style={styles.resultGrade}>Grade {results.grade}</Text>
            <Text style={styles.resultDetail}>
              {Math.round(results.accuracy * 100)}% accuracy across{' '}
              {results.totalItems} questions
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
            <Pressable
              style={styles.secondaryButton}
              onPress={handleRetake}
              accessibilityRole="button"
              testID="retake-button"
            >
              <Text style={styles.secondaryButtonText}>
                Retake Evaluation
              </Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={handleBackToHome}
              accessibilityRole="button"
              testID="back-to-home-button"
            >
              <Text style={styles.secondaryButtonText}>Back to Home</Text>
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
          {
            text: 'Keep Going',
            style: 'cancel',
            onPress: () => setQuitDialogVisible(false),
          },
          { text: 'Quit', style: 'destructive', onPress: handleQuitConfirm },
        ]}
        onDismiss={() => setQuitDialogVisible(false)}
      />
    </View>
  );
}
