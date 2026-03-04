import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X } from 'lucide-react-native';
import { colors, spacing, typography, layout } from '@/theme';
import { useSession } from '@/hooks/useSession';
import { useCpaMode } from '@/hooks/useCpaMode';
import { useTutor } from '@/hooks/useTutor';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { CpaSessionContent, CpaModeIcon } from '@/components/session';
import { HelpButton, ChatPanel } from '@/components/chat';
import { useAppStore } from '@/store/appStore';
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

/** Get progress bar fill color based on session phase */
function getPhaseColor(phase: SessionPhase): string {
  switch (phase) {
    case 'warmup':
      return colors.primaryLight;
    case 'practice':
      return colors.primary;
    case 'cooldown':
      return colors.correct;
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

  const { stage } = useCpaMode(currentProblem?.skillId ?? null);

  // Tutor and network hooks
  const tutor = useTutor(currentProblem);
  const { isOnline } = useNetworkStatus();
  const addTutorMessage = useAppStore((s) => s.addTutorMessage);

  // Chat UI state
  const [chatOpen, setChatOpen] = useState(false);
  const [helpUsed, setHelpUsed] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Pulse help button after wrong answer
  useEffect(() => {
    if (feedbackState && !feedbackState.correct && !helpUsed) {
      setShouldPulse(true);
    }
  }, [feedbackState, helpUsed]);

  // Per-problem chat reset
  useEffect(() => {
    tutor.resetForProblem();
    setChatOpen(false);
    setHelpUsed(false);
    setShouldPulse(false);
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Cleanup auto-close timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

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
        cpaAdvances: sessionResult.feedback?.cpaAdvances ?? [],
      });
    }
  }, [isComplete, sessionResult, navigation]);

  const isFeedbackActive = feedbackState !== null;

  // Progress bar fill percentage: count current question as done when feedback is showing
  const progressDone = currentIndex + (feedbackState ? 1 : 0);
  const progressPercent = totalProblems > 0 ? (progressDone / totalProblems) * 100 : 0;

  // Help button visibility: practice phase only, not when chat is open, not when complete
  const showHelp = sessionPhase === 'practice' && !chatOpen && !isComplete;

  // Handle help tap: open chat and request first hint
  const handleHelpTap = useCallback(() => {
    setHelpUsed(true);
    setShouldPulse(false);
    setChatOpen(true);
    if (isOnline) {
      tutor.requestHint();
    }
  }, [isOnline, tutor]);

  // Handle response buttons
  const handleResponse = useCallback(
    (type: 'understand' | 'more' | 'confused' | 'retry') => {
      switch (type) {
        case 'understand': {
          addTutorMessage({
            id: `child-${Date.now()}`,
            role: 'child',
            text: 'I understand!',
            timestamp: Date.now(),
          });
          // Show encouragement then auto-close
          setTimeout(() => {
            addTutorMessage({
              id: `tutor-encourage-${Date.now()}`,
              role: 'tutor',
              text: 'Great! Give it a try!',
              timestamp: Date.now(),
            });
          }, 200);
          autoCloseTimerRef.current = setTimeout(() => {
            setChatOpen(false);
          }, 1500);
          break;
        }
        case 'more': {
          addTutorMessage({
            id: `child-${Date.now()}`,
            role: 'child',
            text: 'Tell me more',
            timestamp: Date.now(),
          });
          tutor.requestHint();
          break;
        }
        case 'confused': {
          addTutorMessage({
            id: `child-${Date.now()}`,
            role: 'child',
            text: "I'm confused",
            timestamp: Date.now(),
          });
          tutor.requestHint();
          break;
        }
        case 'retry': {
          tutor.requestHint();
          break;
        }
      }
    },
    [addTutorMessage, tutor],
  );

  const handleCloseChat = useCallback(() => {
    setChatOpen(false);
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

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
        <CpaModeIcon stage={stage} />
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

      {/* CPA-aware Problem Display + Answer Options */}
      {problem && currentProblem && (
        <CpaSessionContent
          problem={problem}
          skillId={currentProblem.skillId}
          options={options}
          currentIndex={currentIndex}
          onAnswer={handleAnswer}
          feedbackActive={isFeedbackActive}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          showCorrectAnswer={showCorrectAnswer}
          chatOpen={chatOpen}
        />
      )}

      {/* Help FAB - visible during practice only */}
      <HelpButton
        visible={showHelp}
        onPress={handleHelpTap}
        pulsing={shouldPulse && !helpUsed}
      />

      {/* Chat Panel */}
      <ChatPanel
        isOpen={chatOpen}
        onClose={handleCloseChat}
        messages={tutor.messages}
        isLoading={tutor.loading}
        isOnline={isOnline}
        onResponse={handleResponse}
      />
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
});
