import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import { useTheme, spacing, typography, layout, springConfigs } from '@/theme';
import type { TutorMessage } from '@/services/tutor/types';
import type { MathDomain } from '@/services/mathEngine/types';
import { videoMap } from '@/services/video/videoMap';
import { ChatMessageList } from './ChatMessageList';
import { ResponseButtons } from './ResponseButtons';
import { VideoPlayer } from './VideoPlayer';
import { VideoVoteButtons } from './VideoVoteButtons';

const PANEL_HEIGHT = Dimensions.get('window').height * 0.6;

const PANEL_SPRING_CONFIG = springConfigs.heavy;

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: TutorMessage[];
  isLoading: boolean;
  isOnline: boolean;
  onResponse: (type: 'understand' | 'more' | 'confused' | 'retry' | 'gotit') => void;
  responseMode?: 'standard' | 'gotit';
  moreDisabled?: boolean;
  ladderExhausted?: boolean;
  youtubeConsentGranted?: boolean;
  currentDomain?: MathDomain | null;
  videoVotes?: Partial<Record<string, 'helpful' | 'not_helpful'>>;
  onVideoVote?: (domain: MathDomain, vote: 'helpful' | 'not_helpful') => void;
}

/**
 * Detects whether the last tutor message is a fallback/error message
 * by checking id prefix conventions from useTutor.
 */
function isLastMessageFallback(messages: TutorMessage[]): boolean {
  if (messages.length === 0) return false;
  const lastTutorMsg = [...messages].reverse().find((m) => m.role === 'tutor');
  if (!lastTutorMsg) return false;
  return (
    lastTutorMsg.id.startsWith('tutor-fallback-') ||
    lastTutorMsg.id.startsWith('tutor-limit-')
  );
}

export function ChatPanel({
  isOpen,
  onClose,
  messages,
  isLoading,
  isOnline,
  onResponse,
  responseMode = 'standard',
  moreDisabled = false,
  ladderExhausted,
  youtubeConsentGranted,
  currentDomain,
  videoVotes,
  onVideoVote,
}: ChatPanelProps) {
  const { colors } = useTheme();
  const translateY = useSharedValue(PANEL_HEIGHT);

  // Local video state
  const [videoOpen, setVideoOpen] = useState(false);
  const [voteDone, setVoteDone] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setVideoOpen(false);
      setVoteDone(false);
    }
  }, [isOpen]);

  useEffect(() => {
    translateY.value = withSpring(
      isOpen ? 0 : PANEL_HEIGHT,
      PANEL_SPRING_CONFIG,
    );
  }, [isOpen, translateY]);

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Swipe-down gesture to dismiss
  const panGesture = Gesture.Pan().onEnd((event) => {
    if (event.translationY > 50) {
      runOnJS(onClose)();
    }
  });

  const showOffline = !isOnline && messages.length === 0;
  const showRetry = !isLoading && messages.length > 0 && isLastMessageFallback(messages);
  const showResponseButtons =
    !isLoading && messages.length > 0 && !showRetry;

  // Inline offline indicator for mid-conversation disconnect
  const offlineInline = !isOnline && messages.length > 0;

  // Video section: all four conditions must be true
  const videoId = currentDomain ? videoMap[currentDomain] : undefined;
  const showVideoSection =
    (ladderExhausted ?? false) &&
    (youtubeConsentGranted ?? false) &&
    isOnline &&
    !!videoId;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: PANEL_HEIGHT,
      backgroundColor: colors.backgroundLight,
      borderTopLeftRadius: layout.borderRadius.lg,
      borderTopRightRadius: layout.borderRadius.lg,
      zIndex: 10,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceLight,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerLottie: {
      width: 36,
      height: 36,
    },
    headerTitle: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.textPrimary,
    },
    closeButton: {
      minWidth: layout.minTouchTarget,
      minHeight: layout.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
    offlineContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    offlineText: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    retryButton: {
      backgroundColor: colors.primary,
      borderRadius: layout.borderRadius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      minHeight: layout.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
    retryButtonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.textPrimary,
    },
    offlineInline: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      marginHorizontal: spacing.md,
      borderRadius: layout.borderRadius.sm,
    },
    offlineInlineText: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    footer: {
      paddingBottom: spacing.sm,
    },
    tryAgainButton: {
      backgroundColor: colors.primary,
      borderRadius: layout.borderRadius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      minHeight: layout.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: spacing.md,
    },
    tryAgainText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.textPrimary,
    },
    watchVideoContainer: {
      padding: spacing.md,
    },
    watchVideoButton: {
      padding: spacing.md,
      borderRadius: 8,
      alignItems: 'center' as const,
    },
    watchVideoText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      fontWeight: '600' as const,
    },
  }), [colors]);

  return (
    <Animated.View
      style={[styles.container, panelAnimatedStyle]}
      testID="chat-panel"
    >
      {/* Header with swipe-down gesture */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LottieView
              source={require('../../../assets/animations/ai-tutor.json')}
              autoPlay
              loop
              style={styles.headerLottie}
            />
            <Text style={styles.headerTitle}>Tutor</Text>
          </View>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close chat"
            testID="chat-close-button"
          >
            <X size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
      </GestureDetector>

      {/* Body: video player takes over when open, otherwise show chat */}
      {videoOpen && videoId && !voteDone ? (
        <VideoPlayer
          videoId={videoId}
          isOnline={isOnline}
          onDone={() => setVoteDone(true)}
        />
      ) : videoOpen && voteDone && currentDomain ? (
        <VideoVoteButtons
          domain={currentDomain}
          existingVote={videoVotes?.[currentDomain]}
          onVote={(vote) => onVideoVote?.(currentDomain, vote)}
        />
      ) : (
        <>
          {showOffline ? (
            <View style={styles.offlineContainer}>
              <Text style={styles.offlineText}>
                I can&apos;t help right now because we&apos;re not connected to the
                internet. Keep trying -- you&apos;ve got this!
              </Text>
              <Pressable
                onPress={() => onResponse('retry')}
                style={styles.retryButton}
                accessibilityRole="button"
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <ChatMessageList messages={messages} isLoading={isLoading} />
              {offlineInline && (
                <View style={styles.offlineInline}>
                  <Text style={styles.offlineInlineText}>
                    You&apos;re offline. Reconnect to continue chatting.
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Footer: Response Buttons or Try Again */}
          {showRetry && (
            <View style={styles.footer}>
              <Pressable
                onPress={() => onResponse('retry')}
                style={styles.tryAgainButton}
                accessibilityRole="button"
              >
                <Text style={styles.tryAgainText}>Try again</Text>
              </Pressable>
            </View>
          )}
          {showResponseButtons && (
            <View style={styles.footer}>
              <ResponseButtons
                onResponse={onResponse}
                disabled={isLoading}
                moreDisabled={moreDisabled}
                mode={responseMode}
              />
            </View>
          )}

          {/* Watch video button */}
          {!videoOpen && showVideoSection && (
            <View style={styles.watchVideoContainer}>
              <Pressable
                testID="chat-watch-video-button"
                onPress={() => setVideoOpen(true)}
                style={[styles.watchVideoButton, { backgroundColor: colors.primary }]}
                accessibilityRole="button"
              >
                <Text style={[styles.watchVideoText, { color: colors.background }]}>
                  Watch a video
                </Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </Animated.View>
  );
}
