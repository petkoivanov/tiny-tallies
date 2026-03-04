import React, { useRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { spacing } from '@/theme';
import type { TutorMessage } from '@/services/tutor/types';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';

interface ChatMessageListProps {
  messages: TutorMessage[];
  isLoading: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const scrollRef = useRef<ScrollView>(null);

  const handleContentSizeChange = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      onContentSizeChange={handleContentSizeChange}
      keyboardShouldPersistTaps="handled"
    >
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      {isLoading && <TypingIndicator />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
