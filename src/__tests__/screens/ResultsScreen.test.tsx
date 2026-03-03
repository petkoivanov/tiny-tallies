import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock navigation
const mockDispatch = jest.fn();
let mockRouteParams = {
  sessionId: 'test-session-123',
  score: 12,
  total: 15,
  xpEarned: 150,
  durationMs: 150000, // 2m 30s
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    dispatch: mockDispatch,
  }),
  useRoute: () => ({
    params: mockRouteParams,
  }),
  CommonActions: {
    reset: (config: any) => ({ type: 'RESET', ...config }),
  },
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import ResultsScreen from '@/screens/ResultsScreen';

describe('ResultsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {
      sessionId: 'test-session-123',
      score: 12,
      total: 15,
      xpEarned: 150,
      durationMs: 150000,
    };
  });

  it('renders session complete title', () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText('Session Complete!')).toBeTruthy();
  });

  it('renders score from route params', () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText('12')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
  });

  it('renders XP earned from route params', () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText('+150 XP')).toBeTruthy();
  });

  it('formats duration as minutes and seconds', () => {
    const { getByText } = render(<ResultsScreen />);
    // 150000ms = 2m 30s
    expect(getByText('2m 30s')).toBeTruthy();
  });

  it('formats duration as seconds only when under 1 minute', () => {
    mockRouteParams = { ...mockRouteParams, durationMs: 45000 };

    const { getByText } = render(<ResultsScreen />);
    expect(getByText('45s')).toBeTruthy();
  });

  it('Done button triggers CommonActions.reset to Home', () => {
    const { getByTestId } = render(<ResultsScreen />);

    fireEvent.press(getByTestId('done-button'));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'RESET',
        index: 0,
        routes: [{ name: 'Home' }],
      }),
    );
  });

  it('handles zero score correctly', () => {
    mockRouteParams = { ...mockRouteParams, score: 0, xpEarned: 0 };

    const { getByText } = render(<ResultsScreen />);
    expect(getByText('0')).toBeTruthy();
    expect(getByText('+0 XP')).toBeTruthy();
  });

  it('handles exact minute duration', () => {
    mockRouteParams = { ...mockRouteParams, durationMs: 120000 };

    const { getByText } = render(<ResultsScreen />);
    expect(getByText('2m 0s')).toBeTruthy();
  });
});
