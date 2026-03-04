import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { TutorMessage } from '@/services/tutor/types';
import { ChatPanel } from '../ChatPanel';

// Mock ChatMessageList
jest.mock('../ChatMessageList', () => {
  const { View, Text } = require('react-native');
  return {
    ChatMessageList: ({ messages }: { messages: any[] }) => (
      <View testID="chat-message-list">
        {messages.map((m: any) => (
          <Text key={m.id} testID={`msg-${m.id}`}>
            {m.text}
          </Text>
        ))}
      </View>
    ),
  };
});

// Mock ResponseButtons
jest.mock('../ResponseButtons', () => {
  const { View, Pressable, Text } = require('react-native');
  return {
    ResponseButtons: ({
      onResponse,
      disabled,
    }: {
      onResponse: (type: string) => void;
      disabled: boolean;
    }) => (
      <View testID="response-buttons">
        <Pressable
          onPress={() => onResponse('understand')}
          disabled={disabled}
          testID="btn-understand"
        >
          <Text>I understand!</Text>
        </Pressable>
      </View>
    ),
  };
});

const sampleMessages: TutorMessage[] = [
  { id: 'tutor-1', role: 'tutor', text: 'Think about it step by step.', timestamp: 1000 },
  { id: 'child-1', role: 'child', text: 'Tell me more', timestamp: 2000 },
];

describe('ChatPanel', () => {
  const mockOnClose = jest.fn();
  const mockOnResponse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders message list when open with messages', () => {
    const { getByTestId, getByText } = render(
      <ChatPanel
        isOpen={true}
        onClose={mockOnClose}
        messages={sampleMessages}
        isLoading={false}
        isOnline={true}
        onResponse={mockOnResponse}
      />,
    );

    expect(getByTestId('chat-message-list')).toBeTruthy();
    expect(getByText('Think about it step by step.')).toBeTruthy();
  });

  it('renders header with Tutor title and close button', () => {
    const { getByText, getByTestId } = render(
      <ChatPanel
        isOpen={true}
        onClose={mockOnClose}
        messages={sampleMessages}
        isLoading={false}
        isOnline={true}
        onResponse={mockOnResponse}
      />,
    );

    expect(getByText('Tutor')).toBeTruthy();
    expect(getByTestId('chat-close-button')).toBeTruthy();
  });

  it('fires onClose when X button pressed', () => {
    const { getByTestId } = render(
      <ChatPanel
        isOpen={true}
        onClose={mockOnClose}
        messages={sampleMessages}
        isLoading={false}
        isOnline={true}
        onResponse={mockOnResponse}
      />,
    );

    fireEvent.press(getByTestId('chat-close-button'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders response buttons when messages exist and not loading', () => {
    const { getByTestId } = render(
      <ChatPanel
        isOpen={true}
        onClose={mockOnClose}
        messages={sampleMessages}
        isLoading={false}
        isOnline={true}
        onResponse={mockOnResponse}
      />,
    );

    expect(getByTestId('response-buttons')).toBeTruthy();
  });

  it('hides response buttons when loading', () => {
    const { queryByTestId } = render(
      <ChatPanel
        isOpen={true}
        onClose={mockOnClose}
        messages={sampleMessages}
        isLoading={true}
        isOnline={true}
        onResponse={mockOnResponse}
      />,
    );

    expect(queryByTestId('response-buttons')).toBeNull();
  });

  it('hides response buttons when no messages', () => {
    const { queryByTestId } = render(
      <ChatPanel
        isOpen={true}
        onClose={mockOnClose}
        messages={[]}
        isLoading={false}
        isOnline={true}
        onResponse={mockOnResponse}
      />,
    );

    expect(queryByTestId('response-buttons')).toBeNull();
  });

  it('shows offline message when offline and no messages', () => {
    const { getByText, queryByTestId } = render(
      <ChatPanel
        isOpen={true}
        onClose={mockOnClose}
        messages={[]}
        isLoading={false}
        isOnline={false}
        onResponse={mockOnResponse}
      />,
    );

    expect(
      getByText(
        /can't help right now because we're not connected to the internet/,
      ),
    ).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
    expect(queryByTestId('chat-message-list')).toBeNull();
  });

  it('calls onResponse with retry when offline retry pressed', () => {
    const { getByText } = render(
      <ChatPanel
        isOpen={true}
        onClose={mockOnClose}
        messages={[]}
        isLoading={false}
        isOnline={false}
        onResponse={mockOnResponse}
      />,
    );

    fireEvent.press(getByText('Retry'));
    expect(mockOnResponse).toHaveBeenCalledWith('retry');
  });

  it('shows Try again button when last message is a fallback', () => {
    const messagesWithFallback: TutorMessage[] = [
      {
        id: 'tutor-fallback-123',
        role: 'tutor',
        text: 'Oops, something went wrong.',
        timestamp: 1000,
      },
    ];

    const { getByText, queryByTestId } = render(
      <ChatPanel
        isOpen={true}
        onClose={mockOnClose}
        messages={messagesWithFallback}
        isLoading={false}
        isOnline={true}
        onResponse={mockOnResponse}
      />,
    );

    expect(getByText('Try again')).toBeTruthy();
    expect(queryByTestId('response-buttons')).toBeNull();
  });

  it('calls onResponse with retry when Try again pressed', () => {
    const messagesWithFallback: TutorMessage[] = [
      {
        id: 'tutor-fallback-123',
        role: 'tutor',
        text: 'Oops, something went wrong.',
        timestamp: 1000,
      },
    ];

    const { getByText } = render(
      <ChatPanel
        isOpen={true}
        onClose={mockOnClose}
        messages={messagesWithFallback}
        isLoading={false}
        isOnline={true}
        onResponse={mockOnResponse}
      />,
    );

    fireEvent.press(getByText('Try again'));
    expect(mockOnResponse).toHaveBeenCalledWith('retry');
  });
});
