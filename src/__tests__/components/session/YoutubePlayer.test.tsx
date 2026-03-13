import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// react-native-webview is a native module — mock it
jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ testID }: { testID?: string }) =>
      React.createElement(View, { testID: testID ?? 'webview' }),
  };
});

// Mock theme to avoid ThemeProvider dependency
jest.mock('@/theme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#6366f1',
      primaryLight: '#818cf8',
      primaryDark: '#4f46e5',
      background: '#1a1a2e',
      backgroundLight: '#16213e',
      surface: '#0f3460',
      surfaceLight: '#1a4a7a',
      textPrimary: '#ffffff',
      textSecondary: '#cbd5e1',
      textMuted: '#64748b',
      correct: '#84cc16',
      incorrect: '#f87171',
    },
  }),
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily: { regular: 'Lexend_400Regular' },
    fontSize: { md: 16 },
  },
}));

import { VideoPlayer } from '@/components/chat/VideoPlayer';

describe('VideoPlayer', () => {
  it('renders WebView when online', () => {
    const { getByTestId } = render(
      <VideoPlayer videoId="abc123" isOnline={true} onDone={jest.fn()} />,
    );
    expect(getByTestId('youtube-webview')).toBeTruthy();
  });

  it('does not render WebView when offline', () => {
    const { queryByTestId, getByTestId } = render(
      <VideoPlayer videoId="abc123" isOnline={false} onDone={jest.fn()} />,
    );
    expect(queryByTestId('youtube-webview')).toBeNull();
    expect(getByTestId('youtube-offline-message')).toBeTruthy();
  });

  it('calls onDone when "Done watching" button is pressed', () => {
    const onDone = jest.fn();
    const { getByTestId } = render(
      <VideoPlayer videoId="abc123" isOnline={true} onDone={onDone} />,
    );
    fireEvent.press(getByTestId('youtube-done-button'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
