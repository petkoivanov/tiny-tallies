import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock navigation
const mockDispatch = jest.fn();
let mockRouteParams: Record<string, unknown> = {
  sessionId: 'test-session-123',
  score: 12,
  total: 15,
  xpEarned: 150,
  durationMs: 150000, // 2m 30s
  leveledUp: false,
  newLevel: 3,
  streakCount: 2,
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

// Mock useAppStore — return xp: 500
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: any) => selector({ xp: 500 }),
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  Flame: () => 'Flame',
  Check: () => 'Check',
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
      leveledUp: false,
      newLevel: 3,
      streakCount: 2,
    };
  });

  it('renders session complete subtitle', () => {
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

  // New tests for motivational message
  it('renders "Great job!" for 80% score (12/15)', () => {
    const { getByTestId } = render(<ResultsScreen />);
    expect(getByTestId('motivational-message').props.children).toBe(
      'Great job!',
    );
  });

  it('renders "Amazing!" for 100% score', () => {
    mockRouteParams = { ...mockRouteParams, score: 15, total: 15 };

    const { getByTestId } = render(<ResultsScreen />);
    expect(getByTestId('motivational-message').props.children).toBe(
      'Amazing!',
    );
  });

  it('renders "Amazing!" for 90% score', () => {
    mockRouteParams = { ...mockRouteParams, score: 9, total: 10 };

    const { getByTestId } = render(<ResultsScreen />);
    expect(getByTestId('motivational-message').props.children).toBe(
      'Amazing!',
    );
  });

  it('renders "Nice effort!" for low score', () => {
    mockRouteParams = { ...mockRouteParams, score: 3, total: 15 };

    const { getByTestId } = render(<ResultsScreen />);
    expect(getByTestId('motivational-message').props.children).toBe(
      'Nice effort!',
    );
  });

  // Streak tests
  it('renders streak count', () => {
    const { getByText } = render(<ResultsScreen />);
    expect(getByText('Streak: 2 weeks')).toBeTruthy();
  });

  it('renders singular "week" for streak of 1', () => {
    mockRouteParams = { ...mockRouteParams, streakCount: 1 };

    const { getByText } = render(<ResultsScreen />);
    expect(getByText('Streak: 1 week')).toBeTruthy();
  });

  it('renders streak row with testID', () => {
    const { getByTestId } = render(<ResultsScreen />);
    expect(getByTestId('streak-row')).toBeTruthy();
  });

  // Level-up tests
  it('shows level-up callout when leveledUp is true', () => {
    mockRouteParams = { ...mockRouteParams, leveledUp: true, newLevel: 5 };

    const { getByTestId, getByText } = render(<ResultsScreen />);
    expect(getByTestId('level-up-callout')).toBeTruthy();
    // Use exact match for the level-up text to avoid matching XP bar label
    expect(getByText(/Level Up!/)).toBeTruthy();
  });

  it('does NOT show level-up callout when leveledUp is false', () => {
    mockRouteParams = { ...mockRouteParams, leveledUp: false };

    const { queryByTestId } = render(<ResultsScreen />);
    expect(queryByTestId('level-up-callout')).toBeNull();
  });

  // XP progress bar test
  it('renders XP progress bar', () => {
    const { getByTestId } = render(<ResultsScreen />);
    expect(getByTestId('xp-progress-bar')).toBeTruthy();
  });

  it('renders XP progress label with level info', () => {
    // xp=500 => calculateLevelFromXp(500) => level 3, xpIntoCurrentLevel, xpNeededForNextLevel
    // Level 2 threshold: 120, Level 3 threshold: 260, Level 4 threshold: 440
    // xp=500 => level 3 (threshold 260), next level 4 (threshold 440)
    // Wait, let's recalculate:
    // Level 1: 0 XP
    // Level 2: 100 + 1*20 = 120 XP (cumulative: 120)
    // Level 3: 100 + 2*20 = 140 XP (cumulative: 260)
    // Level 4: 100 + 3*20 = 160 XP (cumulative: 420)
    // Level 5: 100 + 4*20 = 180 XP (cumulative: 600)
    // xp=500 => >= 420 (level 4), < 600 (level 5) => level 4
    // xpIntoCurrentLevel = 500 - 420 = 80
    // xpNeededForNextLevel = 600 - 420 = 180
    const { getByText } = render(<ResultsScreen />);
    expect(getByText('80 / 180 XP to Level 5')).toBeTruthy();
  });
});
