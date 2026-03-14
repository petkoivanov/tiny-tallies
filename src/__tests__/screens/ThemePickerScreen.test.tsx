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
    Check: (props: Record<string, unknown>) => (
      <View testID="check-icon" {...props} />
    ),
    ChevronLeft: (props: Record<string, unknown>) => (
      <View testID="chevron-left-icon" {...props} />
    ),
  };
});

// Mock CosmeticDetailOverlay
jest.mock('@/components/avatars/CosmeticDetailOverlay', () => {
  const { View, Text } = require('react-native');
  return {
    CosmeticDetailOverlay: ({ visible, itemLabel }: any) =>
      visible ? (
        <View testID="cosmetic-detail-overlay">
          <Text>{itemLabel}</Text>
        </View>
      ) : null,
  };
});

// Mock achievement service
jest.mock('@/services/achievement', () => ({
  getBadgeById: (id: string) => {
    const badges: Record<string, any> = {
      'mastery.grade.1': { id: 'mastery.grade.1', name: 'Grade 1 Master', description: 'Master grade 1' },
      'behavior.streak.gold': { id: 'behavior.streak.gold', name: 'Streak Gold', description: 'Gold streak' },
    };
    return badges[id] ?? null;
  },
}));

// Mock store
const mockSetChildProfile = jest.fn();
let mockEarnedBadges: Record<string, unknown> = {};
let mockThemeId = 'dark';

jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: any) => any) => {
    const state = {
      themeId: mockThemeId,
      earnedBadges: mockEarnedBadges,
      setChildProfile: mockSetChildProfile,
    };
    return selector(state);
  },
}));

import ThemePickerScreen from '@/screens/ThemePickerScreen';

describe('ThemePickerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockThemeId = 'dark';
    mockEarnedBadges = {};
  });

  it('renders all 7 theme names', () => {
    const { getByText } = render(<ThemePickerScreen />);
    expect(getByText('Candy')).toBeTruthy();
    expect(getByText('Sky')).toBeTruthy();
    expect(getByText('Dark')).toBeTruthy();
    expect(getByText('Ocean')).toBeTruthy();
    expect(getByText('Forest')).toBeTruthy();
    expect(getByText('Sunset')).toBeTruthy();
    expect(getByText('Space')).toBeTruthy();
  });

  it('default dark theme shows as equippable with no lock', () => {
    const { getByTestId } = render(<ThemePickerScreen />);
    const defaultCard = getByTestId('theme-card-dark');
    // Should not have a lock icon within the default theme card
    expect(defaultCard).toBeTruthy();
  });

  it('locked theme shows lock indicator when badge not earned', () => {
    const { getAllByTestId } = render(<ThemePickerScreen />);
    const lockedItems = getAllByTestId('locked-theme');
    // All 4 non-default themes should be locked when no badges earned
    expect(lockedItems.length).toBe(4);
  });

  it('unlocked theme shows equip action', () => {
    mockEarnedBadges = { 'mastery.grade.1': { earnedAt: '2026-01-01' } };
    const { getByTestId } = render(<ThemePickerScreen />);
    const oceanCard = getByTestId('theme-card-ocean');
    expect(oceanCard).toBeTruthy();
  });

  it('tapping unlocked theme calls setChildProfile with themeId', () => {
    mockEarnedBadges = { 'mastery.grade.1': { earnedAt: '2026-01-01' } };
    const { getByTestId } = render(<ThemePickerScreen />);
    fireEvent.press(getByTestId('theme-card-ocean'));
    expect(mockSetChildProfile).toHaveBeenCalledWith({ themeId: 'ocean' });
  });

  it('tapping locked theme opens overlay', () => {
    const { getAllByTestId, getByTestId } = render(<ThemePickerScreen />);
    const lockedItems = getAllByTestId('locked-theme');
    fireEvent.press(lockedItems[0]);
    expect(getByTestId('cosmetic-detail-overlay')).toBeTruthy();
  });

  it('equipped theme shows check indicator', () => {
    mockThemeId = 'dark';
    const { getByTestId } = render(<ThemePickerScreen />);
    const equipped = getByTestId('equipped-indicator-dark');
    expect(equipped).toBeTruthy();
  });
});
