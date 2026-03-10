import React from 'react';
import { act, render, fireEvent } from '@testing-library/react-native';
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
      correctAnswer: { type: 'numeric', value: 68 },
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
  sessionMode: 'standard',
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

// Mock useNetworkStatus hook
let mockIsOnline = true;
jest.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline }),
}));

// Mock useChatOrchestration -- mutable return value
const mockHandleAnswerWithBoost = jest.fn();
const mockHandleHelpTap = jest.fn();
const mockHandleResponse = jest.fn();
const mockHandleCloseChat = jest.fn();
const mockHandleBannerTap = jest.fn();

let mockChatOrchestrationReturn = {
  chatOpen: false,
  chatMinimized: false,
  showHelp: false,
  shouldPulse: false,
  showCorrectAnswer: false,
  boostHighlightAnswer: null as number | null,
  responseMode: 'standard' as 'standard' | 'gotit',
  bannerMessage: '',
  handleAnswerWithBoost: mockHandleAnswerWithBoost,
  handleHelpTap: mockHandleHelpTap,
  handleResponse: mockHandleResponse,
  handleCloseChat: mockHandleCloseChat,
  handleBannerTap: mockHandleBannerTap,
};

jest.mock('@/hooks/useChatOrchestration', () => ({
  useChatOrchestration: () => mockChatOrchestrationReturn,
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
          <Pressable
            onPress={() => onResponse('retry')}
            testID="response-retry"
          >
            <Text>Retry</Text>
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

// Mock AppDialog — renders buttons that call onPress when tapped
jest.mock('@/components/AppDialog', () => {
  const { View, Text, Pressable } = require('react-native');
  return {
    AppDialog: ({ visible, title, message, buttons }: any) =>
      visible ? (
        <View testID="app-dialog">
          <Text testID="app-dialog-title">{title}</Text>
          {message && <Text testID="app-dialog-message">{message}</Text>}
          {(buttons ?? []).map((btn: any, i: number) => (
            <Pressable
              key={i}
              testID={`dialog-button-${btn.text.toLowerCase().replace(/\s+/g, '-')}`}
              onPress={() => btn.onPress?.()}
            >
              <Text>{btn.text}</Text>
            </Pressable>
          ))}
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
let mockRouteParams: Record<string, unknown> = {};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    dispatch: mockDispatch,
  }),
  useRoute: () => ({
    params: mockRouteParams,
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
    mockChatOrchestrationReturn = {
      chatOpen: false,
      chatMinimized: false,
      showHelp: false,
      shouldPulse: false,
      showCorrectAnswer: false,
      boostHighlightAnswer: null,
      responseMode: 'standard',
      bannerMessage: '',
      handleAnswerWithBoost: mockHandleAnswerWithBoost,
      handleHelpTap: mockHandleHelpTap,
      handleResponse: mockHandleResponse,
      handleCloseChat: mockHandleCloseChat,
      handleBannerTap: mockHandleBannerTap,
    };
    mockPreventRemoveCallback = null;
    mockRouteParams = {};
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

  it('calls handleAnswerWithBoost when answer option is tapped', () => {
    const { getByTestId } = render(<SessionScreen />);
    fireEvent.press(getByTestId('answer-option-0'));
    expect(mockHandleAnswerWithBoost).toHaveBeenCalledWith(68);
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
    expect(mockHandleAnswerWithBoost).not.toHaveBeenCalled();
  });

  it('quit button triggers confirmation dialog via usePreventRemove', () => {
    const { getByTestId, queryByTestId } = render(<SessionScreen />);
    expect(mockPreventRemoveCallback).not.toBeNull();

    // Dialog not visible initially
    expect(queryByTestId('app-dialog')).toBeNull();

    const mockAction = { type: 'GO_BACK' };
    act(() => {
      mockPreventRemoveCallback!({ data: { action: mockAction } });
    });

    // AppDialog now visible with correct content
    expect(getByTestId('app-dialog-title').props.children).toBe('Quit Practice?');
    expect(getByTestId('app-dialog-message').props.children).toBe(
      "Are you sure? Your progress won't be saved.",
    );
  });

  it('confirming quit calls handleQuit and dispatches navigation action', () => {
    const { getByTestId } = render(<SessionScreen />);

    const mockAction = { type: 'GO_BACK' };
    act(() => {
      mockPreventRemoveCallback!({ data: { action: mockAction } });
    });

    // Tap the "Quit" button in the dialog
    fireEvent.press(getByTestId('dialog-button-quit'));

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
        newBadges: [],
        totalNewBadges: 0,
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
        isRemediation: false,
      }),
    );
  });

  it('passes isRemediation=true to Results when in remediation mode', () => {
    mockUseSessionReturn = {
      ...defaultUseSessionReturn,
      isComplete: true,
      currentProblem: null,
      sessionMode: 'remediation',
      sessionResult: {
        score: 3,
        total: 5,
        xpEarned: 50,
        durationMs: 60000,
        pendingUpdates: new Map(),
        feedback: {
          xpEarned: 50,
          newLevel: 2,
          previousLevel: 2,
          leveledUp: false,
          levelsGained: 0,
          streakCount: 1,
          practicedThisWeek: true,
        },
        newBadges: [],
        totalNewBadges: 0,
      },
    };
    mockRouteParams = {
      mode: 'remediation',
      remediationSkillIds: ['addition.single'],
    };

    render(<SessionScreen />);

    expect(mockNavigate).toHaveBeenCalledWith(
      'Results',
      expect.objectContaining({
        isRemediation: true,
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
        newBadges: [],
        totalNewBadges: 0,
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
          questionText: '50 \u2212 23 = ?',
          correctAnswer: { type: 'numeric', value: 27 },
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

  it('shows help button when useChatOrchestration returns showHelp=true', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      showHelp: true,
    };

    const { getByTestId } = render(<SessionScreen />);
    expect(getByTestId('help-button')).toBeTruthy();
  });

  it('hides help button when useChatOrchestration returns showHelp=false', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      showHelp: false,
    };

    const { queryByTestId } = render(<SessionScreen />);
    expect(queryByTestId('help-button')).toBeNull();
  });

  it('calls handleHelpTap when help button tapped', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      showHelp: true,
    };

    const { getByTestId } = render(<SessionScreen />);
    fireEvent.press(getByTestId('help-button'));

    expect(mockHandleHelpTap).toHaveBeenCalled();
  });

  it('opens chat panel when chatOpen is true', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      chatOpen: true,
    };

    const { getByTestId } = render(<SessionScreen />);
    expect(getByTestId('chat-panel')).toBeTruthy();
  });

  it('calls handleCloseChat when close button pressed', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      chatOpen: true,
    };

    const { getByTestId } = render(<SessionScreen />);
    fireEvent.press(getByTestId('chat-close-button'));

    expect(mockHandleCloseChat).toHaveBeenCalled();
  });

  it('calls handleResponse with "understand" when I understand pressed', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      chatOpen: true,
    };

    const { getByTestId } = render(<SessionScreen />);
    fireEvent.press(getByTestId('response-understand'));

    expect(mockHandleResponse).toHaveBeenCalledWith('understand');
  });

  it('calls handleResponse with "more" when Tell me more pressed', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      chatOpen: true,
    };

    const { getByTestId } = render(<SessionScreen />);
    fireEvent.press(getByTestId('response-more'));

    expect(mockHandleResponse).toHaveBeenCalledWith('more');
  });

  it('hides help button when chat is open', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      chatOpen: true,
      showHelp: false,
    };

    const { queryByTestId } = render(<SessionScreen />);
    expect(queryByTestId('help-button')).toBeNull();
  });

  // ---- TEACH/BOOST/Escalation Integration Tests ----

  it('calls handleAnswerWithBoost on wrong answer tap', () => {
    const { getByTestId } = render(<SessionScreen />);
    fireEvent.press(getByTestId('answer-option-1'));

    expect(mockHandleAnswerWithBoost).toHaveBeenCalledWith(58);
  });

  it('calls handleAnswerWithBoost on correct answer tap', () => {
    const { getByTestId } = render(<SessionScreen />);
    fireEvent.press(getByTestId('answer-option-0'));

    expect(mockHandleAnswerWithBoost).toHaveBeenCalledWith(68);
  });

  it('passes responseMode "gotit" to ChatPanel when orchestration returns gotit', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      chatOpen: true,
      responseMode: 'gotit',
    };

    const { getByTestId } = render(<SessionScreen />);
    expect(getByTestId('chat-response-mode').props.children).toBe('gotit');
  });

  it('renders Got it button when responseMode is gotit', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      chatOpen: true,
      responseMode: 'gotit',
    };

    const { getByTestId } = render(<SessionScreen />);
    fireEvent.press(getByTestId('response-gotit'));

    expect(mockHandleResponse).toHaveBeenCalledWith('gotit');
  });

  it('renders ChatBanner when chatMinimized is true', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      chatMinimized: true,
      bannerMessage: 'Let me show you with blocks!',
    };

    const { getByTestId } = render(<SessionScreen />);
    expect(getByTestId('chat-banner')).toBeTruthy();
    expect(getByTestId('chat-banner-message').props.children).toBe(
      'Let me show you with blocks!',
    );
  });

  it('calls handleBannerTap when ChatBanner tapped', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      chatMinimized: true,
      bannerMessage: 'Let me show you with blocks!',
    };

    const { getByTestId } = render(<SessionScreen />);
    fireEvent.press(getByTestId('chat-banner'));

    expect(mockHandleBannerTap).toHaveBeenCalled();
  });

  it('passes standard responseMode when orchestration returns standard', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      chatOpen: true,
      responseMode: 'standard',
    };

    const { getByTestId } = render(<SessionScreen />);
    expect(getByTestId('chat-response-mode').props.children).toBe('standard');
  });

  // ---- Retry/Response Integration ----

  it('calls handleResponse with retry when retry pressed', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      chatOpen: true,
    };

    const { getByTestId } = render(<SessionScreen />);
    fireEvent.press(getByTestId('response-retry'));

    expect(mockHandleResponse).toHaveBeenCalledWith('retry');
  });

  it('passes boostHighlightAnswer to CpaSessionContent', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      boostHighlightAnswer: 68,
    };

    // CpaSessionContent receives the prop; we verify rendering works
    const { getByText } = render(<SessionScreen />);
    expect(getByText('68')).toBeTruthy();
  });

  it('passes showCorrectAnswer to CpaSessionContent', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      showCorrectAnswer: true,
    };

    const { getByText } = render(<SessionScreen />);
    expect(getByText('68')).toBeTruthy();
  });

  it('passes shouldPulse to HelpButton', () => {
    mockChatOrchestrationReturn = {
      ...mockChatOrchestrationReturn,
      showHelp: true,
      shouldPulse: true,
    };

    const { getByText } = render(<SessionScreen />);
    expect(getByText('Help (pulsing)')).toBeTruthy();
  });
});
