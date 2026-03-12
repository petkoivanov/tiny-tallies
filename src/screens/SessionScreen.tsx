import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  usePreventRemove,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTheme, spacing, typography } from '@/theme';
import { useSession } from '@/hooks/useSession';
import { useSoundSync, useSessionSounds } from '@/hooks/useSoundEffects';
import { useCpaMode } from '@/hooks/useCpaMode';
import { useTutor } from '@/hooks/useTutor';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useChatOrchestration } from '@/hooks/useChatOrchestration';
import { useAppStore } from '@/store/appStore';
import { CpaSessionContent, SessionHeader, SessionWrapper } from '@/components/session';
import { HelpButton, ChatPanel, ChatBanner } from '@/components/chat';
import { AppDialog } from '@/components/AppDialog';
import type { RootStackParamList } from '@/navigation/types';

type SessionNavProp = NativeStackNavigationProp<RootStackParamList, 'Session'>;
type SessionRouteProp = RouteProp<RootStackParamList, 'Session'>;

export default function SessionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SessionNavProp>();
  const route = useRoute<SessionRouteProp>();
  const { colors } = useTheme();
  const { mode, remediationSkillIds, challengeThemeId } = route.params ?? {};

  const {
    currentProblem,
    currentIndex,
    totalProblems,
    sessionPhase,
    sessionMode,
    feedbackState,
    selectedAnswer,
    correctAnswer,
    isComplete,
    score,
    handleAnswer,
    dismissFeedback,
    handleQuit,
    sessionResult,
  } = useSession({ mode, remediationSkillIds, challengeThemeId });

  // Sound: sync store preference + play feedback sounds
  useSoundSync();
  useSessionSounds(feedbackState, isComplete);

  const cpaInfo = useCpaMode(currentProblem?.skillId ?? null);
  const { stage } = cpaInfo;

  // Wrong answer tracking for tutor context
  const [lastWrongContext, setLastWrongContext] = useState<{
    wrongAnswer: number;
    bugDescription: string | null;
  } | null>(null);

  // Tutor and network hooks -- pass CPA info and wrong context
  const tutor = useTutor(currentProblem, cpaInfo, lastWrongContext);
  const { isOnline } = useNetworkStatus();

  // Chat orchestration -- all chat UI state, effects, and callbacks
  const {
    chatOpen,
    chatMinimized,
    showHelp,
    shouldPulse,
    showCorrectAnswer,
    boostHighlightAnswer,
    responseMode,
    moreDisabled,
    bannerMessage,
    handleAnswerWithBoost,
    handleHelpTap,
    handleResponse,
    handleCloseChat,
    handleBannerTap,
  } = useChatOrchestration({
    tutor,
    currentProblem,
    currentIndex,
    correctAnswer,
    feedbackState,
    sessionPhase,
    isComplete,
    isOnline,
    handleAnswer,
    setLastWrongContext,
  });

  const isFeedbackActive = feedbackState !== null;

  // Break reminder
  const breakReminderMinutes = useAppStore((s) => s.breakReminderMinutes);
  const [breakDialogVisible, setBreakDialogVisible] = useState(false);
  const breakFiredRef = useRef(0); // tracks how many break reminders have fired

  useEffect(() => {
    if (breakReminderMinutes <= 0 || isComplete) return;
    const intervalMs = breakReminderMinutes * 60_000;
    const timer = setInterval(() => {
      breakFiredRef.current += 1;
      setBreakDialogVisible(true);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [breakReminderMinutes, isComplete]);

  // Quit confirmation dialog state
  const [quitDialogVisible, setQuitDialogVisible] = useState(false);
  const pendingNavAction = useRef<any>(null);

  // Prevent back navigation while session is active
  const isSessionActive = !isComplete;
  usePreventRemove(isSessionActive, ({ data }) => {
    pendingNavAction.current = data.action;
    setQuitDialogVisible(true);
  });

  const handleQuitConfirm = useCallback(() => {
    setQuitDialogVisible(false);
    handleQuit();
    if (pendingNavAction.current) {
      navigation.dispatch(pendingNavAction.current);
      pendingNavAction.current = null;
    }
  }, [handleQuit, navigation]);

  const handleQuitCancel = useCallback(() => {
    setQuitDialogVisible(false);
    pendingNavAction.current = null;
  }, []);

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
        isRemediation: sessionMode === 'remediation',
        newBadges: sessionResult.newBadges,
        totalNewBadges: sessionResult.totalNewBadges,
        isChallenge: sessionResult.isChallenge,
        challengeBonusXp: sessionResult.challengeBonusXp,
        accuracyGoalMet: sessionResult.accuracyGoalMet,
        streakGoalMet: sessionResult.streakGoalMet,
      });
    }
  }, [isComplete, sessionResult, navigation, sessionMode]);

  const styles = useMemo(() => StyleSheet.create({
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
    problemText: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.display,
      color: colors.textPrimary,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
  }), [colors]);

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

  return (
    <SessionWrapper>
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <SessionHeader
        sessionPhase={sessionPhase}
        cpaStage={stage}
        currentIndex={currentIndex}
        totalProblems={totalProblems}
        feedbackState={feedbackState}
        studentElo={currentProblem?.studentElo ?? 1000}
        onQuit={() => navigation.goBack()}
      />

      {/* ChatBanner: visible when chat is minimized during TEACH mode */}
      <ChatBanner
        message={bannerMessage}
        onTap={handleBannerTap}
        visible={chatMinimized}
      />

      {/* CPA-aware Problem Display + Answer Options */}
      {problem && currentProblem && (
        <CpaSessionContent
          problem={problem}
          skillId={currentProblem.skillId}
          presentation={currentProblem.presentation}
          currentIndex={currentIndex}
          onAnswer={handleAnswerWithBoost}
          feedbackActive={isFeedbackActive}
          feedbackCorrect={feedbackState?.correct ?? null}
          onDismissFeedback={dismissFeedback}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          showCorrectAnswer={showCorrectAnswer}
          chatOpen={chatOpen}
          teachExpand={tutor.shouldExpandManipulative}
          boostHighlightAnswer={boostHighlightAnswer}
        />
      )}

      {/* Help FAB - visible during practice only */}
      <HelpButton
        visible={showHelp}
        onPress={handleHelpTap}
        pulsing={shouldPulse}
      />

      {/* Chat Panel */}
      <ChatPanel
        isOpen={chatOpen}
        onClose={handleCloseChat}
        messages={tutor.messages}
        isLoading={tutor.loading}
        isOnline={isOnline}
        onResponse={handleResponse}
        responseMode={responseMode}
        moreDisabled={moreDisabled}
      />
      {/* Quit confirmation dialog */}
      <AppDialog
        visible={quitDialogVisible}
        title="Quit Practice?"
        message="Are you sure? Your progress won't be saved."
        buttons={[
          { text: 'Keep Going', style: 'cancel', onPress: handleQuitCancel },
          { text: 'Quit', style: 'destructive', onPress: handleQuitConfirm },
        ]}
        onDismiss={handleQuitCancel}
      />
      {/* Break reminder dialog */}
      <AppDialog
        visible={breakDialogVisible}
        title="Time for a Break!"
        message="You've been practicing for a while. Take a quick stretch!"
        buttons={[{ text: 'OK', onPress: () => setBreakDialogVisible(false) }]}
        onDismiss={() => setBreakDialogVisible(false)}
      />
    </View>
    </SessionWrapper>
  );
}
