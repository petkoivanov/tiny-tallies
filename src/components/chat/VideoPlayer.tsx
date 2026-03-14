import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, spacing, typography } from '@/theme';

interface VideoPlayerProps {
  videoId: string;
  isOnline: boolean;
  onDone: () => void;
}

function youtubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function VideoPlayer({ videoId, isOnline, onDone }: VideoPlayerProps) {
  const { colors } = useTheme();
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState(false);

  const openVideo = useCallback(async () => {
    try {
      await Linking.openURL(youtubeUrl(videoId));
      setOpened(true);
      setError(false);
    } catch {
      setError(true);
    }
  }, [videoId]);

  // Auto-open on mount
  useEffect(() => {
    if (isOnline) {
      openVideo();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOnline) {
    return (
      <View style={styles.container} testID="youtube-offline-message">
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
      <View style={styles.container} testID="youtube-error-message">
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
          Couldn't open the video. Please try again.
        </Text>
        <Pressable
          testID="youtube-retry-button"
          onPress={openVideo}
          style={[styles.button, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            Try again
          </Text>
        </Pressable>
        <Pressable
          onPress={onDone}
          style={[styles.button, { backgroundColor: colors.surface }]}
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, { color: colors.textPrimary }]}>
            Skip video
          </Text>
        </Pressable>
      </View>
    );
  }

  if (opened) {
    return (
      <View style={styles.container} testID="youtube-opened-message">
        <Text
          style={[
            styles.messageText,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.md,
              marginBottom: spacing.sm,
            },
          ]}
        >
          Video opened in YouTube.
        </Text>
        <Text
          style={[
            styles.messageText,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.sm,
              marginBottom: spacing.lg,
            },
          ]}
        >
          Come back here when you're done watching!
        </Text>
        <Pressable
          testID="youtube-done-button"
          onPress={onDone}
          style={[styles.button, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Done watching"
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            Done watching
          </Text>
        </Pressable>
        <Pressable
          onPress={openVideo}
          style={[styles.button, { backgroundColor: colors.surface, marginTop: 0 }]}
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, { color: colors.textPrimary }]}>
            Reopen video
          </Text>
        </Pressable>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  button: {
    margin: spacing.sm,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    fontWeight: '600',
  },
  messageText: {
    textAlign: 'center',
  },
});
