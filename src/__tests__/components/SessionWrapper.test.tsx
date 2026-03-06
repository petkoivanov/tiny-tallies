import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

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

// Mock store
let mockThemeId = 'dark';
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: any) => any) => {
    const state = {
      themeId: mockThemeId,
    };
    return selector(state);
  },
}));

import { SessionWrapper } from '@/components/session/SessionWrapper';

describe('SessionWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockThemeId = 'dark';
  });

  it('renders children unchanged', () => {
    const { getByText } = render(
      <SessionWrapper>
        <Text>Math Problem</Text>
      </SessionWrapper>,
    );
    expect(getByText('Math Problem')).toBeTruthy();
  });

  it('renders with default dark theme', () => {
    mockThemeId = 'dark';
    const { getByTestId } = render(
      <SessionWrapper>
        <Text>Content</Text>
      </SessionWrapper>,
    );
    expect(getByTestId('session-wrapper')).toBeTruthy();
  });

  it('decorative container has pointerEvents none', () => {
    const { getByTestId } = render(
      <SessionWrapper>
        <Text>Content</Text>
      </SessionWrapper>,
    );
    const decorLayer = getByTestId('session-decorations');
    expect(decorLayer.props.pointerEvents).toBe('none');
  });

  it('renders decorations for ocean theme', () => {
    mockThemeId = 'ocean';
    const { getByTestId } = render(
      <SessionWrapper>
        <Text>Content</Text>
      </SessionWrapper>,
    );
    expect(getByTestId('session-decorations')).toBeTruthy();
  });

  it('renders decorations for space theme', () => {
    mockThemeId = 'space';
    const { getByTestId } = render(
      <SessionWrapper>
        <Text>Content</Text>
      </SessionWrapper>,
    );
    expect(getByTestId('session-decorations')).toBeTruthy();
  });
});
