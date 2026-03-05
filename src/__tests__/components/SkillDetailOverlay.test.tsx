import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock react-native-svg (just in case)
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

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Star: (props: any) => <View testID="star-icon" {...props} />,
    Lock: (props: any) => <View testID="lock-icon" {...props} />,
    Check: (props: any) => <View testID="check-icon" {...props} />,
    X: (props: any) => <View testID="x-icon" {...props} />,
  };
});

// Mock skills
jest.mock('@/services/mathEngine/skills', () => ({
  getSkillById: (id: string) => {
    const skills: Record<string, any> = {
      'addition.single-digit.no-carry': {
        id: 'addition.single-digit.no-carry',
        name: 'Add within 10',
        operation: 'addition',
        grade: 1,
        prerequisites: [],
      },
      'addition.within-20.with-carry': {
        id: 'addition.within-20.with-carry',
        name: 'Add within 20 (with carry)',
        operation: 'addition',
        grade: 1,
        prerequisites: ['addition.within-20.no-carry'],
      },
      'addition.within-20.no-carry': {
        id: 'addition.within-20.no-carry',
        name: 'Add within 20 (no carry)',
        operation: 'addition',
        grade: 1,
        prerequisites: ['addition.single-digit.no-carry'],
      },
      'subtraction.two-digit.no-borrow': {
        id: 'subtraction.two-digit.no-borrow',
        name: 'Subtract two-digit (no borrow)',
        operation: 'subtraction',
        grade: 2,
        prerequisites: [
          'subtraction.within-20.with-borrow',
          'addition.two-digit.no-carry',
        ],
      },
    };
    return skills[id] ?? undefined;
  },
  SKILLS: [],
}));

// Mock prerequisiteGating
jest.mock('@/services/adaptive/prerequisiteGating', () => ({
  isSkillUnlocked: jest.fn(() => true),
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

// Mock skillMapLayout (getNodeState)
jest.mock('@/components/skillMap/skillMapLayout', () => ({
  getNodeState: (skillId: string, skillStates: Record<string, any>) => {
    const state = skillStates[skillId];
    if (!state) return 'unlocked';
    if (state.masteryLocked) return 'mastered';
    if (state.attempts > 0) return 'in-progress';
    return 'locked';
  },
}));

import { SkillDetailOverlay } from '@/components/skillMap/SkillDetailOverlay';
import type { SkillState } from '@/store/slices/skillStatesSlice';

const makeSkillState = (overrides: Partial<SkillState> = {}): SkillState => ({
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
  ...overrides,
});

describe('SkillDetailOverlay', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when skillId is null', () => {
    const { toJSON } = render(
      <SkillDetailOverlay
        skillId={null}
        skillStates={{}}
        onClose={mockOnClose}
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it('shows skill name and operation emoji for in-progress skill', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 10,
        masteryProbability: 0.55,
        leitnerBox: 3,
      }),
    };

    const { getByText } = render(
      <SkillDetailOverlay
        skillId="addition.single-digit.no-carry"
        skillStates={skillStates}
        onClose={mockOnClose}
      />,
    );

    expect(getByText('Add within 10')).toBeTruthy();
    // Operation emoji for addition
    expect(getByText('+')).toBeTruthy();
  });

  it('shows progress bar for in-progress skill', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 10,
        masteryProbability: 0.55,
        leitnerBox: 3,
      }),
    };

    const { getByText } = render(
      <SkillDetailOverlay
        skillId="addition.single-digit.no-carry"
        skillStates={skillStates}
        onClose={mockOnClose}
      />,
    );

    expect(getByText('How well you know this!')).toBeTruthy();
  });

  it('shows practice level stars', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 10,
        masteryProbability: 0.55,
        leitnerBox: 3,
      }),
    };

    const { getByText } = render(
      <SkillDetailOverlay
        skillId="addition.single-digit.no-carry"
        skillStates={skillStates}
        onClose={mockOnClose}
      />,
    );

    expect(getByText('Practice level')).toBeTruthy();
  });

  it('shows prerequisite checklist for locked skill', () => {
    // subtraction.two-digit.no-borrow has 2 prereqs
    // Provide a state entry with attempts=0, masteryLocked=false so mock returns 'locked'
    const skillStates: Record<string, SkillState> = {
      'subtraction.two-digit.no-borrow': makeSkillState({
        attempts: 0,
        masteryLocked: false,
      }),
    };

    const { getByText } = render(
      <SkillDetailOverlay
        skillId="subtraction.two-digit.no-borrow"
        skillStates={skillStates}
        onClose={mockOnClose}
      />,
    );

    expect(getByText('Complete these skills first:')).toBeTruthy();
  });

  it('shows mastered celebration for mastered skill', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 50,
        masteryProbability: 0.98,
        masteryLocked: true,
        leitnerBox: 6,
      }),
    };

    const { getByText } = render(
      <SkillDetailOverlay
        skillId="addition.single-digit.no-carry"
        skillStates={skillStates}
        onClose={mockOnClose}
      />,
    );

    expect(getByText('Mastered!')).toBeTruthy();
  });

  it('calls onClose when backdrop pressed', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 10,
        masteryProbability: 0.55,
        leitnerBox: 3,
      }),
    };

    const { getByTestId } = render(
      <SkillDetailOverlay
        skillId="addition.single-digit.no-carry"
        skillStates={skillStates}
        onClose={mockOnClose}
      />,
    );

    fireEvent.press(getByTestId('overlay-backdrop'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not show raw BKT number', () => {
    const skillStates: Record<string, SkillState> = {
      'addition.single-digit.no-carry': makeSkillState({
        attempts: 10,
        masteryProbability: 0.55,
        leitnerBox: 3,
      }),
    };

    const { queryByText } = render(
      <SkillDetailOverlay
        skillId="addition.single-digit.no-carry"
        skillStates={skillStates}
        onClose={mockOnClose}
      />,
    );

    // No raw probability numbers should appear
    expect(queryByText(/0\.\d+/)).toBeNull();
  });
});
