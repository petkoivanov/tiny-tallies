import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import type { WebViewMessageEvent } from 'react-native-webview';
import { useTheme, spacing, typography } from '@/theme';
import { buildNocookieHtml } from '@/services/video/youtubeHtml';

/** Synthetic origin so YouTube receives a valid Referer header (fixes error 153). */
const BASE_URL = 'https://tiny-tallies.app';

interface VideoPlayerProps {
  videoId: string;
  isOnline: boolean;
  onDone: () => void;
}

export function VideoPlayer({ videoId, isOnline, onDone }: VideoPlayerProps) {
  const { colors } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const html = buildNocookieHtml(videoId);

  const handleRetry = useCallback(() => {
    setError(false);
    setLoading(true);
    setRetryKey((k) => k + 1);
  }, []);

  /** Handle messages from injected JS (e.g. video-unavailable detection). */
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'video-unavailable') {
        setError(true);
        setLoading(false);
      }
    } catch {
      // ignore non-JSON messages
    }
  }, []);

  /** Only allow the youtube-nocookie embed URL — block all other navigation. */
  const handleNavigationRequest = useCallback(
    (request: WebViewNavigation) => {
      // Allow initial about:blank and the embed URL
      if (
        request.url === 'about:blank' ||
        request.url.startsWith('https://www.youtube-nocookie.com/embed/')
      ) {
        return true;
      }
      // Block everything else (related videos, channel links, etc.)
      return false;
    },
    [],
  );

  if (!isOnline) {
    return (
      <View style={styles.messageContainer} testID="youtube-offline-message">
        <Text
          style={[
            styles.messageText,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.md,
            },
          ]}
        >
          You need an internet connection to watch videos.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.messageContainer} testID="youtube-error-message">
        <Text
          style={[
            styles.messageText,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.md,
              marginBottom: spacing.md,
            },
          ]}
        >
          Something went wrong loading the video. Please try again.
        </Text>
        <Pressable
          testID="youtube-retry-button"
          onPress={handleRetry}
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
        >
          <Text
            style={[styles.actionButtonText, { color: colors.background }]}
          >
            Try again
          </Text>
        </Pressable>
        <Pressable
          onPress={onDone}
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          accessibilityRole="button"
        >
          <Text
            style={[styles.actionButtonText, { color: colors.textPrimary }]}
          >
            Skip video
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <WebView
        ref={webViewRef}
        key={retryKey}
        testID="youtube-webview"
        source={{ html, baseUrl: BASE_URL }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        onShouldStartLoadWithRequest={handleNavigationRequest}
        onMessage={handleMessage}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false); }}
        onHttpError={(e) => {
          if (e.nativeEvent.statusCode >= 400) {
            setError(true);
            setLoading(false);
          }
        }}
        style={styles.player}
      />
      <Pressable
        testID="youtube-done-button"
        onPress={onDone}
        style={[styles.actionButton, { backgroundColor: colors.primary }]}
        accessibilityRole="button"
        accessibilityLabel="Done watching"
      >
        <Text
          style={[styles.actionButtonText, { color: colors.background }]}
        >
          Done watching
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  player: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 1,
  },
  actionButton: {
    margin: spacing.sm,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontWeight: '600',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  messageText: {
    textAlign: 'center',
  },
});
