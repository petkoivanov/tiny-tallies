import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThumbsUp, ThumbsDown } from 'lucide-react-native';
import { useTheme, spacing, typography } from '@/theme';
import type { MathDomain } from '@/services/mathEngine/types';

interface VideoVoteButtonsProps {
  domain: MathDomain;
  existingVote: 'helpful' | 'not_helpful' | undefined;
  onVote: (vote: 'helpful' | 'not_helpful') => void;
}

// domain is part of the interface contract for the call site in ChatPanel (Plan 03)
// it is not used directly in rendering
export function VideoVoteButtons({
  domain: _domain,
  existingVote,
  onVote,
}: VideoVoteButtonsProps) {
  const { colors } = useTheme();
  const helpfulSelected = existingVote === 'helpful';
  const notHelpfulSelected = existingVote === 'not_helpful';

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          {
            color: colors.textSecondary,
            fontFamily: typography.fontFamily.regular,
            fontSize: typography.fontSize.md,
          },
        ]}
      >
        Was this helpful?
      </Text>
      <View style={styles.buttons}>
        <Pressable
          testID="video-vote-helpful"
          onPress={() => onVote('helpful')}
          style={[
            styles.voteButton,
            {
              backgroundColor: helpfulSelected ? colors.primary : colors.surface,
              borderColor: helpfulSelected ? colors.primary : colors.surfaceLight,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Helpful"
          accessibilityState={{ selected: helpfulSelected }}
        >
          <ThumbsUp
            size={20}
            color={helpfulSelected ? colors.background : colors.textPrimary}
          />
        </Pressable>
        <Pressable
          testID="video-vote-not-helpful"
          onPress={() => onVote('not_helpful')}
          style={[
            styles.voteButton,
            {
              backgroundColor: notHelpfulSelected ? colors.incorrect : colors.surface,
              borderColor: notHelpfulSelected ? colors.incorrect : colors.surfaceLight,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Not helpful"
          accessibilityState={{ selected: notHelpfulSelected }}
        >
          <ThumbsDown
            size={20}
            color={notHelpfulSelected ? colors.background : colors.textPrimary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    // fontFamily and fontSize applied inline for dynamic theme values
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  voteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
