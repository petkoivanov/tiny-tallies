import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

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

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    ChevronLeft: (props: any) => (
      <View testID="chevron-left-icon" {...props} />
    ),
    ChevronRight: (props: any) => (
      <View testID="chevron-right-icon" {...props} />
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

  it('renders domain category sections', () => {
    const { getByText } = render(<SkillMapScreen />);
    expect(getByText('Number Sense')).toBeTruthy();
    expect(getByText('Measurement & Data')).toBeTruthy();
    expect(getByText('Pre-Algebra')).toBeTruthy();
    expect(getByText('Algebra & Beyond')).toBeTruthy();
  });

  it('renders domain cards with names', () => {
    const { getByText } = render(<SkillMapScreen />);
    expect(getByText('Addition')).toBeTruthy();
    expect(getByText('Subtraction')).toBeTruthy();
    expect(getByText('Fractions')).toBeTruthy();
    expect(getByText('Geometry')).toBeTruthy();
  });

  it('navigates to DomainDetail when a domain card is pressed', () => {
    const { getByText } = render(<SkillMapScreen />);

    act(() => {
      fireEvent.press(getByText('Addition'));
    });

    expect(mockNavigate).toHaveBeenCalledWith('DomainDetail', {
      domain: 'addition',
    });
  });
});
