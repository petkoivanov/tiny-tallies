import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import type { UseSessionReturn } from '@/hooks/useSession';

// Mock useSession hook
const mockHandleAnswer = jest.fn();
const mockHandleQuit = jest.fn();

const defaultUseSessionReturn: UseSessionReturn = {
  currentProblem: {
    problem: {
      id: 'test-1',
      templateId: 'add-1d-1d',
      operation: 'addition',
      operands: [23, 45],
      correctAnswer: 68,
      questionText: '23 + 45 = ?',
      skillId: 'addition.single',
      standards: ['1.OA.1'],
      grade: 1,
      baseElo: 900,
      metadata: {
        digitCount: 2,
        requiresCarry: false,
        requiresBorrow: false,
      },
    },
    presentation: {
      problem: {} as any,
      format: 'multiple_choice',
      options: [
        { value: 68 },
        { value: 58, bugId: 'add_no_carry' },
        { value: 78 },
        { value: 63 },
      ],
      correctIndex: 0,
    },
    phase: 'warmup',
    skillId: 'addition.single',
    templateBaseElo: 900,
  },
  currentIndex: 0,
  totalProblems: 15,
  sessionPhase: 'warmup',
  feedbackState: null,
  isComplete: false,
  score: 0,
  handleAnswer: mockHandleAnswer,
  handleQuit: mockHandleQuit,
  sessionResult: null,
};

let mockUseSessionReturn: UseSessionReturn = { ...defaultUseSessionReturn };

jest.mock('@/hooks/useSession', () => ({
  useSession: () => mockUseSessionReturn,
  FEEDBACK_DURATION_MS: 1500,
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockDispatch = jest.fn();
let mockPreventRemoveCallback: ((e: { data: { action: any } }) => void) | null =
  null;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    dispatch: mockDispatch,
  }),
  usePreventRemove: (
    enabled: boolean,
    callback: (e: { data: { action: any } }) => void,
  ) => {
    if (enabled) {
      mockPreventRemoveCallback = callback;
    } else {
      mockPreventRemoveCallback = null;
    }
  },
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Alert.alert spy
jest.spyOn(Alert, 'alert');

import SessionScreen from '@/screens/SessionScreen';

describe('SessionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSessionReturn = { ...defaultUseSessionReturn };
    mockPreventRemoveCallback = null;
  });

  it('renders problem text and 4 answer options', () => {
    const { getByText, getAllByTestId } = render(<SessionScreen />);

    // Problem text: "23 + 45 = ?" (minus sign is Unicode \u2212 for subtraction, + for addition)
    expect(getByText(/23/)).toBeTruthy();
    expect(getByText(/45/)).toBeTruthy();

    // 4 answer options
    const options = getAllByTestId(/answer-option-/);
    expect(options).toHaveLength(4);

    // Option values
    expect(getByText('68')).toBeTruthy();
    expect(getByText('58')).toBeTruthy();
    expect(getByText('78')).toBeTruthy();
    expect(getByText('63')).toBeTruthy();
  });

  it('displays progress indicator with correct format', () => {
    const { getByText } = render(<SessionScreen />);

    expect(getByText('1 / 15')).toBeTruthy();
  });

  it('displays session phase label', () => {
    const { getByText } = render(<SessionScreen />);

    expect(getByText('Warmup')).toBeTruthy();
  });

  it('updates phase label for practice phase', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
      currentIndex: 3,
    };

    const { getByText } = render(<SessionScreen />);
    expect(getByText('Practice')).toBeTruthy();
    expect(getByText('4 / 15')).toBeTruthy();
  });

  it('updates phase label for cooldown phase', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'cooldown',
      currentIndex: 12,
    };

    const { getByText } = render(<SessionScreen />);
    expect(getByText('Cooldown')).toBeTruthy();
  });

  it('calls handleAnswer when answer option is tapped', () => {
    const { getByTestId } = render(<SessionScreen />);

    fireEvent.press(getByTestId('answer-option-0'));

    expect(mockHandleAnswer).toHaveBeenCalledWith(68);
  });

  it('shows correct feedback indicator', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      feedbackState: { visible: true, correct: true },
    };

    const { getByTestId, getByText } = render(<SessionScreen />);

    expect(getByTestId('feedback-indicator')).toBeTruthy();
    expect(getByText('Correct!')).toBeTruthy();
  });

  it('shows incorrect feedback indicator', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      feedbackState: { visible: true, correct: false },
    };

    const { getByTestId, getByText } = render(<SessionScreen />);

    expect(getByTestId('feedback-indicator')).toBeTruthy();
    expect(getByText('Not quite')).toBeTruthy();
  });

  it('disables answer buttons during feedback', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      feedbackState: { visible: true, correct: true },
    };

    const { getByTestId } = render(<SessionScreen />);

    // Buttons should be disabled during feedback
    fireEvent.press(getByTestId('answer-option-0'));
    expect(mockHandleAnswer).not.toHaveBeenCalled();
  });

  it('quit button triggers confirmation dialog via usePreventRemove', () => {
    render(<SessionScreen />);

    // Simulate the navigation prevention callback (triggered when goBack is called)
    expect(mockPreventRemoveCallback).not.toBeNull();

    const mockAction = { type: 'GO_BACK' };
    mockPreventRemoveCallback!({ data: { action: mockAction } });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Quit Practice?',
      "Are you sure? Your progress won't be saved.",
      expect.arrayContaining([
        expect.objectContaining({ text: 'Keep Going', style: 'cancel' }),
        expect.objectContaining({ text: 'Quit', style: 'destructive' }),
      ]),
    );
  });

  it('confirming quit calls handleQuit and dispatches navigation action', () => {
    render(<SessionScreen />);

    const mockAction = { type: 'GO_BACK' };
    mockPreventRemoveCallback!({ data: { action: mockAction } });

    // Get the quit button's onPress handler from Alert.alert call
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const buttons = alertCall[2];
    const quitButton = buttons.find(
      (b: { text: string }) => b.text === 'Quit',
    );
    quitButton.onPress();

    expect(mockHandleQuit).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(mockAction);
  });

  it('navigates to Results when session completes', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      isComplete: true,
      currentProblem: null,
      sessionResult: {
        score: 12,
        total: 15,
        xpEarned: 150,
        durationMs: 120000,
        pendingUpdates: new Map(),
        feedback: null,
      },
    };

    render(<SessionScreen />);

    expect(mockNavigate).toHaveBeenCalledWith(
      'Results',
      expect.objectContaining({
        score: 12,
        total: 15,
        xpEarned: 150,
        durationMs: 120000,
      }),
    );
  });

  it('renders loading state when no current problem and not complete', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      currentProblem: null,
      isComplete: false,
    };

    const { getByText } = render(<SessionScreen />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('formats subtraction operator correctly', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      currentProblem: {
        ...defaultUseSessionReturn.currentProblem!,
        problem: {
          ...defaultUseSessionReturn.currentProblem!.problem,
          operation: 'subtraction',
          operands: [50, 23],
          correctAnswer: 27,
        },
        presentation: {
          ...defaultUseSessionReturn.currentProblem!.presentation,
          options: [
            { value: 27 },
            { value: 33 },
            { value: 37 },
            { value: 17 },
          ],
        },
      },
    };

    const { getByText } = render(<SessionScreen />);
    // Should show the minus sign (\u2212) for subtraction
    expect(getByText(/50/)).toBeTruthy();
    expect(getByText(/\u2212/)).toBeTruthy();
    expect(getByText(/23/)).toBeTruthy();
  });
});
