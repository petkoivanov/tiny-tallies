import React from 'react';
import { render } from '@testing-library/react-native';

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

// Mock prerequisiteGating
const mockIsSkillUnlocked = jest.fn();
jest.mock('@/services/adaptive/prerequisiteGating', () => ({
  isSkillUnlocked: (...args: unknown[]) => mockIsSkillUnlocked(...args),
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

import { SkillMapGraph } from '@/components/skillMap/SkillMapGraph';
import { SKILLS } from '@/services/mathEngine/skills';
import type { SkillState } from '@/store/slices/skillStatesSlice';

function makeSkillState(overrides: Partial<SkillState> = {}): SkillState {
  return {
    eloRating: 1000,
    attempts: 0,
    correct: 0,
    masteryProbability: 0.1,
    consecutiveWrong: 0,
    masteryLocked: false,
    leitnerBox: 1 as const,
    nextReviewDue: null,
    consecutiveCorrectInBox6: 0,
    cpaLevel: 'concrete' as const,
    ...overrides,
  };
}

describe('SkillMapGraph', () => {
  const defaultProps = {
    width: 400,
    height: 800,
    skillStates: {} as Record<string, SkillState>,
    outerFringeIds: [] as string[],
    onNodePress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: all skills locked except roots
    mockIsSkillUnlocked.mockImplementation((skillId: string) => {
      return (
        skillId === 'addition.single-digit.no-carry' ||
        skillId === 'subtraction.single-digit.no-borrow'
      );
    });
  });

  it('renders one tap target per skill', () => {
    const { getAllByTestId } = render(<SkillMapGraph {...defaultProps} />);
    const tapTargets = getAllByTestId(/^node-tap-/);
    expect(tapTargets).toHaveLength(SKILLS.length);
  });

  it('renders mastered node when skillStates indicate mastery', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        masteryLocked: true,
        attempts: 50,
        correct: 45,
        masteryProbability: 0.98,
      }),
    };

    const { getByTestId } = render(
      <SkillMapGraph {...defaultProps} skillStates={skillStates} />,
    );

    // The tap target for the mastered node should exist
    const masteredTap = getByTestId(
      'node-tap-addition.single-digit.no-carry',
    );
    expect(masteredTap).toBeTruthy();
    // accessibility label should reflect mastered state
    expect(masteredTap.props.accessibilityLabel).toContain('mastered');
  });

  it('renders locked node for skill with unmastered prerequisites', () => {
    mockIsSkillUnlocked.mockReturnValue(false);

    const { getByTestId } = render(<SkillMapGraph {...defaultProps} />);

    const lockedTap = getByTestId(
      'node-tap-subtraction.within-20.no-borrow',
    );
    expect(lockedTap).toBeTruthy();
    expect(lockedTap.props.accessibilityLabel).toContain('locked');
  });

  it('calls onNodePress when a tap target is pressed', () => {
    const onNodePress = jest.fn();
    const { getByTestId } = render(
      <SkillMapGraph {...defaultProps} onNodePress={onNodePress} />,
    );

    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.press(
      getByTestId('node-tap-addition.single-digit.no-carry'),
    );

    expect(onNodePress).toHaveBeenCalledWith(
      'addition.single-digit.no-carry',
    );
  });
});
