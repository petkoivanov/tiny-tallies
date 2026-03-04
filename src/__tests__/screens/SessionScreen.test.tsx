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

// Mock useTutor hook -- mutable return value for mode testing
const mockRequestHint = jest.fn();
const mockRequestTutor = jest.fn();
const mockResetForProblem = jest.fn();

let mockTutorReturn = {
  messages: [] as any[],
  loading: false,
  error: null,
  tutorMode: 'hint' as string,
  hintLevel: 0,
  shouldExpandManipulative: false,
  manipulativeType: null as string | null,
  requestHint: mockRequestHint,
  requestTutor: mockRequestTutor,
  resetForProblem: mockResetForProblem,
};

jest.mock('@/hooks/useTutor', () => ({
  useTutor: jest.fn(() => mockTutorReturn),
}));

// Mock getBugDescription
const mockGetBugDescription = jest.fn();
jest.mock('@/services/tutor/bugLookup', () => ({
  getBugDescription: (...args: any[]) => mockGetBugDescription(...args),
}));

// Mock useNetworkStatus hook
let mockIsOnline = true;
jest.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline }),
}));

// Mock appStore
const mockAddTutorMessage = jest.fn();
const mockIncrementWrongAnswerCount = jest.fn();
jest.mock('@/store/appStore', () => ({
  useAppStore: (selector: any) => {
    const state = {
      addTutorMessage: mockAddTutorMessage,
      incrementWrongAnswerCount: mockIncrementWrongAnswerCount,
    };
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

// Mock chat components -- extended with ChatBanner and gotit support
jest.mock('@/components/chat', () => {
  const { View, Pressable, Text } = require('react-native');
  return {
    HelpButton: ({ visible, onPress, pulsing }: any) =>
      visible ? (
        <Pressable onPress={onPress} testID="help-button">
          <Text>{pulsing ? 'Help (pulsing)' : 'Help'}</Text>
        </Pressable>
      ) : null,
    ChatPanel: ({
      isOpen,
      onClose,
      onResponse,
      messages,
      responseMode,
    }: any) =>
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
          {responseMode === 'gotit' && (
            <Pressable
              onPress={() => onResponse('gotit')}
              testID="response-gotit"
            >
              <Text>Got it!</Text>
            </Pressable>
          )}
          <Text testID="chat-message-count">{messages.length} messages</Text>
          <Text testID="chat-response-mode">{responseMode ?? 'standard'}</Text>
        </View>
      ) : null,
    ChatBanner: ({ message, onTap, visible }: any) =>
      visible ? (
        <Pressable onPress={onTap} testID="chat-banner">
          <Text testID="chat-banner-message">{message}</Text>
        </Pressable>
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
    mockTutorReturn = {
      messages: [],
      loading: false,
      error: null,
      tutorMode: 'hint',
      hintLevel: 0,
      shouldExpandManipulative: false,
      manipulativeType: null,
      requestHint: mockRequestHint,
      requestTutor: mockRequestTutor,
      resetForProblem: mockResetForProblem,
    };
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

  it('adds child message and requests tutor when "Tell me more" pressed', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);

    fireEvent.press(getByTestId('help-button'));
    mockRequestTutor.mockClear(); // Clear the initial requestHint call

    fireEvent.press(getByTestId('response-more'));

    expect(mockAddTutorMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'child',
        text: 'Tell me more',
      }),
    );
    expect(mockRequestTutor).toHaveBeenCalled();
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

  // ---- TEACH/BOOST/Escalation Integration Tests ----

  it('calls incrementWrongAnswerCount on wrong answer', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);

    // Tap wrong answer (58 is wrong, 68 is correct)
    fireEvent.press(getByTestId('answer-option-1'));

    expect(mockIncrementWrongAnswerCount).toHaveBeenCalled();
  });

  it('does not call incrementWrongAnswerCount on correct answer', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);

    // Tap correct answer (68)
    fireEvent.press(getByTestId('answer-option-0'));

    expect(mockIncrementWrongAnswerCount).not.toHaveBeenCalled();
  });

  it('resolves bug description from bugId on wrong answer', () => {
    mockGetBugDescription.mockReturnValue('Forgot to carry');
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);

    // Tap wrong answer with bugId (value 58, bugId 'add_no_carry')
    fireEvent.press(getByTestId('answer-option-1'));

    expect(mockGetBugDescription).toHaveBeenCalledWith('add_no_carry');
  });

  it('passes responseMode "gotit" to ChatPanel when tutor is in boost mode', () => {
    mockTutorReturn = {
      ...mockTutorReturn,
      tutorMode: 'boost',
    };
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);

    // Open chat
    fireEvent.press(getByTestId('help-button'));

    // Check responseMode is 'gotit'
    expect(getByTestId('chat-response-mode').props.children).toBe('gotit');
  });

  it('adds child "Got it!" message when gotit response pressed', () => {
    mockTutorReturn = {
      ...mockTutorReturn,
      tutorMode: 'boost',
    };
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);

    // Open chat
    fireEvent.press(getByTestId('help-button'));

    // Press "Got it!"
    fireEvent.press(getByTestId('response-gotit'));

    expect(mockAddTutorMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'child',
        text: 'Got it!',
      }),
    );
  });

  it('renders ChatBanner when chat is minimized during TEACH', () => {
    mockTutorReturn = {
      ...mockTutorReturn,
      tutorMode: 'teach',
      shouldExpandManipulative: true,
      messages: [
        {
          id: 'tutor-1',
          role: 'tutor',
          text: 'Let me show you with blocks!',
          timestamp: Date.now(),
        },
      ],
    };
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);

    // Open chat first (so the TEACH minimize effect can fire)
    fireEvent.press(getByTestId('help-button'));

    // The shouldExpandManipulative effect will minimize chat
    // ChatBanner should be visible with the tutor message
    expect(getByTestId('chat-banner')).toBeTruthy();
    expect(getByTestId('chat-banner-message').props.children).toBe(
      'Let me show you with blocks!',
    );
  });

  it('tapping ChatBanner re-expands full chat panel', () => {
    mockTutorReturn = {
      ...mockTutorReturn,
      tutorMode: 'teach',
      shouldExpandManipulative: true,
      messages: [
        {
          id: 'tutor-1',
          role: 'tutor',
          text: 'Let me show you with blocks!',
          timestamp: Date.now(),
        },
      ],
    };
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId, queryByTestId } = render(<SessionScreen />);

    // Open chat first (triggers minimize via shouldExpandManipulative)
    fireEvent.press(getByTestId('help-button'));

    // Banner should be visible
    expect(getByTestId('chat-banner')).toBeTruthy();

    // Tap banner to re-expand
    fireEvent.press(getByTestId('chat-banner'));

    // Chat panel should be visible again
    expect(getByTestId('chat-panel')).toBeTruthy();
    // Banner should be gone (chatMinimized = false)
    expect(queryByTestId('chat-banner')).toBeNull();
  });

  it('BOOST-revealed correct tap calls handleAnswer with sentinel (wrong scoring)', () => {
    mockTutorReturn = {
      ...mockTutorReturn,
      tutorMode: 'boost',
    };
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);

    // Tap the correct answer (68) while boost mode is active
    fireEvent.press(getByTestId('answer-option-0'));

    // Should call handleAnswer with sentinel value, NOT 68
    // The sentinel forces wrong-answer scoring in useSession
    expect(mockHandleAnswer).toHaveBeenCalledWith(-999999);
    expect(mockHandleAnswer).not.toHaveBeenCalledWith(68);
  });

  it('BOOST mode does not intercept wrong answer taps', () => {
    mockTutorReturn = {
      ...mockTutorReturn,
      tutorMode: 'boost',
    };
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);

    // Tap a wrong answer (58) -- should pass through normally
    fireEvent.press(getByTestId('answer-option-1'));

    expect(mockHandleAnswer).toHaveBeenCalledWith(58);
  });

  it('passes standard responseMode when tutor is in hint mode', () => {
    mockTutorReturn = {
      ...mockTutorReturn,
      tutorMode: 'hint',
    };
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      sessionPhase: 'practice',
    };

    const { getByTestId } = render(<SessionScreen />);

    // Open chat
    fireEvent.press(getByTestId('help-button'));

    // Check responseMode is 'standard'
    expect(getByTestId('chat-response-mode').props.children).toBe('standard');
  });
});
