import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock lottie-react-native
jest.mock('lottie-react-native', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID={props.testID ?? 'lottie-view'} />,
  };
});

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
    Easing: {
      in: (e: any) => e,
      inOut: (e: any) => e,
      quad: (v: any) => v,
      linear: (v: any) => v,
    },
    useReducedMotion: jest.fn(() => false),
  };
});

// Mock useCpaMode
let mockCpaModeResult = {
  stage: 'abstract' as 'concrete' | 'pictorial' | 'abstract',
  manipulativeType: null as string | null,
};

jest.mock('@/hooks/useCpaMode', () => ({
  useCpaMode: () => mockCpaModeResult,
}));

// Mock ManipulativePanel
jest.mock('./ManipulativePanel', () => {
  const { View, Text } = require('react-native');
  return {
    ManipulativePanel: ({
      expanded,
      onToggle,
      manipulativeLabel,
      children,
      testID,
    }: any) => (
      <View testID={testID ?? 'manipulative-panel'}>
        <Text testID="panel-expanded">{String(expanded)}</Text>
        <Text testID="panel-label">{manipulativeLabel ?? ''}</Text>
        <View testID="panel-toggle-trigger" onTouchEnd={onToggle} />
        {children}
      </View>
    ),
  };
});

// Mock CompactAnswerRow
jest.mock('./CompactAnswerRow', () => {
  const { View } = require('react-native');
  return {
    CompactAnswerRow: (props: any) => (
      <View testID="compact-answer-row" />
    ),
  };
});

// Mock PictorialDiagram
jest.mock('./pictorial/PictorialDiagram', () => {
  const { View } = require('react-native');
  return {
    PictorialDiagram: ({ type, testID }: any) => (
      <View testID={testID ?? 'pictorial-diagram'} />
    ),
  };
});

// Mock all manipulative components
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

// Mock AnswerFeedbackAnimation
jest.mock('@/components/animations/AnswerFeedbackAnimation', () => {
  const { View } = require('react-native');
  return {
    AnswerFeedbackAnimation: ({ children }: any) => <View>{children}</View>,
  };
});

import { CpaSessionContent } from './CpaSessionContent';
import type { Problem } from '@/services/mathEngine/types';

const baseProblem: Problem = {
  id: 'test-1',
  templateId: 'add-1d-1d',
  operation: 'addition',
  operands: [3, 5],
  correctAnswer: { type: 'numeric', value: 8 },
  questionText: '3 + 5 = ?',
  skillId: 'addition.single-digit.no-carry',
  standards: ['1.OA.1'],
  grade: 1,
  baseElo: 800,
  metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false },
};

import type { MultipleChoicePresentation } from '@/services/mathEngine/answerFormats/types';

const basePresentation: MultipleChoicePresentation = {
  problem: baseProblem,
  format: 'multiple_choice',
  options: [
    { value: 8 },
    { value: 7, bugId: 'off_by_one' },
    { value: 9 },
    { value: 6 },
  ],
  correctIndex: 0,
};

const baseProps = {
  problem: baseProblem,
  skillId: 'addition.single-digit.no-carry',
  presentation: basePresentation,
  currentIndex: 0,
  onAnswer: jest.fn(),
  feedbackActive: false,
  feedbackCorrect: null,
  onDismissFeedback: jest.fn(),
  selectedAnswer: null,
  correctAnswer: null,
  showCorrectAnswer: false,
};

describe('CpaSessionContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCpaModeResult = { stage: 'abstract', manipulativeType: null };
  });

  describe('abstract mode', () => {
    it('renders problem text, answer grid, and "Need help?" button', () => {
      mockCpaModeResult = { stage: 'abstract', manipulativeType: null };

      const { getByText, queryByTestId, getByTestId } = render(
        <CpaSessionContent {...baseProps} />,
      );

      // Problem text
      expect(getByText(/3/)).toBeTruthy();
      expect(getByText(/5/)).toBeTruthy();

      // Standard answer options present
      expect(getByText('8')).toBeTruthy();
      expect(getByText('7')).toBeTruthy();

      // No panel, no diagram (until help tapped)
      expect(queryByTestId('manipulative-panel')).toBeNull();
      expect(queryByTestId('pictorial-diagram')).toBeNull();
      expect(queryByTestId('compact-answer-row')).toBeNull();

      // "Need help?" / "Show me!" is currently disabled (SHOW_ME_ENABLED = false)
      expect(queryByTestId('need-help-button')).toBeNull();
    });
  });

  describe('concrete mode', () => {
    it('shows no panel by default (Show Me disabled)', () => {
      mockCpaModeResult = { stage: 'concrete', manipulativeType: 'counters' };

      const { queryByTestId } = render(
        <CpaSessionContent {...baseProps} />,
      );

      // Panel and "Need help?" hidden while SHOW_ME_ENABLED = false
      expect(queryByTestId('manipulative-panel')).toBeNull();
      expect(queryByTestId('need-help-button')).toBeNull();
    });
  });

  describe('pictorial mode', () => {
    it('renders PictorialDiagram for supported operations', () => {
      mockCpaModeResult = {
        stage: 'pictorial',
        manipulativeType: 'counters',
      };

      const { getByTestId, queryByTestId } = render(
        <CpaSessionContent {...baseProps} />,
      );

      expect(getByTestId('pictorial-diagram')).toBeTruthy();
      // "Show me!" and "Need help?" hidden while SHOW_ME_ENABLED = false
      expect(queryByTestId('need-help-button')).toBeNull();
    });
  });

  describe('panel expansion switches answer layout', () => {
    it('shows standard grid before help is tapped', () => {
      mockCpaModeResult = { stage: 'abstract', manipulativeType: null };

      const { queryByTestId, getAllByTestId } = render(
        <CpaSessionContent {...baseProps} />,
      );

      expect(queryByTestId('compact-answer-row')).toBeNull();
      expect(getAllByTestId(/^answer-option-/)).toHaveLength(4);
    });
  });
});
