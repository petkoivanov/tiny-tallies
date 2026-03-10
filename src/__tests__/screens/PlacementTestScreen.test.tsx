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

// Mock AppDialog
jest.mock('@/components/AppDialog', () => {
  const { View } = require('react-native');
  return {
    AppDialog: (props: any) =>
      props.visible ? <View testID="quit-dialog" /> : null,
  };
});

// Mock CAT engine
const mockBuildItemBank = jest.fn();
const mockCreateCatSession = jest.fn();
const mockGetNextItem = jest.fn();
const mockRecordResponse = jest.fn();
const mockGetCatResults = jest.fn();
const mockComputePlacementElos = jest.fn();
jest.mock('@/services/cat', () => ({
  buildItemBank: () => mockBuildItemBank(),
  createCatSession: () => mockCreateCatSession(),
  getNextItem: (...args: unknown[]) => mockGetNextItem(...args),
  recordResponse: (...args: unknown[]) => mockRecordResponse(...args),
  getCatResults: (...args: unknown[]) => mockGetCatResults(...args),
  computePlacementElos: (...args: unknown[]) => mockComputePlacementElos(...args),
}));

// Mock math engine
const mockGenerateProblem = jest.fn();
jest.mock('@/services/mathEngine/generator', () => ({
  generateProblem: (...args: unknown[]) => mockGenerateProblem(...args),
}));

const mockGetTemplatesBySkill = jest.fn();
jest.mock('@/services/mathEngine/templates', () => ({
  getTemplatesBySkill: (...args: unknown[]) => mockGetTemplatesBySkill(...args),
}));

jest.mock('@/services/mathEngine/types', () => ({
  answerNumericValue: (answer: any) =>
    answer?.type === 'numeric' ? answer.value : 0,
}));

jest.mock('@/services/mathEngine/skills', () => ({
  SKILLS: [
    { id: 'add.single', grade: 1, operation: 'addition' },
    { id: 'sub.single', grade: 1, operation: 'subtraction' },
  ],
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
    completePlacement: jest.fn(),
    updateSkillState: jest.fn(),
    ...overrides,
  };
}

function createMockItem(id = 'cat_add.single') {
  return {
    id,
    discrimination: 1.0,
    difficulty: 0,
    grade: 1,
    skillId: 'add.single',
    operation: 'addition',
  };
}

function createMockProblem() {
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
  };
}

describe('PlacementTestScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    setMockState();

    mockBuildItemBank.mockReturnValue([createMockItem()]);
    mockCreateCatSession.mockReturnValue({
      theta: 0,
      standardError: 1.0,
      responses: [],
      administeredIds: new Set(),
      terminated: false,
    });
    mockGetTemplatesBySkill.mockReturnValue([{ id: 'tpl_add_single' }]);
    mockGenerateProblem.mockReturnValue(createMockProblem());
    mockRecordResponse.mockImplementation((state: any) => state);
    mockComputePlacementElos.mockReturnValue(new Map());
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
    mockGetNextItem.mockReturnValue({
      item: createMockItem(),
      information: 0.25,
    });

    const { getByTestId, getByText } = render(<PlacementTestScreen />);

    fireEvent.press(getByTestId('start-button'));

    expect(getByTestId('test-character')).toBeTruthy();
    expect(getByText('3 + 4')).toBeTruthy();
  });

  it('shows answer options including correct answer', () => {
    mockGetNextItem.mockReturnValue({
      item: createMockItem(),
      information: 0.25,
    });

    const { getByTestId, getByText } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));

    // Correct answer is 7, distractors should include values near 7
    expect(getByText('7')).toBeTruthy();
  });

  it('records response when answer is selected', () => {
    mockGetNextItem.mockReturnValue({
      item: createMockItem(),
      information: 0.25,
    });

    const { getByTestId } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));

    // Press correct answer
    fireEvent.press(getByTestId('option-7'));

    expect(mockRecordResponse).toHaveBeenCalledTimes(1);
  });

  it('advances to next question after feedback delay', () => {
    const item1 = createMockItem('cat_add.single');
    const item2 = createMockItem('cat_sub.single');

    mockGetNextItem
      .mockReturnValueOnce({ item: item1, information: 0.25 })
      .mockReturnValueOnce({ item: item2, information: 0.20 });

    const problem2 = {
      ...createMockProblem(),
      questionText: '5 - 2',
      correctAnswer: { type: 'numeric', value: 3 },
    };
    mockGenerateProblem
      .mockReturnValueOnce(createMockProblem())
      .mockReturnValueOnce(problem2);

    const { getByTestId, getByText } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));

    // Answer first question
    fireEvent.press(getByTestId('option-7'));

    // Advance past feedback delay
    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(getByText('5 - 2')).toBeTruthy();
  });

  it('shows completion screen when test terminates', () => {
    // First getNextItem returns an item, second returns null (terminated)
    mockGetNextItem
      .mockReturnValueOnce({ item: createMockItem(), information: 0.25 })
      .mockReturnValueOnce(null);

    mockGetCatResults.mockReturnValue({
      theta: 0.5,
      standardError: 0.28,
      totalItems: 5,
      correctCount: 4,
      accuracy: 0.8,
      estimatedGrade: 2,
      domainAccuracy: {},
    });

    const { getByTestId, getByText } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));

    // Answer question
    fireEvent.press(getByTestId('option-7'));

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(getByText('All Done!')).toBeTruthy();
    expect(getByText('Grade 2')).toBeTruthy();
    expect(getByText(/80% accuracy/)).toBeTruthy();
  });

  it('calls completePlacement on test completion', () => {
    mockGetNextItem
      .mockReturnValueOnce({ item: createMockItem(), information: 0.25 })
      .mockReturnValueOnce(null);

    mockGetCatResults.mockReturnValue({
      theta: 0.5,
      standardError: 0.28,
      totalItems: 5,
      correctCount: 4,
      accuracy: 0.8,
      estimatedGrade: 2,
      domainAccuracy: {},
    });

    const { getByTestId } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));
    fireEvent.press(getByTestId('option-7'));

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(mockStoreState.completePlacement).toHaveBeenCalledWith(2, 0.5);
  });

  it('finish button resets navigation to Home', () => {
    mockGetNextItem
      .mockReturnValueOnce({ item: createMockItem(), information: 0.25 })
      .mockReturnValueOnce(null);

    mockGetCatResults.mockReturnValue({
      theta: 0.5,
      standardError: 0.28,
      totalItems: 5,
      correctCount: 4,
      accuracy: 0.8,
      estimatedGrade: 2,
      domainAccuracy: {},
    });

    const { getByTestId } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));
    fireEvent.press(getByTestId('option-7'));

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    fireEvent.press(getByTestId('finish-button'));

    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  });

  it('shows quit dialog when close button is pressed during testing', () => {
    mockGetNextItem.mockReturnValue({
      item: createMockItem(),
      information: 0.25,
    });

    const { getByTestId, queryByTestId } = render(<PlacementTestScreen />);
    fireEvent.press(getByTestId('start-button'));

    // Dialog should not be visible initially
    expect(queryByTestId('quit-dialog')).toBeNull();

    // Press quit button
    fireEvent.press(getByTestId('quit-button'));

    expect(getByTestId('quit-dialog')).toBeTruthy();
  });
});
