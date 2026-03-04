import React from 'react';
import { render } from '@testing-library/react-native';
import { ChatMessageList } from '../ChatMessageList';
import type { TutorMessage } from '@/services/tutor/types';

const messages: TutorMessage[] = [
  { id: 't1', role: 'tutor', text: 'Hello!', timestamp: 1 },
  { id: 'c1', role: 'child', text: 'Hi!', timestamp: 2 },
];

describe('ChatMessageList', () => {
  it('renders all messages as ChatBubble components', () => {
    const { getByText } = render(
      <ChatMessageList messages={messages} isLoading={false} />,
    );
    expect(getByText('Hello!')).toBeTruthy();
    expect(getByText('Hi!')).toBeTruthy();
  });

  it('renders empty when messages array is empty', () => {
    const { queryByTestId } = render(
      <ChatMessageList messages={[]} isLoading={false} />,
    );
    expect(queryByTestId(/chat-bubble/)).toBeNull();
  });

  it('shows typing indicator when isLoading is true', () => {
    const { getByTestId } = render(
      <ChatMessageList messages={[]} isLoading={true} />,
    );
    expect(getByTestId('typing-indicator')).toBeTruthy();
  });

  it('hides typing indicator when isLoading is false', () => {
    const { queryByTestId } = render(
      <ChatMessageList messages={[]} isLoading={false} />,
    );
    expect(queryByTestId('typing-indicator')).toBeNull();
  });
});
