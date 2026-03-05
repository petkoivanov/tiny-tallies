import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock reanimated
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
    withRepeat: (v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    Easing: { linear: (v: any) => v },
    useReducedMotion: jest.fn(() => false),
  };
});

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Lock: (props: Record<string, unknown>) => (
      <View testID="lock-icon" {...props} />
    ),
    ChevronLeft: (props: Record<string, unknown>) => (
      <View testID="chevron-left-icon" {...props} />
    ),
  };
});

// Mock store
const mockSetChildProfile = jest.fn();
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: any) => any) => {
    const state = {
      avatarId: 'fox',
      frameId: null,
      earnedBadges: {
        'behavior.sessions.bronze': { earnedAt: '2026-01-01' },
        'behavior.streak.bronze': { earnedAt: '2026-01-02' },
      },
      setChildProfile: mockSetChildProfile,
    };
    return selector(state);
  },
}));

// Mock achievement service
jest.mock('@/services/achievement', () => ({
  getBadgeById: (id: string) => {
    const badges: Record<string, any> = {
      'behavior.sessions.bronze': {
        id: 'behavior.sessions.bronze',
        name: 'Getting Started',
        description: 'Complete 5 sessions',
        emoji: '\u2B50',
      },
      'mastery.category.addition': {
        id: 'mastery.category.addition',
        name: 'Addition Master',
        description: 'Master all addition skills',
        emoji: '\u2795',
      },
    };
    return badges[id] ?? null;
  },
}));

import AvatarPickerScreen from '@/screens/AvatarPickerScreen';

describe('AvatarPickerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section headers for Avatars, Special Avatars, and Frames', () => {
    const { getByText } = render(<AvatarPickerScreen />);
    expect(getByText('Avatars')).toBeTruthy();
    expect(getByText('Special Avatars')).toBeTruthy();
    expect(getByText('Frames')).toBeTruthy();
  });

  it('renders 14 avatar items in the Avatars section', () => {
    const { getAllByTestId } = render(<AvatarPickerScreen />);
    const avatarItems = getAllByTestId('avatar-item');
    expect(avatarItems.length).toBe(14);
  });

  it('tapping an unlocked avatar updates the preview', () => {
    const { getAllByTestId, getByTestId } = render(<AvatarPickerScreen />);
    const avatarItems = getAllByTestId('avatar-item');
    // Tap the second avatar (owl)
    fireEvent.press(avatarItems[1]);
    // Preview should update -- check the preview testID shows different emoji
    const preview = getByTestId('avatar-preview-label');
    expect(preview.props.children).toBe('Owl');
  });

  it('tapping Save calls setChildProfile and goBack', () => {
    const { getByTestId } = render(<AvatarPickerScreen />);
    fireEvent.press(getByTestId('save-button'));
    expect(mockSetChildProfile).toHaveBeenCalledWith({
      avatarId: 'fox',
      frameId: null,
    });
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('locked items have reduced opacity', () => {
    const { getAllByTestId } = render(<AvatarPickerScreen />);
    const lockedItems = getAllByTestId('locked-item');
    // At least some items should be locked (special avatars + frames without earned badges)
    expect(lockedItems.length).toBeGreaterThan(0);
    lockedItems.forEach((item) => {
      const styleArray = Array.isArray(item.props.style)
        ? item.props.style
        : [item.props.style];
      const hasOpacity = styleArray.some(
        (s: Record<string, unknown> | false | undefined) =>
          s && typeof s === 'object' && (s as { opacity?: number }).opacity === 0.4,
      );
      expect(hasOpacity).toBe(true);
    });
  });

  it('tapping a locked item shows the detail overlay', () => {
    const { getAllByTestId, getByTestId } = render(<AvatarPickerScreen />);
    const lockedItems = getAllByTestId('locked-item');
    fireEvent.press(lockedItems[0]);
    expect(getByTestId('cosmetic-detail-overlay')).toBeTruthy();
  });
});
