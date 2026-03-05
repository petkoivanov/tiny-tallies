import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
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
import { useCpaMode } from '@/hooks/useCpaMode';
import { useTutor } from '@/hooks/useTutor';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useChatOrchestration } from '@/hooks/useChatOrchestration';
import { CpaSessionContent, SessionHeader } from '@/components/session';
import { HelpButton, ChatPanel, ChatBanner } from '@/components/chat';
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
    handleQuit,
    sessionResult,
  } = useSession({ mode, remediationSkillIds, challengeThemeId });

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
        isRemediation: sessionMode === 'remediation',
        newBadges: sessionResult.newBadges,
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
  const options = currentProblem?.presentation.options ?? [];

  return (
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
          options={options}
          currentIndex={currentIndex}
          onAnswer={handleAnswerWithBoost}
          feedbackActive={isFeedbackActive}
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
      />
    </View>
  );
}
