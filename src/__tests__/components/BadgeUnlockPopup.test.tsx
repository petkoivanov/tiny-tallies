import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      Text: require('react-native').Text,
      createAnimatedComponent: (c: any) => c,
      call: jest.fn(),
    },
    useSharedValue: (init: any) => ({ value: init }),
    useAnimatedStyle: (fn: () => any) => fn(),
    withTiming: (v: any) => v,
    withSpring: (v: any) => v,
    withDelay: (_d: number, v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    Easing: { in: (e: any) => e, quad: (v: any) => v, linear: (v: any) => v },
    useReducedMotion: jest.fn(() => false),
  };
});

// Mock achievement service
jest.mock('@/services/achievement', () => ({
  getBadgeById: (id: string) => {
    const badges: Record<string, any> = {
      'badge-1': {
        id: 'badge-1',
        name: 'Addition Starter',
        description: 'Master adding within 10',
        tier: 'gold',
      },
      'badge-2': {
        id: 'badge-2',
        name: 'Quick Adder',
        description: 'Master adding within 20',
        tier: 'silver',
      },
      'behavior.sessions.bronze': {
        id: 'behavior.sessions.bronze',
        name: 'Getting Started',
        description: 'Complete 5 sessions',
        tier: 'bronze',
      },
    };
    return badges[id] ?? null;
  },
}));

// Mock BadgeIcon as simple View
jest.mock('@/components/badges', () => {
  const { View } = require('react-native');
  return {
    BadgeIcon: (props: any) => <View testID="badge-icon" {...props} />,
    BADGE_EMOJIS: {
      'badge-1': '\u2B50',
      'badge-2': '\uD83D\uDC8E',
      'behavior.sessions.bronze': '\uD83C\uDFC5',
    },
  };
});

import { BadgeUnlockPopup } from '@/components/animations/BadgeUnlockPopup';

describe('BadgeUnlockPopup', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when badgeIds array is empty', () => {
    const { toJSON } = render(
      <BadgeUnlockPopup badgeIds={[]} onComplete={mockOnComplete} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('shows overlay with first badge name and description when badgeIds has entries', () => {
    const { getByText } = render(
      <BadgeUnlockPopup badgeIds={['badge-1']} onComplete={mockOnComplete} />,
    );
    expect(getByText('Addition Starter')).toBeTruthy();
    expect(getByText('Master adding within 10')).toBeTruthy();
  });

  it('pressing the overlay advances to next badge', () => {
    const { getByText, getByTestId } = render(
      <BadgeUnlockPopup
        badgeIds={['badge-1', 'badge-2']}
        onComplete={mockOnComplete}
      />,
    );
    expect(getByText('Addition Starter')).toBeTruthy();

    fireEvent.press(getByTestId('badge-popup-overlay'));

    expect(getByText('Quick Adder')).toBeTruthy();
    expect(getByText('Master adding within 20')).toBeTruthy();
  });

  it('pressing on the last badge calls onComplete callback', () => {
    const { getByTestId } = render(
      <BadgeUnlockPopup badgeIds={['badge-1']} onComplete={mockOnComplete} />,
    );

    fireEvent.press(getByTestId('badge-popup-overlay'));

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('renders BadgeIcon with correct emoji for the displayed badge', () => {
    const { getByTestId } = render(
      <BadgeUnlockPopup badgeIds={['badge-1']} onComplete={mockOnComplete} />,
    );
    const badgeIcon = getByTestId('badge-icon');
    expect(badgeIcon.props.emoji).toBe('\u2B50');
    expect(badgeIcon.props.earned).toBe(true);
  });

  it('shows cosmetic unlock text when badge unlocks a cosmetic item', () => {
    const { getByTestId } = render(
      <BadgeUnlockPopup
        badgeIds={['behavior.sessions.bronze']}
        onComplete={mockOnComplete}
      />,
    );
    const unlockText = getByTestId('cosmetic-unlock-text');
    expect(unlockText.props.children).toContain('Unicorn');
  });

  it('does not show cosmetic unlock text when badge has no cosmetic unlock', () => {
    const { queryByTestId } = render(
      <BadgeUnlockPopup badgeIds={['badge-1']} onComplete={mockOnComplete} />,
    );
    expect(queryByTestId('cosmetic-unlock-text')).toBeNull();
  });
});
