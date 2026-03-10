import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { InteractionManager } from 'react-native';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
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
    withSpring: (v: any) => v,
    withDelay: (_d: number, v: any) => v,
    withRepeat: (v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    Easing: {
      in: (e: any) => e,
      inOut: (e: any) => e,
      ease: (v: any) => v,
      quad: (v: any) => v,
      linear: (v: any) => v,
    },
    useReducedMotion: jest.fn(() => false),
  };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View {...props} />,
    Svg: (props: any) => <View {...props} />,
    Circle: (props: any) => <View {...props} />,
    Path: (props: any) => <View {...props} />,
    G: (props: any) => <View {...props} />,
    Text: (props: any) => <Text {...props} />,
    Line: (props: any) => <View {...props} />,
  };
});

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    ChevronLeft: (props: any) => (
      <View testID="chevron-left-icon" {...props} />
    ),
    Star: (props: any) => <View testID="star-icon" {...props} />,
  };
});

// Mock prerequisiteGating
jest.mock('@/services/adaptive/prerequisiteGating', () => ({
  isSkillUnlocked: jest.fn(() => true),
  getOuterFringe: jest.fn(() => []),
}));

// Mock skillStateHelpers
jest.mock('@/store/helpers/skillStateHelpers', () => ({
  getOrCreateSkillState: (
    skillStates: Record<string, unknown>,
    skillId: string,
  ) =>
    skillStates[skillId] ?? {
      eloRating: 1000,
      attempts: 0,
      correct: 0,
      masteryProbability: 0.1,
      consecutiveWrong: 0,
      masteryLocked: false,
      leitnerBox: 1,
      nextReviewDue: null,
      consecutiveCorrectInBox6: 0,
      cpaLevel: 'concrete',
    },
}));

// Mock store
let mockStoreState: Record<string, unknown> = {};
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

import SkillMapScreen from '@/screens/SkillMapScreen';
import { SKILLS } from '@/services/mathEngine/skills';

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    skillStates: {},
    ...overrides,
  };
}

describe('SkillMapScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockState();

    // Ensure InteractionManager.runAfterInteractions runs callback synchronously
    jest
      .spyOn(InteractionManager, 'runAfterInteractions')
      .mockImplementation((callback: any) => {
        if (typeof callback === 'function') callback();
        else if (callback?.gen) callback.gen();
        return { cancel: jest.fn(), done: Promise.resolve() } as any;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders Skill Map header', () => {
    const { getByText } = render(<SkillMapScreen />);
    expect(getByText('Skill Map')).toBeTruthy();
  });

  it('back button calls goBack', () => {
    const { getByTestId } = render(<SkillMapScreen />);
    fireEvent.press(getByTestId('back-button'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('renders skill map container after layout', () => {
    const { getByTestId, queryByText, getAllByTestId } = render(
      <SkillMapScreen />,
    );

    const container = getByTestId('skill-map-container');

    // Trigger layout event to provide dimensions
    act(() => {
      fireEvent(container, 'layout', {
        nativeEvent: { layout: { width: 400, height: 700 } },
      });
    });

    // After layout + InteractionManager (mocked synchronous), graph should render
    // Loading text should be gone
    expect(queryByText('Loading skill map...')).toBeNull();

    // Tap targets for all skill nodes should exist
    const tapTargets = getAllByTestId(/^node-tap-/);
    expect(tapTargets).toHaveLength(SKILLS.length);
  });

  it('opens detail overlay when node is tapped', () => {
    const { getByTestId, queryByText, getByText } = render(
      <SkillMapScreen />,
    );

    const container = getByTestId('skill-map-container');

    // Trigger layout event
    act(() => {
      fireEvent(container, 'layout', {
        nativeEvent: { layout: { width: 400, height: 700 } },
      });
    });

    // No overlay content visible initially
    expect(queryByText('Add within 10')).toBeNull();

    // Tap the first addition skill node
    const tapTarget = getByTestId('node-tap-addition.single-digit.no-carry');
    act(() => {
      fireEvent.press(tapTarget);
    });

    // Overlay should now show the skill name
    expect(getByText('Add within 10')).toBeTruthy();
  });

  it('closes detail overlay when backdrop pressed', () => {
    const { getByTestId, queryByText, getByText } = render(
      <SkillMapScreen />,
    );

    const container = getByTestId('skill-map-container');

    // Trigger layout event
    act(() => {
      fireEvent(container, 'layout', {
        nativeEvent: { layout: { width: 400, height: 700 } },
      });
    });

    // Open the overlay
    const tapTarget = getByTestId('node-tap-addition.single-digit.no-carry');
    act(() => {
      fireEvent.press(tapTarget);
    });

    expect(getByText('Add within 10')).toBeTruthy();

    // Press backdrop to close
    const backdrop = getByTestId('overlay-backdrop');
    act(() => {
      fireEvent.press(backdrop);
    });

    // Overlay should be dismissed
    expect(queryByText('Add within 10')).toBeNull();
  });
});
