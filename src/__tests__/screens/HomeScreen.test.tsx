import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock lucide icons as simple View components
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Flame: (props: any) => <View testID="flame-icon" {...props} />,
    Check: (props: any) => <View testID="check-icon" {...props} />,
  };
});

// Mock store state
let mockStoreState: Record<string, unknown> = {};
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

import HomeScreen from '@/screens/HomeScreen';

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    childName: null,
    avatarId: null,
    xp: 0,
    level: 1,
    weeklyStreak: 0,
    lastSessionDate: null,
    ...overrides,
  };
}

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockState();
  });

  it('renders greeting with child name', () => {
    setMockState({ childName: 'Emma' });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('Hi, Emma!')).toBeTruthy();
  });

  it('renders fallback greeting when no name', () => {
    setMockState({ childName: null });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('Hi, Mathematician!')).toBeTruthy();
  });

  it('renders current level', () => {
    setMockState({ level: 5 });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('Level 5')).toBeTruthy();
  });

  it('renders XP progress', () => {
    // Level 2 starts at 120 XP. 150 XP = 30 XP into level 2.
    // Level 3 threshold = 260 XP, so xpNeededForNextLevel = 260 - 120 = 140.
    setMockState({ xp: 150, level: 2 });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('30 / 140 XP')).toBeTruthy();
  });

  it('renders streak count', () => {
    setMockState({ weeklyStreak: 3 });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('3 week streak')).toBeTruthy();
  });

  it('renders Start Practice button', () => {
    const { getByLabelText } = render(<HomeScreen />);
    expect(getByLabelText('Start Practice')).toBeTruthy();
  });

  it('navigates to Session on button press', () => {
    const { getByLabelText } = render(<HomeScreen />);

    fireEvent.press(getByLabelText('Start Practice'));

    expect(mockNavigate).toHaveBeenCalledWith('Session', {
      sessionId: expect.any(String),
    });
  });
});
