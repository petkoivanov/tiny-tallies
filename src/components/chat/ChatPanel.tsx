import React, { useEffect, useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import type { TutorMessage } from '@/services/tutor/types';
import { ChatMessageList } from './ChatMessageList';
import { ResponseButtons } from './ResponseButtons';

const PANEL_HEIGHT = Dimensions.get('window').height * 0.6;

const PANEL_SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
  overshootClamping: true,
} as const;

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: TutorMessage[];
  isLoading: boolean;
  isOnline: boolean;
  onResponse: (type: 'understand' | 'more' | 'confused' | 'retry' | 'gotit') => void;
  responseMode?: 'standard' | 'gotit';
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
}: ChatPanelProps) {
  const { colors } = useTheme();
  const translateY = useSharedValue(PANEL_HEIGHT);

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
  }), [colors]);

  return (
    <Animated.View
      style={[styles.container, panelAnimatedStyle]}
      testID="chat-panel"
    >
      {/* Header with swipe-down gesture */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tutor</Text>
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

      {/* Body */}
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
            mode={responseMode}
          />
        </View>
      )}
    </Animated.View>
  );
}
