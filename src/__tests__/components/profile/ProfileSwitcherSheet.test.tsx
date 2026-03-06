import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Check: (props: any) => <View testID="check-icon" {...props} />,
    Shield: (props: any) => <View testID="shield-icon" {...props} />,
    UserPlus: (props: any) => <View testID="user-plus-icon" {...props} />,
  };
});

// Mock react-native-reanimated
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
    useReducedMotion: jest.fn(() => false),
  };
});

// Mock AvatarCircle
jest.mock('@/components/avatars', () => {
  const { View, Text } = require('react-native');
  return {
    AvatarCircle: ({ emoji, onPress }: any) => (
      <View testID="avatar-circle" onPress={onPress}>
        <Text>{emoji}</Text>
      </View>
    ),
  };
});

// Mock avatar constants
jest.mock('@/store/constants/avatars', () => ({
  AVATARS: [{ id: 'default', emoji: '🧒' }],
  DEFAULT_AVATAR_ID: 'default',
  SPECIAL_AVATARS: [],
  FRAMES: [],
  resolveAvatar: (id: string | null) => ({ id: id ?? 'default', emoji: '🧒' }),
}));

// Mock store state
let mockStoreState: Record<string, unknown> = {};
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

import { ProfileSwitcherSheet } from '@/components/profile';

const mockSwitchChild = jest.fn();

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    children: {
      'child-1': {
        childName: 'Alice',
        childAge: 7,
        childGrade: 2,
        avatarId: null,
      },
      'child-2': {
        childName: 'Bob',
        childAge: 8,
        childGrade: 3,
        avatarId: null,
      },
    },
    activeChildId: 'child-1',
    childName: 'Alice',
    avatarId: null,
    switchChild: mockSwitchChild,
    ...overrides,
  };
}

describe('ProfileSwitcherSheet', () => {
  const mockOnClose = jest.fn();
  const mockOnManageProfiles = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setMockState();
  });

  it('renders all child profiles when visible', () => {
    const { getByText } = render(
      <ProfileSwitcherSheet
        visible={true}
        onClose={mockOnClose}
        onManageProfiles={mockOnManageProfiles}
      />
    );

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
  });

  it('shows Switch Profile title', () => {
    const { getByText } = render(
      <ProfileSwitcherSheet
        visible={true}
        onClose={mockOnClose}
        onManageProfiles={mockOnManageProfiles}
      />
    );

    expect(getByText('Switch Profile')).toBeTruthy();
  });

  it('calls switchChild and onClose when tapping non-active profile', () => {
    const { getByText } = render(
      <ProfileSwitcherSheet
        visible={true}
        onClose={mockOnClose}
        onManageProfiles={mockOnManageProfiles}
      />
    );

    fireEvent.press(getByText('Bob'));

    expect(mockSwitchChild).toHaveBeenCalledWith('child-2');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not call switchChild when tapping active profile', () => {
    const { getByText } = render(
      <ProfileSwitcherSheet
        visible={true}
        onClose={mockOnClose}
        onManageProfiles={mockOnManageProfiles}
      />
    );

    fireEvent.press(getByText('Alice'));

    expect(mockSwitchChild).not.toHaveBeenCalled();
  });

  it('calls onManageProfiles when Manage Profiles is pressed', () => {
    const { getByText } = render(
      <ProfileSwitcherSheet
        visible={true}
        onClose={mockOnClose}
        onManageProfiles={mockOnManageProfiles}
      />
    );

    fireEvent.press(getByText('Manage Profiles'));

    expect(mockOnManageProfiles).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is pressed', () => {
    const { getByTestId } = render(
      <ProfileSwitcherSheet
        visible={true}
        onClose={mockOnClose}
        onManageProfiles={mockOnManageProfiles}
      />
    );

    fireEvent.press(getByTestId('switcher-backdrop'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows profile count', () => {
    const { getByText } = render(
      <ProfileSwitcherSheet
        visible={true}
        onClose={mockOnClose}
        onManageProfiles={mockOnManageProfiles}
      />
    );

    expect(getByText('2 of 5 profiles')).toBeTruthy();
  });

  it('reads active child name from flat state (not stale map)', () => {
    // Simulate flat state having updated name while map is stale
    setMockState({
      childName: 'Alicia',
      children: {
        'child-1': {
          childName: 'Alice', // stale name in map
          childAge: 7,
          childGrade: 2,
          avatarId: null,
        },
        'child-2': {
          childName: 'Bob',
          childAge: 8,
          childGrade: 3,
          avatarId: null,
        },
      },
    });

    const { getByText, queryByText } = render(
      <ProfileSwitcherSheet
        visible={true}
        onClose={mockOnClose}
        onManageProfiles={mockOnManageProfiles}
      />
    );

    // Should show fresh flat state name, not stale map name
    expect(getByText('Alicia')).toBeTruthy();
  });

  it('renders with 3 children', () => {
    setMockState({
      children: {
        'child-1': { childName: 'Alice', avatarId: null },
        'child-2': { childName: 'Bob', avatarId: null },
        'child-3': { childName: 'Carol', avatarId: null },
      },
    });

    const { getByText } = render(
      <ProfileSwitcherSheet
        visible={true}
        onClose={mockOnClose}
        onManageProfiles={mockOnManageProfiles}
      />
    );

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
    expect(getByText('Carol')).toBeTruthy();
    expect(getByText('3 of 5 profiles')).toBeTruthy();
  });
});
