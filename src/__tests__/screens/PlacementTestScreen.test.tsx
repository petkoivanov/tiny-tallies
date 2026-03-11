import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    reset: mockReset,
  }),
}));

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

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    X: (props: any) => <View testID="x-icon" {...props} />,
  };
});

// Mock CharacterReaction
jest.mock('@/components/animations/CharacterReaction', () => {
  const { View } = require('react-native');
  return {
    CharacterReaction: (props: any) => <View testID={props.testID} />,
  };
});

// Mock GraphDisplay
jest.mock('@/components/session/graphs', () => {
  const { View } = require('react-native');
  return {
    GraphDisplay: (props: any) => <View testID={props.testID} />,
  };
});

// Mock AppDialog
jest.mock('@/components/AppDialog', () => {
  const { View } = require('react-native');
  return {
    AppDialog: (props: any) =>
      props.visible ? <View testID="quit-dialog" /> : null,
  };
});

// Mock math engine
const mockGenerateProblem = jest.fn();
jest.mock('@/services/mathEngine/generator', () => ({
  generateProblem: (...args: unknown[]) => mockGenerateProblem(...args),
}));

const mockGetTemplatesBySkill = jest.fn();
jest.mock('@/services/mathEngine/templates', () => ({
  getTemplatesBySkill: (...args: unknown[]) => mockGetTemplatesBySkill(...args),
}));

const mockGetSkillsByGrade = jest.fn();
jest.mock('@/services/mathEngine/skills', () => ({
  getSkillsByGrade: (...args: unknown[]) => mockGetSkillsByGrade(...args),
}));

jest.mock('@/services/mathEngine/types', () => ({
  answerNumericValue: (answer: any) =>
    answer?.type === 'numeric' ? answer.value : 0,
}));

// Mock store state
let mockStoreState: Record<string, unknown> = {};
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
}));

import PlacementTestScreen from '@/screens/PlacementTestScreen';

function setMockState(overrides: Record<string, unknown> = {}) {
  mockStoreState = {
    avatarId: 'fox',
    childGrade: 3,
    completePlacement: jest.fn(),
    ...overrides,
  };
}

function createMockProblem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test_1',
    templateId: 'tpl_add_single',
    operation: 'addition',
    operands: [3, 4],
    correctAnswer: { type: 'numeric', value: 7 },
    questionText: '3 + 4',
    skillId: 'add.single',
    standards: [],
    grade: 1,
    baseElo: 1000,
    metadata: {},
    ...overrides,
  };
}

describe('PlacementTestScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    setMockState();

    mockGetSkillsByGrade.mockReturnValue([
      { id: 'add.single', grade: 1, operation: 'addition' },
      { id: 'sub.single', grade: 1, operation: 'subtraction' },
    ]);
    mockGetTemplatesBySkill.mockReturnValue([{ id: 'tpl_add_single' }]);
    mockGenerateProblem.mockReturnValue(createMockProblem());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders intro phase with start and skip buttons', () => {
    const { getByTestId, getByText } = render(<PlacementTestScreen />);

    expect(getByTestId('intro-character')).toBeTruthy();
    expect(getByText('Quick Math Check')).toBeTruthy();
    expect(getByTestId('start-button')).toBeTruthy();
    expect(getByTestId('skip-button')).toBeTruthy();
  });

  it('skip button navigates back', () => {
    const { getByTestId } = render(<PlacementTestScreen />);

    fireEvent.press(getByTestId('skip-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('start button transitions to testing phase', () => {
    const { getByTestId, getByText } = render(<PlacementTestScreen />);

    fireEvent.press(getByTestId('start-button'));

    expect(getByTestId('test-character')).toBeTruthy();
    expect(getByText('3 + 4')).toBeTruthy();
  });

  it('shows answer options including correct answer', () => {
    const { getByTestId, getByText } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));

    expect(getByText('7')).toBeTruthy();
  });

  it('shows feedback when answer is selected', () => {
    const { getByTestId } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));

    fireEvent.press(getByTestId('option-7'));

    // Should show feedback (button should be disabled after press)
    expect(getByTestId('option-7').props.accessibilityState?.disabled ||
      getByTestId('option-7').props.disabled).toBeTruthy();
  });

  it('advances to next question after feedback delay', () => {
    const problem2 = createMockProblem({
      questionText: '5 - 2',
      correctAnswer: { type: 'numeric', value: 3 },
    });
    mockGenerateProblem
      .mockReturnValueOnce(createMockProblem())
      .mockReturnValueOnce(problem2);

    const { getByTestId, getByText } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));

    fireEvent.press(getByTestId('option-7'));

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(getByText('5 - 2')).toBeTruthy();
  });

  it('settles at grade after 5 questions without promotion', () => {
    // Grade 3 child, starts at grade 1. One correct → promote to grade 2.
    // Then 5 wrong at grade 2 → settles at grade 2.
    let callCount = 0;
    mockGenerateProblem.mockImplementation(() => {
      callCount++;
      return createMockProblem({
        id: `test_${callCount}`,
        questionText: `Q${callCount}`,
        correctAnswer: { type: 'numeric', value: 7 },
      });
    });

    const { getByTestId, getByText } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));

    // Q1 at grade 1: answer correct → promote to grade 2 (need 1 streak below grade-1)
    fireEvent.press(getByTestId('option-7'));
    act(() => { jest.advanceTimersByTime(1200); });

    // Q2-Q6 at grade 2: answer wrong (press wrong option) — 5 questions → settle
    for (let i = 0; i < 5; i++) {
      fireEvent.press(getByTestId('option-5')); // wrong answer
      act(() => { jest.advanceTimersByTime(1200); });
    }

    expect(getByText('All Done!')).toBeTruthy();
    expect(getByText('Grade 2')).toBeTruthy();
    expect(mockStoreState.completePlacement).toHaveBeenCalledWith(2, 0);
  });

  it('finish button resets navigation to Home', () => {
    // Quick settle: grade 1 child, 5 wrong → settle at grade 1
    setMockState({ childGrade: 1 });

    let callCount = 0;
    mockGenerateProblem.mockImplementation(() => {
      callCount++;
      return createMockProblem({
        id: `test_${callCount}`,
        questionText: `Q${callCount}`,
        correctAnswer: { type: 'numeric', value: 7 },
      });
    });

    const { getByTestId } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));

    // 5 wrong answers to settle
    for (let i = 0; i < 5; i++) {
      fireEvent.press(getByTestId('option-5'));
      act(() => { jest.advanceTimersByTime(1200); });
    }

    fireEvent.press(getByTestId('finish-button'));

    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  });

  it('shows quit dialog when close button is pressed during testing', () => {
    const { getByTestId, queryByTestId } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));

    expect(queryByTestId('quit-dialog')).toBeNull();

    fireEvent.press(getByTestId('quit-button'));

    expect(getByTestId('quit-dialog')).toBeTruthy();
  });

  it('"Don\'t know" counts as wrong and advances', () => {
    const problem2 = createMockProblem({
      questionText: 'Q2',
      correctAnswer: { type: 'numeric', value: 3 },
    });
    mockGenerateProblem
      .mockReturnValueOnce(createMockProblem())
      .mockReturnValueOnce(problem2);

    const { getByTestId, getByText } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));

    fireEvent.press(getByTestId('skip-question-button'));

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(getByText('Q2')).toBeTruthy();
  });

  it('promotes through grades with correct answers', () => {
    // Grade 4 child, starts at grade 2.
    // Grade 2 (below grade-1=3): need 1 correct → promote
    // Grade 3 (grade-1): need 2 correct → promote
    // Grade 4 (at grade): need 3 correct → promote
    // Grade 5 (above): need 3 correct but let's settle after 5
    setMockState({ childGrade: 4 });

    let callCount = 0;
    mockGenerateProblem.mockImplementation(() => {
      callCount++;
      return createMockProblem({
        id: `test_${callCount}`,
        questionText: `Q${callCount}`,
        correctAnswer: { type: 'numeric', value: 7 },
      });
    });

    const { getByTestId, getByText } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));

    // Grade 2: 1 correct → promote to 3
    fireEvent.press(getByTestId('option-7'));
    act(() => { jest.advanceTimersByTime(1200); });

    // Grade 3: need 2 correct
    fireEvent.press(getByTestId('option-7'));
    act(() => { jest.advanceTimersByTime(1200); });
    fireEvent.press(getByTestId('option-7'));
    act(() => { jest.advanceTimersByTime(1200); });

    // Grade 4: need 3 correct
    fireEvent.press(getByTestId('option-7'));
    act(() => { jest.advanceTimersByTime(1200); });
    fireEvent.press(getByTestId('option-7'));
    act(() => { jest.advanceTimersByTime(1200); });
    fireEvent.press(getByTestId('option-7'));
    act(() => { jest.advanceTimersByTime(1200); });

    // Now at grade 5, answer 5 wrong → settle
    for (let i = 0; i < 5; i++) {
      fireEvent.press(getByTestId('option-5'));
      act(() => { jest.advanceTimersByTime(1200); });
    }

    expect(getByText('All Done!')).toBeTruthy();
    expect(getByText('Grade 5')).toBeTruthy();
  });
});
