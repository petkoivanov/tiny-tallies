import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: mockRouteParams,
  }),
}));

let mockRouteParams: Record<string, unknown> = {};

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      Text,
      createAnimatedComponent: (c: any) => c,
    },
    useSharedValue: (init: any) => ({ value: init }),
    useAnimatedStyle: (fn: () => any) => fn(),
    withTiming: (v: any) => v,
    withSpring: (v: any) => v,
    withRepeat: (v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    Easing: { inOut: () => (v: any) => v, ease: (v: any) => v },
    useReducedMotion: jest.fn(() => false),
  };
});

// Mock CharacterReaction
jest.mock('@/components/animations/CharacterReaction', () => {
  const { View } = require('react-native');
  return {
    CharacterReaction: (props: any) => <View testID={props.testID} />,
  };
});

// Mock AvatarCircle
jest.mock('@/components/avatars', () => {
  const { View } = require('react-native');
  return {
    AvatarCircle: (props: any) => <View testID="avatar-circle" />,
  };
});

// Mock avatar constants
jest.mock('@/store/constants/avatars', () => ({
  AVATARS: [
    { id: 'fox', label: 'Fox', emoji: '🦊' },
    { id: 'cat', label: 'Cat', emoji: '🐱' },
    { id: 'dog', label: 'Dog', emoji: '🐶' },
    { id: 'owl', label: 'Owl', emoji: '🦉' },
  ],
  resolveAvatar: (id: string) => {
    const avatars: Record<string, { id: string; label: string; emoji: string }> = {
      fox: { id: 'fox', label: 'Fox', emoji: '🦊' },
      cat: { id: 'cat', label: 'Cat', emoji: '🐱' },
      dog: { id: 'dog', label: 'Dog', emoji: '🐶' },
      owl: { id: 'owl', label: 'Owl', emoji: '🦉' },
    };
    return avatars[id] ?? avatars.fox;
  },
}));

// Mock store state
let mockStoreState: Record<string, unknown> = {};
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

import CharacterSelectScreen from '@/screens/CharacterSelectScreen';

const mockSetChildProfile = jest.fn();

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    avatarId: 'fox',
    setChildProfile: mockSetChildProfile,
    ...overrides,
  };
}

describe('CharacterSelectScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {};
    setMockState();
  });

  it('renders title and subtitle', () => {
    const { getByText } = render(<CharacterSelectScreen />);

    expect(getByText('Choose Your Character')).toBeTruthy();
    expect(getByText('Pick a math buddy to learn with!')).toBeTruthy();
  });

  it('renders character preview', () => {
    const { getByTestId } = render(<CharacterSelectScreen />);
    expect(getByTestId('character-preview')).toBeTruthy();
  });

  it('renders avatar grid with correct count', () => {
    const { getAllByTestId } = render(<CharacterSelectScreen />);

    // 4 avatars in our mock — match specific IDs like avatar-fox, avatar-cat
    const avatarButtons = getAllByTestId(/^avatar-(fox|cat|dog|owl)$/);
    expect(avatarButtons.length).toBe(4);
  });

  it('shows selected avatar label', () => {
    const { getByText } = render(<CharacterSelectScreen />);
    expect(getByText('Fox')).toBeTruthy();
  });

  it('updates preview when avatar is selected', () => {
    const { getByTestId, getByText } = render(<CharacterSelectScreen />);

    fireEvent.press(getByTestId('avatar-cat'));
    expect(getByText('Cat')).toBeTruthy();
  });

  it('confirm button saves avatar and goes back (non-onboarding)', () => {
    mockRouteParams = {};
    const { getByTestId } = render(<CharacterSelectScreen />);

    fireEvent.press(getByTestId('avatar-owl'));
    fireEvent.press(getByTestId('confirm-button'));

    expect(mockSetChildProfile).toHaveBeenCalledWith({ avatarId: 'owl' });
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('confirm button shows "Next" text during onboarding', () => {
    mockRouteParams = { fromOnboarding: true };
    const { getByText } = render(<CharacterSelectScreen />);

    expect(getByText('Next')).toBeTruthy();
  });

  it('confirm button navigates to PlacementTest during onboarding', () => {
    mockRouteParams = { fromOnboarding: true };
    const { getByTestId } = render(<CharacterSelectScreen />);

    fireEvent.press(getByTestId('confirm-button'));

    expect(mockSetChildProfile).toHaveBeenCalledWith({ avatarId: 'fox' });
    expect(mockNavigate).toHaveBeenCalledWith('PlacementTest');
  });

  it('shows skip button during onboarding', () => {
    mockRouteParams = { fromOnboarding: true };
    const { getByTestId } = render(<CharacterSelectScreen />);

    expect(getByTestId('skip-button')).toBeTruthy();
  });

  it('skip button navigates to PlacementTest during onboarding', () => {
    mockRouteParams = { fromOnboarding: true };
    const { getByTestId } = render(<CharacterSelectScreen />);

    fireEvent.press(getByTestId('skip-button'));
    expect(mockNavigate).toHaveBeenCalledWith('PlacementTest');
  });

  it('does not show skip button outside onboarding', () => {
    mockRouteParams = {};
    const { queryByTestId } = render(<CharacterSelectScreen />);

    expect(queryByTestId('skip-button')).toBeNull();
  });

  it('confirm button shows "Choose" text outside onboarding', () => {
    mockRouteParams = {};
    const { getByText } = render(<CharacterSelectScreen />);

    expect(getByText('Choose')).toBeTruthy();
  });
});
