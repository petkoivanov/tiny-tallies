import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import type { UseSessionReturn } from '@/hooks/useSession';

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
    withSpring: (v: any) => v,
    withDelay: (_d: number, v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    withRepeat: (v: any) => v,
    runOnJS: (fn: any) => fn,
    Easing: {
      in: (e: any) => e,
      quad: (v: any) => v,
      linear: (v: any) => v,
    },
    useReducedMotion: jest.fn(() => false),
  };
});

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
  selectedAnswer: null,
  correctAnswer: 68,
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

// Mock useCpaMode hook (default to abstract -- unchanged behavior)
jest.mock('@/hooks/useCpaMode', () => ({
  useCpaMode: () => ({ stage: 'abstract', manipulativeType: null }),
}));

// Mock useTutor hook
const mockRequestHint = jest.fn();
const mockResetForProblem = jest.fn();

jest.mock('@/hooks/useTutor', () => ({
  useTutor: jest.fn(() => ({
    messages: [],
    loading: false,
    error: null,
    tutorMode: 'hint',
    hintLevel: 0,
    requestHint: mockRequestHint,
    resetForProblem: mockResetForProblem,
  })),
}));

// Mock useNetworkStatus hook
let mockIsOnline = true;
jest.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline }),
}));

// Mock appStore
const mockAddTutorMessage = jest.fn();
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: any) => {
    const state = { addTutorMessage: mockAddTutorMessage };
    return selector(state);
  },
}));

// Mock CpaModeIcon
jest.mock('@/components/session/CpaModeIcon', () => {
  const { View } = require('react-native');
  return {
    CpaModeIcon: () => <View testID="cpa-mode-icon" />,
  };
});

// Mock manipulative components (needed by CpaSessionContent)
jest.mock('@/components/manipulatives', () => {
  const { View } = require('react-native');
  const makeMock = (name: string) => (props: any) => (
    <View testID={props.testID ?? name} />
  );
  return {
    Counters: makeMock('counters'),
    TenFrame: makeMock('ten-frame'),
    BaseTenBlocks: makeMock('base-ten-blocks'),
    NumberLine: makeMock('number-line'),
    FractionStrips: makeMock('fraction-strips'),
    BarModel: makeMock('bar-model'),
    ManipulativeShell: ({ children, testID }: any) => (
      <View testID={testID ?? 'manipulative-shell'}>{children}</View>
    ),
  };
});

// Mock ManipulativePanel
jest.mock('@/components/session/ManipulativePanel', () => {
  const { View } = require('react-native');
  return {
    ManipulativePanel: ({ children, testID }: any) => (
      <View testID={testID ?? 'manipulative-panel'}>{children}</View>
    ),
  };
});

// Mock CompactAnswerRow
jest.mock('@/components/session/CompactAnswerRow', () => {
  const { View } = require('react-native');
  return {
    CompactAnswerRow: () => <View testID="compact-answer-row" />,
  };
});

// Mock PictorialDiagram
jest.mock('@/components/session/pictorial/PictorialDiagram', () => {
  const { View } = require('react-native');
  return {
    PictorialDiagram: ({ testID }: any) => (
      <View testID={testID ?? 'pictorial-diagram'} />
    ),
  };
});

// Mock AnswerFeedbackAnimation
jest.mock('@/components/animations/AnswerFeedbackAnimation', () => {
  const { View } = require('react-native');
  return {
    AnswerFeedbackAnimation: ({ children }: any) => <View>{children}</View>,
  };
});

// Mock chat components
jest.mock('@/components/chat', () => {
  const { View, Pressable, Text } = require('react-native');
  return {
    HelpButton: ({ visible, onPress, pulsing }: any) =>
      visible ? (
        <Pressable onPress={onPress} testID="help-button">
          <Text>{pulsing ? 'Help (pulsing)' : 'Help'}</Text>
        </Pressable>
      ) : null,
    ChatPanel: ({ isOpen, onClose, onResponse, messages }: any) =>
      isOpen ? (
        <View testID="chat-panel">
          <Pressable onPress={onClose} testID="chat-close-button">
            <Text>Close</Text>
          </Pressable>
          <Pressable
            onPress={() => onResponse('understand')}
            testID="response-understand"
          >
            <Text>I understand!</Text>
          </Pressable>
          <Pressable
            onPress={() => onResponse('more')}
            testID="response-more"
          >
            <Text>Tell me more</Text>
          </Pressable>
          <Text testID="chat-message-count">{messages.length} messages</Text>
        </View>
      ) : null,
  };
});

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

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    X: () => <View />,
    Blocks: () => <View />,
    Image: () => <View />,
    Hash: () => <View />,
    ChevronUp: () => <View />,
    ChevronDown: () => <View />,
    CircleHelp: () => <View />,
  };
});

// Alert.alert spy
jest.spyOn(Alert, 'alert');

import SessionScreen from '@/screens/SessionScreen';

describe('SessionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSessionReturn = { ...defaultUseSessionReturn };
    mockPreventRemoveCallback = null;
    mockIsOnline = true;
  });

  it('renders problem text and 4 answer options', () => {
    const { getByText, getAllByTestId } = render(<SessionScreen />);

    expect(getByText(/23/)).toBeTruthy();
    expect(getByText(/45/)).toBeTruthy();

    const options = getAllByTestId(/answer-option-/);
    expect(options).toHaveLength(4);

    expect(getByText('68')).toBeTruthy();
    expect(getByText('58')).toBeTruthy();
    expect(getByText('78')).toBeTruthy();
    expect(getByText('63')).toBeTruthy();
  });

  it('displays progress indicator with correct format', () => {
    const { getByText } = render(<SessionScreen />);
    expect(getByText('1 / 15')).toBeTruthy();
  });

  it('renders progress bar', () => {
    const { getByTestId } = render(<SessionScreen />);
    expect(getByTestId('progress-bar')).toBeTruthy();
    expect(getByTestId('progress-bar-fill')).toBeTruthy();
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

  it('applies correct feedback style to selected answer button on correct answer', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      feedbackState: { visible: true, correct: true },
      selectedAnswer: 68,
    };

    const { getByTestId } = render(<SessionScreen />);
    const correctButton = getByTestId('answer-option-0');
    expect(correctButton).toBeTruthy();
    expect(() => getByTestId('feedback-indicator')).toThrow();
  });

  it('applies incorrect feedback style to selected answer button on wrong answer', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      feedbackState: { visible: true, correct: false },
      selectedAnswer: 58,
    };

    const { getByTestId } = render(<SessionScreen />);
    const incorrectButton = getByTestId('answer-option-1');
    expect(incorrectButton).toBeTruthy();
    expect(() => getByTestId('feedback-indicator')).toThrow();
  });

  it('disables answer buttons during feedback', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      feedbackState: { visible: true, correct: true },
      selectedAnswer: 68,
    };

    const { getByTestId } = render(<SessionScreen />);
    fireEvent.press(getByTestId('answer-option-0'));
    expect(mockHandleAnswer).not.toHaveBeenCalled();
  });

  it('quit button triggers confirmation dialog via usePreventRemove', () => {
    render(<SessionScreen />);
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

    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const buttons = alertCall[2];
    const quitButton = buttons.find(
      (b: { text: string }) => b.text === 'Quit',
    );
    quitButton.onPress();

    expect(mockHandleQuit).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(mockAction);
  });

  it('navigates to Results with extended params when session completes', () => {
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
        feedback: {
          xpEarned: 150,
          newLevel: 3,
          previousLevel: 2,
          leveledUp: true,
          levelsGained: 1,
          streakCount: 2,
          practicedThisWeek: true,
        },
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
        leveledUp: true,
        newLevel: 3,
        streakCount: 2,
        cpaAdvances: [],
      }),
    );
  });

  it('navigates to Results with default gamification params when feedback is null', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      isComplete: true,
      currentProblem: null,
      sessionResult: {
        score: 10,
        total: 15,
        xpEarned: 100,
        durationMs: 90000,
        pendingUpdates: new Map(),
        feedback: null,
      },
    };

    render(<SessionScreen />);

    expect(mockNavigate).toHaveBeenCalledWith(
      'Results',
      expect.objectContaining({
        leveledUp: false,
        newLevel: 1,
        streakCount: 0,
        cpaAdvances: [],
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
    expect(getByText(/50/)).toBeTruthy();
    expect(getByText(/\u2212/)).toBeTruthy();
    expect(getByText(/23/)).toBeTruthy();
  });

  // ---- Chat UI Integration Tests ----

  it('shows help button during practice phase', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);
    expect(getByTestId('help-button')).toBeTruthy();
  });

  it('hides help button during warmup phase', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'warmup',
    };

    const { queryByTestId } = render(<SessionScreen />);
    expect(queryByTestId('help-button')).toBeNull();
  });

  it('hides help button during cooldown phase', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'cooldown',
    };

    const { queryByTestId } = render(<SessionScreen />);
    expect(queryByTestId('help-button')).toBeNull();
  });

  it('opens chat panel and requests hint when help button tapped', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);
    fireEvent.press(getByTestId('help-button'));

    // Chat panel should now be visible
    expect(getByTestId('chat-panel')).toBeTruthy();
    // Should have requested a hint
    expect(mockRequestHint).toHaveBeenCalled();
  });

  it('does not request hint when offline and help tapped', () => {
    mockIsOnline = false;
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);
    fireEvent.press(getByTestId('help-button'));

    // Chat panel opens but no hint requested
    expect(getByTestId('chat-panel')).toBeTruthy();
    expect(mockRequestHint).not.toHaveBeenCalled();
  });

  it('closes chat panel when close button pressed', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId, queryByTestId } = render(<SessionScreen />);

    // Open chat
    fireEvent.press(getByTestId('help-button'));
    expect(getByTestId('chat-panel')).toBeTruthy();

    // Close chat
    fireEvent.press(getByTestId('chat-close-button'));
    expect(queryByTestId('chat-panel')).toBeNull();
  });

  it('adds child message when "I understand!" response pressed', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);

    // Open chat first
    fireEvent.press(getByTestId('help-button'));

    // Press "I understand!"
    fireEvent.press(getByTestId('response-understand'));

    expect(mockAddTutorMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'child',
        text: 'I understand!',
      }),
    );
  });

  it('adds child message and requests hint when "Tell me more" pressed', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);

    fireEvent.press(getByTestId('help-button'));
    mockRequestHint.mockClear(); // Clear the initial requestHint call

    fireEvent.press(getByTestId('response-more'));

    expect(mockAddTutorMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'child',
        text: 'Tell me more',
      }),
    );
    expect(mockRequestHint).toHaveBeenCalled();
  });

  it('hides help button when chat is open', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId, queryByTestId } = render(<SessionScreen />);

    // Help button visible initially
    expect(getByTestId('help-button')).toBeTruthy();

    // Open chat
    fireEvent.press(getByTestId('help-button'));

    // Help button should be hidden
    expect(queryByTestId('help-button')).toBeNull();
  });
});
