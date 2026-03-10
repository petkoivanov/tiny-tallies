import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View: (props: any) => <View {...props} />,
    },
    useSharedValue: () => ({ value: 0 }),
    useAnimatedStyle: () => ({}),
    withSequence: jest.fn(),
    withSpring: jest.fn(),
    withTiming: jest.fn(),
    withRepeat: jest.fn(),
    Easing: { inOut: jest.fn(() => jest.fn()), ease: {} },
  };
});

jest.mock('@/theme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#7c3aed',
      textPrimary: '#ffffff',
      textSecondary: '#cbd5e1',
    },
  }),
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: {
    fontFamily: { semiBold: 'Lexend_600SemiBold' },
    fontSize: { sm: 14, md: 16 },
  },
  springConfigs: {
    bounce: { damping: 4, stiffness: 300 },
    medium: { damping: 6, stiffness: 200 },
    settle: { damping: 8 },
    heavy: { damping: 18, stiffness: 180, mass: 0.8, overshootClamping: true },
  },
}));

jest.mock('@/store/constants/avatars', () => ({
  resolveAvatar: (id: string) => ({
    id,
    label: 'Fox',
    emoji: '🦊',
  }),
}));

import { CharacterReaction } from '@/components/animations/CharacterReaction';

describe('CharacterReaction', () => {
  it('renders with default avatar', () => {
    const { getByText } = render(
      <CharacterReaction avatarId={null} reaction={null} />,
    );
    expect(getByText('🦊')).toBeTruthy();
  });

  it('renders with specified avatar', () => {
    const { getByText } = render(
      <CharacterReaction avatarId="owl" reaction={null} />,
    );
    expect(getByText('🦊')).toBeTruthy(); // mock always returns fox
  });

  it('shows message on correct reaction', () => {
    const { getByText } = render(
      <CharacterReaction avatarId="fox" reaction="correct" resetKey={0} />,
    );
    expect(getByText('Great job!')).toBeTruthy();
  });

  it('shows message on incorrect reaction', () => {
    const { getByText } = render(
      <CharacterReaction avatarId="fox" reaction="incorrect" resetKey={0} />,
    );
    expect(getByText('Try again!')).toBeTruthy();
  });

  it('shows streak message', () => {
    const { getByText } = render(
      <CharacterReaction avatarId="fox" reaction="streak" resetKey={0} />,
    );
    expect(getByText('On fire!')).toBeTruthy();
  });

  it('shows no message on idle', () => {
    const { queryByText } = render(
      <CharacterReaction avatarId="fox" reaction="idle" resetKey={0} />,
    );
    expect(queryByText('Great job!')).toBeNull();
    expect(queryByText('Try again!')).toBeNull();
  });

  it('cycles through messages with resetKey', () => {
    const { getByText, rerender } = render(
      <CharacterReaction avatarId="fox" reaction="correct" resetKey={0} />,
    );
    expect(getByText('Great job!')).toBeTruthy();

    rerender(
      <CharacterReaction avatarId="fox" reaction="correct" resetKey={1} />,
    );
    expect(getByText('You got it!')).toBeTruthy();
  });

  it('renders with testID', () => {
    const { getByTestId } = render(
      <CharacterReaction
        avatarId="fox"
        reaction={null}
        testID="character-reaction"
      />,
    );
    expect(getByTestId('character-reaction')).toBeTruthy();
  });
});
