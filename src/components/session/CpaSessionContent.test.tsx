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

      // "Need help?" is available (resolves via getPrimaryManipulative)
      expect(getByTestId('need-help-button')).toBeTruthy();
    });
  });

  describe('concrete mode', () => {
    it('shows "Need help?" and no panel by default', () => {
      mockCpaModeResult = { stage: 'concrete', manipulativeType: 'counters' };

      const { getByTestId, queryByTestId } = render(
        <CpaSessionContent {...baseProps} />,
      );

      // Panel not visible until help requested
      expect(queryByTestId('manipulative-panel')).toBeNull();
      expect(getByTestId('need-help-button')).toBeTruthy();
    });

    it('"Need help?" expands ManipulativePanel and shows CompactAnswerRow', () => {
      mockCpaModeResult = { stage: 'concrete', manipulativeType: 'counters' };

      const { getByTestId, queryAllByTestId } = render(
        <CpaSessionContent {...baseProps} />,
      );

      fireEvent.press(getByTestId('need-help-button'));

      expect(getByTestId('manipulative-panel')).toBeTruthy();
      expect(getByTestId('panel-expanded').props.children).toBe('true');
      expect(getByTestId('compact-answer-row')).toBeTruthy();
      expect(queryAllByTestId(/^answer-option-/)).toHaveLength(0);
    });
  });

  describe('pictorial mode', () => {
    it('renders PictorialDiagram and "Need help?" button', () => {
      mockCpaModeResult = {
        stage: 'pictorial',
        manipulativeType: 'counters',
      };

      const { getByTestId, getByText } = render(
        <CpaSessionContent {...baseProps} />,
      );

      expect(getByTestId('pictorial-diagram')).toBeTruthy();
      expect(getByText('Show me!')).toBeTruthy();
      expect(getByTestId('need-help-button')).toBeTruthy();
    });

    it('"Need help?" button triggers panel expansion', () => {
      mockCpaModeResult = {
        stage: 'pictorial',
        manipulativeType: 'counters',
      };

      const { getByTestId, queryByTestId } = render(
        <CpaSessionContent {...baseProps} />,
      );

      // Panel should not be visible initially
      expect(queryByTestId('manipulative-panel')).toBeNull();

      // Tap "Need help?"
      fireEvent.press(getByTestId('need-help-button'));

      // Now panel should be visible and expanded
      expect(getByTestId('manipulative-panel')).toBeTruthy();
      expect(getByTestId('panel-expanded').props.children).toBe('true');
    });

    it('shows CompactAnswerRow after "Need help?" activates panel', () => {
      mockCpaModeResult = {
        stage: 'pictorial',
        manipulativeType: 'counters',
      };

      const { getByTestId, queryByTestId } = render(
        <CpaSessionContent {...baseProps} />,
      );

      // Standard grid before help
      expect(queryByTestId('compact-answer-row')).toBeNull();

      // Tap "Need help?"
      fireEvent.press(getByTestId('need-help-button'));

      // CompactAnswerRow appears
      expect(getByTestId('compact-answer-row')).toBeTruthy();
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
