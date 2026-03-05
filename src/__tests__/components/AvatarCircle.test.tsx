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
    withRepeat: (_v: any) => _v,
    withSequence: (...args: any[]) => args[args.length - 1],
    Easing: { linear: (v: any) => v },
    useReducedMotion: jest.fn(() => false),
  };
});

import { AvatarCircle } from '@/components/avatars';

describe('AvatarCircle', () => {
  it('renders emoji text', () => {
    const foxEmoji = String.fromCodePoint(0x1F98A);
    const { getByText } = render(
      <AvatarCircle emoji={foxEmoji} size={80} />,
    );
    expect(getByText(foxEmoji)).toBeTruthy();
  });

  it('renders with frame border when frameColor provided', () => {
    const { getByTestId } = render(
      <AvatarCircle emoji="\uD83E\uDD8A" size={80} frameColor="#ffd700" />,
    );
    const circle = getByTestId('avatar-circle');
    expect(circle).toBeTruthy();
  });

  it('does not render border when no frameColor', () => {
    const { getByTestId } = render(
      <AvatarCircle emoji="\uD83E\uDD8A" size={80} />,
    );
    const circle = getByTestId('avatar-circle');
    expect(circle).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <AvatarCircle emoji="\uD83E\uDD8A" size={80} onPress={onPressMock} />,
    );
    fireEvent.press(getByTestId('avatar-pressable'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders sparkle elements when isSpecial is true', () => {
    const { getByTestId } = render(
      <AvatarCircle emoji="\uD83E\uDD84" size={80} isSpecial />,
    );
    expect(getByTestId('sparkle-container')).toBeTruthy();
  });

  it('does not render sparkle elements when isSpecial is false', () => {
    const { queryByTestId } = render(
      <AvatarCircle emoji="\uD83E\uDD8A" size={80} isSpecial={false} />,
    );
    expect(queryByTestId('sparkle-container')).toBeNull();
  });

  it('does not render sparkle elements when isSpecial is undefined', () => {
    const { queryByTestId } = render(
      <AvatarCircle emoji="\uD83E\uDD8A" size={80} />,
    );
    expect(queryByTestId('sparkle-container')).toBeNull();
  });

  it('renders without Pressable when no onPress', () => {
    const { queryByTestId, getByTestId } = render(
      <AvatarCircle emoji="\uD83E\uDD8A" size={80} />,
    );
    expect(queryByTestId('avatar-pressable')).toBeNull();
    expect(getByTestId('avatar-circle')).toBeTruthy();
  });
});
