import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, layout, spacing, typography } from '@/theme';
import type { TutorMessage } from '@/services/tutor/types';

interface ChatBubbleProps {
  message: TutorMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const { colors } = useTheme();
  const isTutor = message.role === 'tutor';

  const styles = useMemo(() => StyleSheet.create({
    bubble: {
      maxWidth: '80%',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: layout.borderRadius.lg,
      marginVertical: spacing.xs,
    },
    tutorBubble: {
      alignSelf: 'flex-start',
      backgroundColor: colors.primaryDark,
      borderBottomLeftRadius: spacing.xs,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
    childBubble: {
      alignSelf: 'flex-end',
      backgroundColor: colors.correct,
      borderBottomRightRadius: spacing.xs,
    },
    text: {
      color: '#FFFFFF',
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
    },
  }), [colors]);

  return (
    <View
      testID={`chat-bubble-${message.id}`}
      style={[
        styles.bubble,
        isTutor ? styles.tutorBubble : styles.childBubble,
      ]}
    >
      <Text style={styles.text}>{message.text}</Text>
    </View>
  );
}
