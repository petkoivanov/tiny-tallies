import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import { useTheme, spacing, typography } from '@/theme';
import { buildNocookieHtml } from '@/services/video/youtubeHtml';

interface VideoPlayerProps {
  videoId: string;
  isOnline: boolean;
  onDone: () => void;
}

export function VideoPlayer({ videoId, isOnline, onDone }: VideoPlayerProps) {
  const { colors } = useTheme();
  const html = buildNocookieHtml(videoId);

  if (!isOnline) {
    return (
      <View style={styles.offlineContainer} testID="youtube-offline-message">
        <Text
          style={[
            styles.offlineText,
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

  return (
    <View style={styles.container}>
      <WebView
        testID="youtube-webview"
        source={{ html }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        style={styles.player}
      />
      <Pressable
        testID="youtube-done-button"
        onPress={onDone}
        style={[styles.doneButton, { backgroundColor: colors.primary }]}
        accessibilityRole="button"
        accessibilityLabel="Done watching"
      >
        <Text
          style={[
            styles.doneText,
            {
              color: colors.background,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.md,
            },
          ]}
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
  doneButton: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneText: {
    fontWeight: '600',
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  offlineText: {
    textAlign: 'center',
  },
});
